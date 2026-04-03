import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, Home } from "lucide-react";

export function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const action = searchParams.get("action");
  const reason = searchParams.get("reason");

  const getFailureContent = () => {
    switch (action) {
      case "addToEventsToAttend":
        return {
          title: "Event Registration Failed",
          message:
            "We couldn't process your event registration payment. Please try again.",
        };

      case "subscription":
        return {
          title: "Subscription Upgrade Failed",
          message:
            "We couldn't process your subscription payment. Please try again.",
        };

      case "adPayment":
        return {
          title: "Ad Payment Failed",
          message:
            "We couldn't process your advertisement payment. Please try again.",
        };

      default:
        return {
          title: "Payment Failed",
          message: "We couldn't process your payment. Please try again.",
        };
    }
  };

  const content = getFailureContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {content.title}
        </h2>
        <p className="text-gray-600 mb-6">{content.message}</p>

        {reason && (
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-red-700">Reason: {reason}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
