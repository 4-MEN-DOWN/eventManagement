import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader, XCircle } from "lucide-react";
import { toast } from "sonner"; // Changed from react-toastify
import { verifySubscriptionPayment } from "../redux/slices/subscriptionSlice";

export function SubscriptionPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { paymentProcessing, error } = useSelector(
    (state) => state.subscriptions
  );
  const { user } = useSelector((state) => state.auth);

  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  const plan = searchParams.get("plan");
  const transactionId = searchParams.get("transactionId");
  const action = searchParams.get("action");
  const cleanTransactionId = transactionId?.split("?")[0] || transactionId;

  useEffect(() => {
    // Check if we have all required parameters
    if (!action || !plan) {
      setStatus("error");
      setMessage("Missing payment information. Please contact support.");
      return;
    }

    if (action !== "subscription") {
      setStatus("error");
      setMessage("Invalid payment action.");
      return;
    }

    // Process the subscription payment
    const processSubscriptionPayment = async () => {
      try {
        console.log("Processing subscription payment:", {
          plan,
          transactionId,
        });

        const result = await dispatch(
          verifySubscriptionPayment({ transactionId: cleanTransactionId, plan })
        ).unwrap();

        console.log("Payment processing result:", result);

        setStatus("success");
        setMessage("Subscription upgraded successfully!");

        // Show success toast
        toast.success("Subscription upgraded successfully!", {
          duration: 4000,
          description: `You are now on the ${plan} plan`,
        });

        // Redirect to subscription page after a delay
        setTimeout(() => {
          navigate("/subscription");
        }, 3000);
      } catch (error) {
        console.error("Error processing subscription payment:", error);
        setStatus("error");
        setMessage(
          error ||
            "Payment was successful but there was an error updating your subscription."
        );

        // Show error toast
        toast.error("Payment processing failed", {
          duration: 5000,
          description: error || "Please contact support",
        });
      }
    };

    processSubscriptionPayment();
  }, [dispatch, action, plan, transactionId, navigate, cleanTransactionId]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => navigate("/subscription")}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Subscription
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-4">{message}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">
              Transaction Details
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Plan:</strong> {plan}
              </p>
              {cleanTransactionId && (
                <p>
                  <strong>Transaction ID:</strong> {cleanTransactionId}
                </p>
              )}
              <p>
                <strong>Status:</strong> Completed
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Redirecting to subscription page...
          </p>

          <div className="flex justify-center">
            <Loader className="w-6 h-6 animate-spin text-green-600" />
          </div>
        </div>
      </div>
    );
  }

  // Default processing state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Processing Payment...
        </h1>
        <p className="text-gray-600">
          Verifying your {plan} plan subscription. Please wait.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mt-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-3">
            Transaction Details
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>Plan:</strong> {plan}
            </p>
            {cleanTransactionId && (
              <p>
                <strong>Transaction ID:</strong> {cleanTransactionId}
              </p>
            )}
            <p>
              <strong>Status:</strong> Processing...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
