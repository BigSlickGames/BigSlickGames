# Forum Admin Panel Integration

This file contains all the SQL queries and API endpoints you need to integrate the forum moderation system into your admin panel.

## Database Tables Overview

### Core Forum Tables
- `forum_categories` - Forum sections/categories
- `forum_threads` - Discussion threads
- `forum_posts` - Posts within threads (including original posts)
- `forum_moderators` - Moderator assignments
- `forum_reports` - User reports for moderation
- `forum_thread_views` - Thread view tracking
- `forum_user_subscriptions` - Thread subscriptions

## Admin Panel Queries

### 1. Forum Statistics Dashboard

```sql
-- Get overall forum statistics
SELECT 
  (SELECT COUNT(*) FROM forum_categories WHERE is_active = true) as active_categories,
  (SELECT COUNT(*) FROM forum_threads WHERE is_deleted = false) as total_threads,
  (SELECT COUNT(*) FROM forum_posts WHERE is_deleted = false) as total_posts,
  (SELECT COUNT(*) FROM profiles WHERE id IN (SELECT DISTINCT user_id FROM forum_posts)) as active_users,
  (SELECT COUNT(*) FROM forum_reports WHERE status = 'pending') as pending_reports;

-- Get daily activity stats (last 30 days)
SELECT 
  DATE(created_at) as date,
  COUNT(CASE WHEN table_name = 'threads' THEN 1 END) as new_threads,
  COUNT(CASE WHEN table_name = 'posts' THEN 1 END) as new_posts
FROM (
  SELECT created_at, 'threads' as table_name FROM forum_threads WHERE created_at >= NOW() - INTERVAL '30 days'
  UNION ALL
  SELECT created_at, 'posts' as table_name FROM forum_posts WHERE created_at >= NOW() - INTERVAL '30 days'
) combined
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 2. Category Management

```sql
-- Get all categories with stats
SELECT 
  c.*,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT m.id) as moderator_count
FROM forum_categories c
LEFT JOIN forum_threads t ON c.id = t.category_id AND t.is_deleted = false
LEFT JOIN forum_posts p ON t.id = p.thread_id AND p.is_deleted = false
LEFT JOIN forum_moderators m ON c.id = m.category_id
GROUP BY c.id
ORDER BY c.sort_order;

-- Create new category
INSERT INTO forum_categories (name, description, slug, sort_order, is_active, moderator_only)
VALUES ($1, $2, $3, $4, $5, $6);

-- Update category
UPDATE forum_categories 
SET name = $1, description = $2, slug = $3, sort_order = $4, is_active = $5, moderator_only = $6, updated_at = now()
WHERE id = $7;

-- Delete category (soft delete by deactivating)
UPDATE forum_categories SET is_active = false WHERE id = $1;
```

### 3. Thread Management

```sql
-- Get threads with moderation info
SELECT 
  t.*,
  p.username as author_username,
  p.email as author_email,
  c.name as category_name,
  COUNT(DISTINCT fp.id) as reply_count,
  COUNT(DISTINCT r.id) as report_count
FROM forum_threads t
JOIN profiles p ON t.user_id = p.id
JOIN forum_categories c ON t.category_id = c.id
LEFT JOIN forum_posts fp ON t.id = fp.thread_id AND fp.is_original_post = false
LEFT JOIN forum_reports r ON t.id = r.reported_thread_id AND r.status = 'pending'
WHERE t.is_deleted = false
GROUP BY t.id, p.username, p.email, c.name
ORDER BY t.created_at DESC
LIMIT 50;

-- Pin/Unpin thread
UPDATE forum_threads SET is_pinned = $1, updated_at = now() WHERE id = $2;

-- Lock/Unlock thread
UPDATE forum_threads SET is_locked = $1, updated_at = now() WHERE id = $2;

-- Delete thread (soft delete)
UPDATE forum_threads SET is_deleted = true, updated_at = now() WHERE id = $1;

-- Move thread to different category
UPDATE forum_threads SET category_id = $1, updated_at = now() WHERE id = $2;
```

### 4. Post Management

```sql
-- Get posts with moderation info
SELECT 
  p.*,
  pr.username as author_username,
  pr.email as author_email,
  t.title as thread_title,
  c.name as category_name,
  COUNT(DISTINCT r.id) as report_count
