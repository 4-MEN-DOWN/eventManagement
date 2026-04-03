import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getSubscriptionDetails,
  cancelSubscription,
} from "../redux/slices/subscriptionSlice";

export function ManageSubscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { subscription, paymentHistory, loading } = useSelector(
    (state) => state.subscriptions
  );
  console.log(subscription);
  useEffect(() => {
    dispatch(getSubscriptionDetails());
  }, [dispatch]);

  const handleCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscription()).unwrap();
      toast.success("Subscription cancelled successfully");
      setShowCancelModal(false);
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case "basic":
        return "bg-gray-100 text-gray-800";
      case "premium":
        return "bg-purple-100 text-purple-800";
      case "platinum":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShortTransactionId = (transactionId) => {
    return transactionId?.split("?")[0] || transactionId;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isPremiumOrPlatinumActive =
    subscription?.status === "active" &&
    (subscription?.plan === "premium" || subscription?.plan === "platinum");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Subscription Management
          </h1>
          <p className="text-xl text-gray-600">
            Manage your subscription and payment history
          </p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Crown className="w-8 h-8 text-purple-600" />
            Current Subscription
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Plan details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Plan Details
              </h3>
              <div className="space-y-2">
                <p className="flex justify-between">
                  <span className="text-gray-600">Current Plan:</span>
                  <span
                    className={`font-semibold capitalize px-2 py-1 rounded-md ${getPlanColor(
                      subscription?.plan || user?.subscription
                    )}`}
                  >
                    {subscription?.plan || user?.subscription}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      subscription?.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {subscription?.status || "inactive"}
                  </span>
                </p>
                {subscription?.expiry && (
                  <p className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-semibold">
                      {formatDate(subscription.expiry)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Actions
              </h3>
              <div className="space-y-3">
                {isPremiumOrPlatinumActive ? (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/subscription")}
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Plan Warning */}
          {subscription?.plan === "basic" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-1">
                  Basic Plan Limitations
                </h4>
                <p className="text-yellow-700 text-sm">
                  You're currently on the Basic plan which has limitations on
                  event creation and features. Upgrade to unlock full
                  capabilities.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Payment History
          </h2>

          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Transaction ID</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">{formatDate(payment.date)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPlanColor(
                            payment.plan
                          )}`}
                        >
                          {payment.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <IndianRupee />
                        {payment.amount}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">
                        {getShortTransactionId(payment.transactionId)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No payment history found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-96">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Cancel Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your current subscription? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
