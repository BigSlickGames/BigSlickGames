export function calculateRowTotal(gridPositions: any[], rowIndex: number): number {
  const startIndex = rowIndex * 6;
  const rowPositions = gridPositions.slice(startIndex + 1, startIndex + 6);
  
  let total = 0;
  let aceCount = 0;
  
  rowPositions.forEach(position => {
    if (!position) return;
    if (position.card.rank === 'A') {
      // Use the actual value set for the Ace (1 or 11)
      total += position.card.value;
      aceCount++;
    } else {
      total += position.card.value;
    }
  });

  return total;
}

export function calculateColumnTotal(gridPositions: any[], colIndex: number): number {
  const columnPositions = Array.from({ length: 5 }, (_, row) => gridPositions[(row + 1) * 6 + colIndex]);
  
  let total = 0;
  let aceCount = 0;
  
  columnPositions.forEach(position => {
    if (!position) return;
    if (position.card.rank === 'A') {
      // Use the actual value set for the Ace (1 or 11)
      total += position.card.value;
      aceCount++;
    } else {
      total += position.card.value;
    }
  });

  return total;
}

export function getTotalSpaceImage(total: number): string {
  if (total === 21) return "/images/21-stackem-total-space-green.png";
  if (total > 21) return "/images/21-stackem-total-space-red.png";
  return "/images/21-stackem-total-space.png";
}