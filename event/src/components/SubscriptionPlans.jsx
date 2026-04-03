import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { toast } from "sonner";
import {
  Check,
  Crown,
  Zap,
  Star,
  X,
  CreditCard,
  Shield,
  Plus,
  Minus,
  IndianRupee,
} from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CreateEventModal } from "./CreateEventModal";
import {
  getSubscriptionDetails,
  verifySubscriptionPayment,
  resetSubscriptionState,
} from "../redux/slices/subscriptionSlice";

export const SubscriptionPlans = ({ isModal = false, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const subscription = useSelector((state) => state.subscriptions.subscription);
  const analytics = useSelector((state) => state.subscriptions.analytics);
  const users = useSelector((state) => state.subscriptions.allUsers) || [];
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [planQuantity, setPlanQuantity] = useState(1);

  // For Create Event modal
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventToOrganize, setEventToOrganize] = useState(null);

  // eSewa sandbox config
  const esewaConfig = {
    merchantId: "EPAYTEST",
    baseUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    secretKey: "8gBm/:&EnhH.1/q",
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      duration: "forever",
      features: [
        "Allows only one event creation",
        "Basic event management",
        "Email support",
        "Up to 50 attendees per event",
        "Can Submit only Single Ad Request",
      ],
      icon: <Star className="h-6 w-6 text-blue-500" />,
      current: false, // Will be set dynamically
    },
    {
      id: "premium",
      name: "Premium",
      price: 1000,
      duration: "month",
      features: [
        "Create up to 5 events",
        "Advanced analytics",
        "Priority support",
        "Up to 200 attendees per event",
        "Custom registration forms",
        "Can Submit 3 Ad Request",
      ],
      icon: <Zap className="h-6 w-6 text-purple-500" />,
      current: false, // Will be set dynamically
    },
    {
      id: "platinum",
      name: "Platinum",
      price: 2000,
      duration: "month",
      features: [
        "Create up to 10 events",
        "Full analytics dashboard",
        "24/7 dedicated support",
        "Unlimited attendees",
        "Custom branding",
        "Early access to new features",
        "Can Submit 5 Ad Request",
      ],
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      current: false, // Will be set dynamically
    },
  ];

  // Enhanced data synchronization
  useEffect(() => {
    if (user) {
      console.log("User changed, fetching subscription data for:", user._id);
      dispatch(getSubscriptionDetails());
    }
  }, [dispatch, user]);

  // Safety check: Clear subscription data if user logs out
  useEffect(() => {
    if (!user && subscription) {
      console.log("User logged out, clearing subscription state");
      dispatch(resetSubscriptionState());
    }
  }, [user, subscription, dispatch]);

  // Get the actual subscription to display - with fallback
  const getDisplaySubscription = () => {
    // Priority: Detailed subscription data > Auth user subscription > Default
    if (subscription) {
      return subscription;
    }

    if (user?.subscription) {
      // Fallback to auth user data if detailed subscription not loaded yet
      return {
        plan: user.subscription,
        status: user.subscriptionStatus || "active",
        expiry: user.subscriptionExpiry,
      };
    }

    // Default fallback
    return {
      plan: "basic",
      status: "active",
      expiry: null,
    };
  };

  const displaySubscription = getDisplaySubscription();

  // Update plans with current subscription status
  const updatedPlans = plans.map((plan) => ({
    ...plan,
    current: displaySubscription?.plan === plan.id,
  }));

  const calculateTotalAmount = () => {
    if (!selectedPlan) return 0;
    const plan = updatedPlans.find((p) => p.id === selectedPlan);
    const price = parseFloat(plan.price) || 0;
    return (price * planQuantity).toFixed(2);
  };

  const incrementQuantity = () => {
    setPlanQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (planQuantity > 1) {
      setPlanQuantity((prev) => prev - 1);
    }
  };

  // ---------- Payment Logic ----------
  const generateSignature = (data) => {
    const message = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
    const hash = CryptoJS.HmacSHA256(message, esewaConfig.secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
  };

  const initiatePayment = () => {
    if (!selectedPlan) return;
    setPaymentProcessing(true);

    const plan = updatedPlans.find((p) => p.id === selectedPlan);
    if (!plan) {
      toast.error("Invalid plan selected");
      setPaymentProcessing(false);
      return;
    }

    const transactionId = `SUB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const successUrl = `${window.location.origin}/payment-success?action=subscription&plan=${selectedPlan}&quantity=${planQuantity}&transactionId=${transactionId}`;
    const failureUrl = `${window.location.origin}/payment-failure?action=subscription`;

    const paymentData = {
      amount: calculateTotalAmount(),
      tax_amount: 0,
      total_amount: calculateTotalAmount(),
      transaction_uuid: transactionId,
      product_code: "EPAYTEST",
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      merchant_id: esewaConfig.merchantId,
    };

    paymentData.signature = generateSignature(paymentData);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaConfig.baseUrl;

    Object.keys(paymentData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    setPaymentProcessing(false);
    setShowPaymentModal(false);
  };

  const handlePlanSelect = (planId) => {
    if (displaySubscription?.plan === planId) {
      if (planId === "basic") {
        toast.info("You are already on the Basic plan!", {
          description: "Enjoy creating up to 3 events",
        });
      } else {
        toast.info(`You are already on the ${planId} plan!`);
      }
      return;
    }

    if (planId === "basic") {
      handleFreePlanUpgrade();
      return;
    }

    if (
      displaySubscription?.plan === "premium" ||
      displaySubscription?.plan === "platinum"
    ) {
      toast.error(
        "You must cancel your current subscription before upgrading."
      );
      return;
    }

    setSelectedPlan(planId);
    setPlanQuantity(1);
    setShowPaymentModal(true);
  };

  const handleFreePlanUpgrade = async () => {
    try {
      const transactionId = `FREE${Date.now()}`;

      await dispatch(
        verifySubscriptionPayment({
          transactionId,
          plan: "basic",
        })
      ).unwrap();

      toast.success("Welcome to Basic Plan!", {
        description: "You can now create up to 3 events",
        duration: 4000,
      });

      setShowPaymentModal(false);
      dispatch(getSubscriptionDetails());
    } catch (error) {
      console.error("Error updating to free plan:", error);
      toast.error("Failed to update subscription", {
        description: "Please try again later",
      });
    }
  };

  const handleManageSubscription = () => navigate("/subscription/manage");

  // ---------- Navbar Handler for Create Event ----------
  const handleOpenCreateEventModal = () => {
    setEventToOrganize({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      price: "",
    });
    setShowCreateEventModal(true);
  };

  // --------- UI Content ----------
  const SubscriptionContent = (
    <div
      className={
        isModal
          ? "p-6"
          : "py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50"
      }
    >
      <div className={isModal ? "" : "max-w-7xl mx-auto"}>
        {/* Current Plan Info */}
        {displaySubscription && (
          <div className="mb-8 bg-white shadow-md rounded-xl p-6 text-center border border-purple-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Current Plan:{" "}
              <span className="capitalize text-purple-600">
                {displaySubscription.plan}
              </span>
            </h3>
            <p className="text-gray-600 mb-3">
              Status:{" "}
              <span className="font-medium">{displaySubscription.status}</span>
              {displaySubscription.expiry && (
                <>
                  {" | Expires on: "}
                  <span className="font-medium">
                    {new Date(displaySubscription.expiry).toLocaleDateString()}
                  </span>
                </>
              )}
            </p>
            {displaySubscription.plan !== "basic" && (
              <button
                onClick={handleManageSubscription}
                className="py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors cursor-pointer"
              >
                Manage Subscription
              </button>
            )}
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upgrade your account to unlock powerful features and create amazing
            events
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {updatedPlans.map((plan) => {
            const isCurrent = plan.current;
            const isPaidPlan = plan.id !== "basic";
            const hasPaidSubscription =
              displaySubscription?.plan === "premium" ||
              displaySubscription?.plan === "platinum";
            const disabled =
              isCurrent ||
              (hasPaidSubscription &&
                isPaidPlan &&
                displaySubscription?.plan !== plan.id);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 ${
                  isCurrent
                    ? "border-purple-500 bg-white transform scale-105"
                    : "border-gray-200 bg-white hover:shadow-xl hover:border-purple-300"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                )}
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center mb-6 space-x-1">
                  <IndianRupee className="w-5 h-5 text-yellow-600" />
                  <span className=" text-2xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.duration}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={disabled}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    disabled
                      ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 cursor-pointer"
                  }`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : disabled && hasPaidSubscription
                    ? "Cancel Current Plan to Upgrade"
                    : plan.price === 0
                    ? "Continue with Basic"
                    : "Upgrade Now"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-scaleIn relative">
            {/* Enhanced Close Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute cursor-pointer top-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 group ring-2 ring-white/20 hover:ring-white/30"
            >
              <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              {/* Hover tooltip */}
              <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Close
              </span>
            </button>

            {/* eSewa Header */}
            <div className="bg-gradient-to-r from-[#34d399] to-[#059669] p-6 text-white pt-16">
              <div className="flex items-center gap-5 mb-4">
                <div>
                  <img
                    src="https://esewa.com.np/common/images/esewa-logo.png"
                    alt="eSewa"
                    style={{ width: "100px", height: "auto" }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">eSewa Payment</h3>
                  <p className="text-green-100 text-sm">
                    Secure Digital Wallet
                  </p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-50 text-sm mb-2">Paying for</p>
                <p className="font-semibold text-lg truncate">
                  {updatedPlans.find((p) => p.id === selectedPlan)?.name} Plan
                  Subscription
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Plan Duration Selector */}
              <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  Subscription Duration
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-700 text-sm">
                    Number of Months:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={decrementQuantity}
                      disabled={planQuantity <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg text-green-700">
                      {planQuantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all duration-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Price Breakdown */}
                <div className="space-y-2 bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Price per Month:</span>
                    <span className="flex font-medium items-center justify-between">
                      <IndianRupee size={13} />
                      {updatedPlans.find((p) => p.id === selectedPlan)?.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">
                      {planQuantity} month{planQuantity > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Service Fee:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-sm">
                      Total:
                    </span>
                    <span className="flex items-center justify-center ali text-xl font-bold text-green-700">
                      <IndianRupee size={15} />
                      {calculateTotalAmount()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-5">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  Payment Method
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div>
                      <img
                        src="https://esewa.com.np/common/images/esewa-logo.png"
                        alt="eSewa"
                        style={{ width: "100px", height: "auto" }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-800 text-sm">
                        eSewa Wallet
                      </p>
                      <p className="text-xs text-green-600">
                        Fast and secure payment
                      </p>
                    </div>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={initiatePayment}
                disabled={paymentProcessing}
                className={`cursor-pointer w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 mb-4 ${
                  paymentProcessing
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {paymentProcessing ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Pay <IndianRupee size={13} />
                    {calculateTotalAmount()}
                  </div>
                )}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <CreateEventModal
          event={eventToOrganize}
          onClose={() => setShowCreateEventModal(false)}
        />
      )}
    </div>
  );

  // If this component is used as modal
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
            {SubscriptionContent}
          </div>
        </div>
      </div>
    );
  }

  return SubscriptionContent;
};
