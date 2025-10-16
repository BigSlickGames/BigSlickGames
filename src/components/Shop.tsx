import React, { useState } from "react";
import {
  ShoppingCart,
  Coins,
  Star,
  Zap,
  Crown,
  Gem,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import StripeWrapper from "./StripeWrapper";
import CheckoutForm from "./CheckoutForm";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  chips: number;
  created_at: string;
  country?: string | null;
  level?: number;
  experience?: number;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  item_type: string;
  price_real_money: number;
  chip_amount: number;
  image_url?: string;
  sort_order: number;
  popular?: boolean;
  bonus_percentage?: number;
}

interface ShopProps {
  profile: UserProfile;
  onPurchase: (newChipAmount: number) => void;
  onBack: () => void;
}

const chipPackages: ShopItem[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Starter Pack",
    description: "Perfect for beginners",
    item_type: "chips",
    price_real_money: 0.99,
    chip_amount: 1000,
    sort_order: 1,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Value Pack",
    description: "Most popular choice",
    item_type: "chips",
    price_real_money: 4.99,
    chip_amount: 5000,
    sort_order: 2,
    popular: true,
    bonus_percentage: 10,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Premium Pack",
    description: "Great value for serious players",
    item_type: "chips",
    price_real_money: 9.99,
    chip_amount: 12000,
    sort_order: 3,
    bonus_percentage: 20,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Mega Pack",
    description: "Maximum chips for pros",
    item_type: "chips",
    price_real_money: 19.99,
    chip_amount: 25000,
    sort_order: 4,
    bonus_percentage: 25,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Ultimate Pack",
    description: "The ultimate gaming experience",
    item_type: "chips",
    price_real_money: 49.99,
    chip_amount: 75000,
    sort_order: 5,
    bonus_percentage: 50,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Legendary Pack",
    description: "For the ultimate high roller",
    item_type: "chips",
    price_real_money: 99.99,
    chip_amount: 200000,
    sort_order: 6,
    bonus_percentage: 100,
  },
];

const getPackageIcon = (name: string) => {
  if (name.includes("Starter")) return Coins;
  if (name.includes("Value")) return Star;
  if (name.includes("Premium")) return Zap;
  if (name.includes("Mega")) return Crown;
  if (name.includes("Ultimate")) return Gem;
  if (name.includes("Legendary")) return Crown;
  return Coins;
};

const getPackageColor = (name: string) => {
  if (name.includes("Starter")) return "from-gray-600 to-gray-700";
  if (name.includes("Value")) return "from-blue-600 to-blue-700";
  if (name.includes("Premium")) return "from-indigo-600 to-indigo-700";
  if (name.includes("Mega")) return "from-violet-600 to-violet-700";
  if (name.includes("Ultimate")) return "from-amber-600 to-amber-700";
  if (name.includes("Legendary")) return "from-purple-600 to-purple-700";
  return "from-gray-600 to-gray-700";
};