FROM forum_posts p
JOIN profiles pr ON p.user_id = pr.id
JOIN forum_threads t ON p.thread_id = t.id
JOIN forum_categories c ON t.category_id = c.id
LEFT JOIN forum_reports r ON p.id = r.reported_post_id AND r.status = 'pending'
WHERE p.is_deleted = false
GROUP BY p.id, pr.username, pr.email, t.title, c.name
ORDER BY p.created_at DESC
LIMIT 100;

-- Delete post (soft delete)
UPDATE forum_posts SET is_deleted = true, updated_at = now() WHERE id = $1;

-- Edit post content
UPDATE forum_posts 
SET content = $1, content_html = $2, is_edited = true, edit_count = edit_count + 1, last_edited_at = now()
WHERE id = $3;
```

### 5. User Reports Management

```sql
-- Get pending reports
SELECT 
  r.*,
  reporter.username as reporter_username,
  reported_user.username as reported_username,
  t.title as thread_title,
  p.content as post_content,
  c.name as category_name
FROM forum_reports r
LEFT JOIN profiles reporter ON r.reporter_user_id = reporter.id
LEFT JOIN profiles reported_user ON r.reported_user_id = reported_user.id
LEFT JOIN forum_threads t ON r.reported_thread_id = t.id
LEFT JOIN forum_posts p ON r.reported_post_id = p.id
LEFT JOIN forum_threads t2 ON p.thread_id = t2.id
LEFT JOIN forum_categories c ON COALESCE(t.category_id, t2.category_id) = c.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Update report status
UPDATE forum_reports 
SET status = $1, moderator_id = $2, moderator_notes = $3, resolved_at = now()
WHERE id = $4;

-- Get report statistics
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_week
FROM forum_reports 
GROUP BY status;
```

### 6. Moderator Management

```sql
-- Get all moderators with their permissions
SELECT 
  m.*,
  p.username,
  p.email,
  c.name as category_name,
  assigned_by_user.username as assigned_by_username
FROM forum_moderators m
JOIN profiles p ON m.user_id = p.id
JOIN forum_categories c ON m.category_id = c.id
LEFT JOIN profiles assigned_by_user ON m.assigned_by = assigned_by_user.id
ORDER BY c.name, p.username;

-- Add new moderator
INSERT INTO forum_moderators (
  user_id, category_id, assigned_by, 
  can_edit_posts, can_delete_posts, can_lock_threads, can_pin_threads, can_ban_users
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- Update moderator permissions
UPDATE forum_moderators 
SET can_edit_posts = $1, can_delete_posts = $2, can_lock_threads = $3, 
    can_pin_threads = $4, can_ban_users = $5
WHERE id = $6;

-- Remove moderator
DELETE FROM forum_moderators WHERE id = $1;
```

### 7. User Management

```sql
-- Get active forum users with stats
SELECT 
  p.id,
  p.username,
  p.email,
  p.created_at as joined_date,
  COUNT(DISTINCT t.id) as threads_created,
  COUNT(DISTINCT fp.id) as posts_made,
  COUNT(DISTINCT r.id) as reports_against,
  MAX(fp.created_at) as last_post_date
FROM profiles p
LEFT JOIN forum_threads t ON p.id = t.user_id AND t.is_deleted = false
LEFT JOIN forum_posts fp ON p.id = fp.user_id AND fp.is_deleted = false
LEFT JOIN forum_reports r ON p.id = r.reported_user_id
GROUP BY p.id, p.username, p.email, p.created_at
HAVING COUNT(DISTINCT fp.id) > 0
ORDER BY posts_made DESC;

-- Ban user from forum (add to profiles table if needed)
UPDATE profiles SET is_banned = true, ban_reason = $1, banned_at = now(), banned_by = $2 WHERE id = $3;

-- Unban user
UPDATE profiles SET is_banned = false, ban_reason = null, banned_at = null, banned_by = null WHERE id = $1;
```

## API Endpoints for Admin Panel

### Authentication Check
```javascript
// Check if user is admin
const checkAdminStatus = async (userId) => {
  const { data } = await supabase
    .from('profiles')
    .select('email, username')
    .eq('id', userId)
    .single();
    
  return data?.email?.includes('@admin.') || 
         data?.email === 'admin@gamehub.com' || 
         data?.username === 'admin';
};
```

### Forum Statistics
```javascript
// Get forum dashboard stats
const getForumStats = async () => {
  const { data } = await supabase.rpc('get_forum_stats');
  return data;
};
```

### Moderation Actions
```javascript
// Pin/Unpin thread
const toggleThreadPin = async (threadId, isPinned) => {
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_pinned: isPinned })
    .eq('id', threadId);
  return !error;
};

