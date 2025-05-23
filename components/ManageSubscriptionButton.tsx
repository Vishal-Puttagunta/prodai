import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageSubscription}
      disabled={loading}
      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50 transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          <span>Manage Subscription</span>
        </>
      )}
    </button>
  );
} 