export default function Shop({ profile, onPurchase, onBack }: ShopProps) {
  const [loading, setLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<ShopItem | null>(null);

  // Your Stripe Payment Link (same for all packages for now)
  const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cI5kC0TTbqQdvkecC8IU00";

  const updateChipsInDatabase = async (newChipAmount: number) => {
    try {
      const { error } = await supabase
        .from("user_wallet")
        .update({
          chips: newChipAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.id);

      if (error) throw error;
      console.log("✅ Chips updated successfully in database:", newChipAmount);
      return true;
    } catch (error) {
      console.error("❌ Failed to update chips:", error);
      return false;
    }
  };

  const handleBuyNowClick = (item: ShopItem) => {
    setCheckoutItem(item);
    setShowCheckoutOptions(true);
  };

  const handleInAppCheckout = async () => {
    if (!checkoutItem) return;

    setLoading(true);
    setShowCheckoutOptions(false);

    try {
      const response = await fetch(
        "http://localhost:3001/api/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: checkoutItem.price_real_money,
            itemId: checkoutItem.id,
            userId: profile.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setSelectedItem(checkoutItem);
    } catch (error) {
      console.error("Failed to initiate purchase:", error);
      setPurchaseSuccess("Failed to start payment. Please try again.");
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleStripePageCheckout = () => {
    if (!checkoutItem) return;

    // Map each package to its specific Stripe payment link
    const paymentLinks: { [key: string]: string } = {
      "550e8400-e29b-41d4-a716-446655440001":
        "https://buy.stripe.com/3cI5kC0TTbqQdvkecC8IU00", // 1000 chips - $0.99
      "550e8400-e29b-41d4-a716-446655440002":
        "https://buy.stripe.com/5kQcN4aut3Yo76WgkK8IU01", // 5000 chips - $4.99
      "550e8400-e29b-41d4-a716-446655440003":
        "https://buy.stripe.com/28E28q465fH6crg1pQ8IU02", // 12000 chips - $9.99
      "550e8400-e29b-41d4-a716-446655440004":
        "https://buy.stripe.com/9B6dR87ihamM76W6Ka8IU03", // 25000 chips - $19.99
      "550e8400-e29b-41d4-a716-446655440005":
        "https://buy.stripe.com/7sY9ASbyx7aA62Sd8y8IU04", // 75000 chips - $49.99
      "550e8400-e29b-41d4-a716-446655440006":
        "https://buy.stripe.com/00w14m5a9gLa0Iy0lM8IU05", // 200000 chips - $99.99
    };

    // Get the specific payment link for this package
    const paymentUrl = paymentLinks[checkoutItem.id];

    if (!paymentUrl) {
      console.error("Payment link not found for item:", checkoutItem.id);
      setPurchaseSuccess("Payment link not configured. Please try again.");
      setTimeout(() => setPurchaseSuccess(null), 3000);
      return;
    }

    // Add user tracking parameters to the Payment Link
    const urlWithParams = `${paymentUrl}?client_reference_id=${profile.id}&prefilled_email=${encodeURIComponent(profile.email)}`;

    // Redirect to Stripe-hosted checkout page
    window.location.href = urlWithParams;
  };

  const handlePaymentSuccess = async () => {
    if (!selectedItem) return;

    try {
      const newChipAmount = profile.chips + selectedItem.chip_amount;
      const success = await updateChipsInDatabase(newChipAmount);

      if (success) {
        onPurchase(newChipAmount);
        setPurchaseSuccess(
          `Successfully purchased ${selectedItem.chip_amount.toLocaleString()} chips!`
        );

        setClientSecret("");
        setSelectedItem(null);

        setTimeout(() => {
          const successPopup = document.getElementById("success-popup");
          if (successPopup) {
            successPopup.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);

        setTimeout(() => setPurchaseSuccess(null), 4000);
      }
    } catch (error) {
      console.error("Failed to update chips after payment:", error);
    }
  };

  const handleCancelPayment = () => {
    setClientSecret("");
    setSelectedItem(null);
  };

  const closeCheckoutOptions = () => {
    setShowCheckoutOptions(false);
    setCheckoutItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans space-y-8 p-4 sm:p-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2"
          aria-label="Back to Games Hub"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back to Games Hub</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white">
          Chip Shop
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Purchase chips to enhance your gaming experience.
        </p>
      </div>

      {/* Checkout Options Modal */}
      {showCheckoutOptions && checkoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Choose Checkout Method
                </h3>
                <p className="text-gray-400 text-sm">
                  {checkoutItem.name} - $
                  {checkoutItem.price_real_money.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                {/* In-App Checkout Button */}
                <button
                  onClick={handleInAppCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Checkout In-App</span>
                    </>
                  )}
                </button>

                {/* Stripe Page Checkout Button */}
                <button
                  onClick={handleStripePageCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Checkout on Stripe</span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={closeCheckoutOptions}
                  disabled={loading}
                  className="w-full bg-gray-700 text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ In-App: Stay on this page, faster checkout</p>
                <p>✓ Stripe Page: Secure Stripe-hosted checkout</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup Modal */}
      {purchaseSuccess && !purchaseSuccess.includes("Failed") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            id="success-popup"
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl animate-in zoom-in duration-300"
          >
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-in zoom-in duration-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                    className="animate-draw"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Payment Successful!
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  {purchaseSuccess}
                </p>
              </div>

              <div className="text-3xl sm:text-4xl animate-bounce">🎉</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {purchaseSuccess && purchaseSuccess.includes("Failed") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-red-500/30 rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Payment Failed
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  {purchaseSuccess}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chipPackages.map((item) => {
          const IconComponent = getPackageIcon(item.name);
          const colorClass = getPackageColor(item.name);

          return (
            <div
              key={item.id}
              className={`relative bg-gray-800/70 border border-gray-700/50 rounded-xl p-6 transition-all hover:shadow-xl hover:shadow-blue-500/10 ${
                item.popular ? "ring-2 ring-blue-500/50" : ""
              }`}
              role="region"
              aria-label={`${item.name} package`}
            >
              {item.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-md">
                    Most Popular
                  </div>
                </div>
              )}

              {item.bonus_percentage && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    +{item.bonus_percentage}% Bonus
                  </div>
                </div>
              )}

              <div className="text-center space-y-4">
                <div
                  className={`mx-auto w-12 h-12 bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-center`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xl font-semibold text-amber-400">
                      {item.chip_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-white">
                    ${item.price_real_money.toFixed(2)}
                  </div>

                  <div className="text-gray-400 text-xs">
                    {Math.round(
                      item.chip_amount / item.price_real_money
                    ).toLocaleString()}{" "}
                    chips per $1
                  </div>
                </div>

                <button
                  onClick={() => handleBuyNowClick(item)}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${colorClass} text-white py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 flex items-center justify-center space-x-2`}
                  aria-label={`Purchase ${item.name}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Checkout Modal (In-App) */}
      {clientSecret && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <StripeWrapper clientSecret={clientSecret}>
            <CheckoutForm
              itemName={selectedItem.name}
              amount={selectedItem.price_real_money}
              chips={selectedItem.chip_amount}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelPayment}
            />
          </StripeWrapper>
        </div>
      )}

      {/* Footer Note */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center shadow-lg">
        <h3 className="text-lg font-semibold text-white">Secure Payments</h3>
        <p className="text-gray-400 text-sm mt-2">
          All transactions are secured by Stripe. Your payment information is
          never stored on our servers.
        </p>
        <div className="flex justify-center space-x-4 text-gray-400 text-xs mt-4">
          <span>🔒 SSL Encrypted</span>
          <span>💳 Stripe Powered</span>
          <span>🛡️ PCI Compliant</span>
        </div>
      </div>
    </div>
  );
}
