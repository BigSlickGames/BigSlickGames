import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CHIP_PACKAGES = {
  "550e8400-e29b-41d4-a716-446655440001": 1000,
  "550e8400-e29b-41d4-a716-446655440002": 5000,
  "550e8400-e29b-41d4-a716-446655440003": 12000,
  "550e8400-e29b-41d4-a716-446655440004": 25000,
  "550e8400-e29b-41d4-a716-446655440005": 75000,
  "550e8400-e29b-41d4-a716-446655440006": 200000,
};

// Amount to chips mapping (for Payment Links)
const AMOUNT_TO_CHIPS = {
  99: 1000,
  499: 5000,
  999: 12000,
  1999: 25000,
  4999: 75000,
  9999: 200000,
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle checkout.session.completed (Payment Link) ✅ NOW UPDATES CHIPS
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const amountTotal = session.amount_total;

      console.log(
        `✅ Checkout completed for user: ${userId}, amount: ${amountTotal}`
      );

      const chipAmount = AMOUNT_TO_CHIPS[amountTotal];

      if (!chipAmount) {
        console.error(`❌ Unknown amount: ${amountTotal}`);
        return res.status(400).json({ error: "Unknown amount" });
      }

      console.log(`💰 Adding ${chipAmount} chips to user ${userId}`);

      const { data: walletData, error: fetchError } = await supabase
        .from("user_wallet")
        .select("chips")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching wallet:", fetchError);
        return res.status(500).json({ error: "Database error" });
      }

      const currentChips = walletData?.chips || 0;
      const newChipAmount = currentChips + chipAmount;

      console.log(`📊 Updating chips: ${currentChips} → ${newChipAmount}`);

      const { error: updateError } = await supabase
        .from("user_wallet")
        .update({
          chips: newChipAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Error updating chips:", updateError);
        return res.status(500).json({ error: "Failed to update chips" });
      }

      console.log(`✅ Successfully updated chips for user ${userId}`);
    }

    // Handle payment_intent.succeeded (In-app checkout)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const itemId = paymentIntent.metadata.itemId;

      console.log(
        `✅ Payment intent succeeded for user: ${userId}, item: ${itemId}`
      );

      const chipAmount = CHIP_PACKAGES[itemId];

      if (!chipAmount) {
        console.error(`❌ Unknown item ID: ${itemId}`);
        return res.status(400).json({ error: "Unknown item" });
      }

      console.log(`💰 Adding ${chipAmount} chips to user ${userId}`);

      const { data: walletData, error: fetchError } = await supabase
        .from("user_wallet")
        .select("chips")
        .eq("user_id", userId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching wallet:", fetchError);
        return res.status(500).json({ error: "Database error" });
      }

      const currentChips = walletData?.chips || 0;
      const newChipAmount = currentChips + chipAmount;

      console.log(`📊 Updating chips: ${currentChips} → ${newChipAmount}`);

      const { error: updateError } = await supabase
        .from("user_wallet")
        .update({
          chips: newChipAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("❌ Error updating chips:", updateError);
        return res.status(500).json({ error: "Failed to update chips" });
      }

      console.log(`✅ Successfully updated chips for user ${userId}`);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.log("❌ Payment failed:", paymentIntent.id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