// Lock/Unlock thread
const toggleThreadLock = async (threadId, isLocked) => {
  const { error } = await supabase
    .from('forum_threads')
    .update({ is_locked: isLocked })
    .eq('id', threadId);
  return !error;
};

// Delete post
const deletePost = async (postId) => {
  const { error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true })
    .eq('id', postId);
  return !error;
};

// Resolve report
const resolveReport = async (reportId, status, moderatorId, notes) => {
  const { error } = await supabase
    .from('forum_reports')
    .update({ 
      status, 
      moderator_id: moderatorId, 
      moderator_notes: notes,
      resolved_at: new Date().toISOString()
    })
    .eq('id', reportId);
  return !error;
};
```

## Admin Panel UI Components

### 1. Forum Dashboard Widget
```html
<div class="forum-stats-widget">
  <h3>Forum Overview</h3>
  <div class="stats-grid">
    <div class="stat-item">
      <span class="stat-number">{totalThreads}</span>
      <span class="stat-label">Active Threads</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{totalPosts}</span>
      <span class="stat-label">Total Posts</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{pendingReports}</span>
      <span class="stat-label">Pending Reports</span>
    </div>
    <div class="stat-item">
      <span class="stat-number">{activeUsers}</span>
      <span class="stat-label">Active Users</span>
    </div>
  </div>
</div>
```

### 2. Reports Management Table
```html
<table class="reports-table">
  <thead>
    <tr>
      <th>Reporter</th>
      <th>Content</th>
      <th>Reason</th>
      <th>Date</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <!-- Loop through reports -->
    <tr>
      <td>{report.reporter_username}</td>
      <td>{report.thread_title || report.post_content}</td>
      <td>{report.reason}</td>
      <td>{report.created_at}</td>
      <td><span class="status-{report.status}">{report.status}</span></td>
      <td>
        <button onclick="resolveReport('{report.id}', 'resolved')">Resolve</button>
        <button onclick="resolveReport('{report.id}', 'dismissed')">Dismiss</button>
      </td>
    </tr>
  </tbody>
</table>
```

### 3. Thread Management Actions
```html
<div class="thread-actions">
  <button onclick="togglePin('{thread.id}', {!thread.is_pinned})">
    {thread.is_pinned ? 'Unpin' : 'Pin'} Thread
  </button>
  <button onclick="toggleLock('{thread.id}', {!thread.is_locked})">
    {thread.is_locked ? 'Unlock' : 'Lock'} Thread
  </button>
  <button onclick="deleteThread('{thread.id}')" class="danger">
    Delete Thread
  </button>
  <select onchange="moveThread('{thread.id}', this.value)">
    <option value="">Move to Category...</option>
    <!-- Loop through categories -->
    <option value="{category.id}">{category.name}</option>
  </select>
</div>
```

## Integration Steps

1. **Run the migration** to create all forum tables
2. **Import the SQL queries** into your admin panel backend
3. **Add the API endpoints** to your admin panel API
4. **Create the UI components** using your existing admin panel framework
5. **Set up real-time subscriptions** for live updates on reports and new content
6. **Configure permissions** to ensure only admins can access moderation features

## Security Notes

- All moderation actions are logged with timestamps and moderator IDs
- RLS policies ensure users can only see appropriate content
- Admin status is checked via email patterns or explicit admin flags
- All user inputs should be sanitized before database operations
- Consider rate limiting for moderation actions to prevent abuse

This system provides comprehensive forum moderation capabilities while maintaining security and performance.