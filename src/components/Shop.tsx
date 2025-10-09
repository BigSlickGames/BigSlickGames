import React, { useState } from "react";
import {
  ShoppingCart,
  Coins,
  Star,
  Zap,
  Crown,
  Gem,
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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
  // ... (unchanged chipPackages array)
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
  const [testAmount, setTestAmount] = useState(1000);

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

  const handlePurchase = async (item: ShopItem) => {
    setLoading(true);
    try {
      const newChipAmount = profile.chips + item.chip_amount;
      const success = await updateChipsInDatabase(newChipAmount);

      if (success) {
        onPurchase(newChipAmount);
        setPurchaseSuccess(
          `Successfully added ${item.chip_amount.toLocaleString()} chips from ${
            item.name
          }!`
        );
        setTimeout(() => setPurchaseSuccess(null), 3000);
      } else {
        throw new Error("Failed to update chips");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchaseSuccess("Purchase failed. Please try again.");
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAdd = async () => {
    setLoading(true);
    try {
      const newChipAmount = profile.chips + testAmount;
      const success = await updateChipsInDatabase(newChipAmount);

      if (success) {
        onPurchase(newChipAmount);
        setPurchaseSuccess(`Added ${testAmount.toLocaleString()} chips (Test)`);
        setTimeout(() => setPurchaseSuccess(null), 2000);
      }
    } catch (error) {
      console.error("Test add failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRemove = async () => {
    setLoading(true);
    try {
      const newChipAmount = Math.max(0, profile.chips - testAmount);
      const success = await updateChipsInDatabase(newChipAmount);

      if (success) {
        onPurchase(newChipAmount);
        setPurchaseSuccess(
          `Removed ${testAmount.toLocaleString()} chips (Test)`
        );
        setTimeout(() => setPurchaseSuccess(null), 2000);
      }
    } catch (error) {
      console.error("Test remove failed:", error);
    } finally {
      setLoading(false);
    }
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

      {/* Test Controls */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 shadow-lg">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-blue-400 text-sm font-medium">
              Testing Mode
            </span>
          </div>
          <p className="text-gray-300 text-sm">
            Add or remove chips for testing purposes.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <label htmlFor="test-amount" className="text-gray-300 text-sm">
              Test Amount:
            </label>
            <input
              id="test-amount"
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="bg-gray-700/50 border border-gray-600/50 rounded-md px-3 py-2 text-white w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              step="100"
              aria-label="Test chip amount"
            />
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleTestAdd}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              aria-label="Add test chips"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chips</span>
            </button>

            <button
              onClick={handleTestRemove}
              disabled={loading}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              aria-label="Remove test chips"
            >
              <Minus className="w-4 h-4" />
              <span>Remove Chips</span>
            </button>
          </div>

          <div className="text-sm text-gray-300">
            Current Balance:{" "}
            <span className="text-amber-400 font-medium">
              {profile.chips.toLocaleString()}
            </span>{" "}
            chips
          </div>
        </div>
      </div>

      {/* Purchase Feedback */}
      {purchaseSuccess && (
        <div
          className={`border rounded-xl p-4 text-center shadow-md ${
            purchaseSuccess.includes("failed")
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-green-500/10 border-green-500/30 text-green-300"
          }`}
        >
          <p className="font-medium">{purchaseSuccess}</p>
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

                  <div className="text-lg font-semibold text-gray-400 line-through">
                    ${item.price_real_money}
                  </div>

                  <div className="text-green-400 text-sm font-medium">
                    Free (Testing Mode)
                  </div>

                  <div className="text-gray-400 text-xs">
                    {Math.round(
                      item.chip_amount / item.price_real_money
                    ).toLocaleString()}{" "}
                    chips per $1
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${colorClass} text-white py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 flex items-center justify-center space-x-2`}
                  aria-label={`Purchase ${item.name}`}
                >
                  {loading ? (
                    <div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    ></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Get Free Chips</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center shadow-lg">
        <h3 className="text-lg font-semibold text-white">Development Mode</h3>
        <p className="text-gray-400 text-sm mt-2">
          Payment integration is under development. All chips are currently free
          for testing.
        </p>
        <div className="flex justify-center space-x-4 text-gray-400 text-xs mt-4">
          <span>🔒 SSL Ready</span>
          <span>💳 Stripe Integration Pending</span>
          <span>🛡️ PCI Compliant</span>
        </div>
      </div>
    </div>
  );
}
