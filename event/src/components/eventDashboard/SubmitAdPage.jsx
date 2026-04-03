import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAd,
  getUserAds,
  resetAdState,
  getAdAnalytics,
} from "../../redux/slices/adSlice";
import { getSubscriptionDetails } from "../../redux/slices/subscriptionSlice";
import { toast } from "sonner";
import {
  Upload,
  Type,
  X,
  Loader,
  CreditCard,
  Plus,
  Eye,
  Calendar,
  BarChart3,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Download,
  Edit,
  Trash2,
  Image as ImageIcon,
  Shield,
  Check,
  IndianRupee,
  ChevronDown,
  Minus,
  Ticket,
  Users,
  MoreVertical,
  MousePointer,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import CryptoJS from "crypto-js";

/**
 * USER ADS SECTION - Enhanced with Subscription-based Ad Limits
 */
const UserAdsSection = () => {
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [adFormData, setAdFormData] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [duration, setDuration] = useState(1);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedAdForAnalytics, setSelectedAdForAnalytics] = useState(null);
  const [adLimitExceeded, setAdLimitExceeded] = useState(false);
  const [userAdLimit, setUserAdLimit] = useState(0);

  const userAds = useSelector((state) => state.ads.userAds);
  const {
    loading,
    error,
    success,
    paymentLoading,
    analytics,
    analyticsLoading,
  } = useSelector((state) => state.ads);
  const user = useSelector((state) => state.auth.user);
  const subscription = useSelector((state) => state.subscriptions.subscription);
  console.log(subscription);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUserAds());
    dispatch(getSubscriptionDetails());
    checkPaymentReturn();
  }, [dispatch]);

  // Check for payment return on component mount
  const checkPaymentReturn = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const action = urlParams.get("action");
    const adType = urlParams.get("adType");

    if (action === "createAd" && paymentStatus === "success") {
      const pendingAdData = localStorage.getItem("pendingAdData");
      const pendingBannerData = localStorage.getItem("pendingBannerData");

      if (pendingAdData && pendingBannerData) {
        const adData = JSON.parse(pendingAdData);
        const bannerData = JSON.parse(pendingBannerData);

        console.log("🔄 Payment return detected, creating ad:", adData);

        // Reconstruct the file object
        const reconstructedFile = dataURLtoFile(
          bannerData.dataURL,
          bannerData.name
        );

        // Create ad after successful payment with reconstructed file
        createAdAfterPayment({
          ...adData,
          banner: reconstructedFile,
        });

        // Clean up URL and localStorage
        localStorage.removeItem("pendingAdData");
        localStorage.removeItem("pendingBannerData");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
      localStorage.removeItem("pendingAdData");
      localStorage.removeItem("pendingBannerData");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // Calculate user's ad limit based on subscription
  useEffect(() => {
    if (subscription) {
      const planLimits = {
        basic: 1,
        premium: 3,
        platinum: 5,
      };

      const userPlan = subscription.plan?.toLowerCase() || "basic";
      const limit = planLimits[userPlan] || 1;
      setUserAdLimit(limit);

      // Check if user has reached their ad limit
      const activeAds =
        userAds?.filter(
          (ad) => ad.status === "approved" || ad.status === "pending"
        )?.length || 0;

      if (activeAds >= limit) {
        setAdLimitExceeded(true);
      } else {
        setAdLimitExceeded(false);
      }
    } else {
      // Default to basic plan if no subscription
      setUserAdLimit(1);
      const activeAds =
        userAds?.filter(
          (ad) => ad.status === "approved" || ad.status === "pending"
        )?.length || 0;

      if (activeAds >= 1) {
        setAdLimitExceeded(true);
      } else {
        setAdLimitExceeded(false);
      }
    }
  }, [subscription, userAds]);

  // Helper function to convert data URL back to File object
  const dataURLtoFile = (dataURL, filename) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    if (success) {
      toast.success("Advertisement created successfully!");
      dispatch(resetAdState());
      setShowAdModal(false);
      setShowPaymentModal(false);
      setAdFormData(null);
      setBannerFile(null);
      dispatch(getUserAds());
      dispatch(getSubscriptionDetails()); // Refresh subscription data
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch]);

  // Filter and sort ads
  const filteredAds =
    userAds
      ?.filter((ad) => {
        const matchesSearch =
          ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ad.link.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
          filterStatus === "all" || ad.status === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      }) || [];

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Active",
        };
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          label: "Under Review",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertCircle,
          label: "Rejected",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock,
          label: "Pending",
        };
    }
  };

  const getAdTypeConfig = (adType) => {
    switch (adType) {
      case "premium":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          label: "Premium",
        };
      case "standard":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Standard",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Standard",
        };
    }
  };

  const handleViewAd = (ad) => {
    setSelectedAd(ad);
  };

  // Handle analytics view
  const handleViewAnalytics = async (ad) => {
    setSelectedAdForAnalytics(ad);
    try {
      await dispatch(getAdAnalytics(ad._id)).unwrap();
      setShowAnalyticsModal(true);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  // Map frontend positions to backend positions based on adType
  const getBackendPosition = (adType, frontendPosition) => {
    if (adType === "premium") {
      return "homepage-top";
    }

    const positionMap = {
      sidebar: "homepage-sidebar",
      header: "homepage-sidebar",
      footer: "homepage-sidebar",
    };

    return positionMap[frontendPosition] || "homepage-sidebar";
  };

  // Handle form submission from AdCreationModal
  const handleFormSubmit = (formData, bannerFile) => {
    // Check ad limit before proceeding
    const activeAds =
      userAds?.filter(
        (ad) => ad.status === "approved" || ad.status === "pending"
      )?.length || 0;

    if (activeAds >= userAdLimit) {
      toast.error(
        `You have reached your ad limit (${userAdLimit} ads). Please upgrade your subscription to create more ads.`
      );
      setAdLimitExceeded(true);
      return;
    }

    console.log("📋 Form data received:", formData);

    const backendPosition = getBackendPosition(
      formData.adType,
      formData.position
    );

    setAdFormData({
      ...formData,
      backendPosition: backendPosition,
    });
    setBannerFile(bannerFile);

    setShowAdModal(false);
    setShowPaymentModal(true);
  };

  // Create ad after successful payment
  const createAdAfterPayment = async (adData) => {
    try {
      console.log("💰 Creating ad after payment:", adData);

      const formData = new FormData();
      formData.append("title", adData.title);
      formData.append("link", adData.link);
      formData.append("adType", adData.adType);
      formData.append("position", adData.backendPosition);

      if (adData.banner instanceof File) {
        formData.append("banner", adData.banner);
        console.log("✅ Banner file appended successfully");
      } else {
        console.error("❌ Invalid banner file:", adData.banner);
        toast.error("Invalid banner file. Please try creating the ad again.");
        return;
      }

      if (user) {
        formData.append("userEmail", user.email);
        formData.append("userName", user.name || user.username);
      }

      console.log("📤 Final FormData being sent:", {
        title: formData.get("title"),
        link: formData.get("link"),
        adType: formData.get("adType"),
        position: formData.get("position"),
        userEmail: formData.get("userEmail"),
        userName: formData.get("userName"),
        banner: formData.get("banner") ? "File present" : "No file",
      });

      dispatch(createAd(formData));
    } catch (error) {
      console.error("Error creating ad after payment:", error);
      toast.error("Failed to create ad after payment");
    }
  };

  // Handle payment success for test payment (bypass)
  const handlePaymentSuccess = () => {
    if (!adFormData || !bannerFile) {
      toast.error("No ad data found. Please try again.");
      return;
    }

    createAdAfterPayment({
      ...adFormData,
      banner: bannerFile,
    });
  };

  // Calculate total amount based on ad type and duration
  const calculateTotalAmount = () => {
    if (!adFormData) return "0.00";
    const basePrice = adFormData.adType === "premium" ? 500 : 200;
    return (basePrice * duration).toFixed(2);
  };

  // Handle eSewa payment
  const handleEsewaPayment = () => {
    if (!adFormData || !bannerFile) {
      toast.error("No ad data found. Please try again.");
      return;
    }

    setPaymentProcessing(true);

    // Convert file to data URL for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("pendingAdData", JSON.stringify(adFormData));
      localStorage.setItem(
        "pendingBannerData",
        JSON.stringify({
          dataURL: reader.result,
          name: bannerFile.name,
          type: bannerFile.type,
        })
      );

      console.log(
        "💾 Ad data and banner stored in localStorage for payment return"
      );

      const esewaConfig = {
        merchantId: "EPAYTEST",
        baseUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        successUrl: `${window.location.origin}/myevents/submit-ad?payment=success&action=createAd&adType=${adFormData.adType}`,
        failureUrl: `${window.location.origin}/myevents/submit-ad?payment=failed&action=createAd`,
        secretKey: "8gBm/:&EnhH.1/q",
      };

      const transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const totalAmount = calculateTotalAmount();

      const paymentData = {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionId,
        product_code: "EPAYTEST",
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: esewaConfig.successUrl,
        failure_url: esewaConfig.failureUrl,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: "",
      };

      // Generate signature
      const message = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
      paymentData.signature = CryptoJS.HmacSHA256(
        message,
        esewaConfig.secretKey
      ).toString(CryptoJS.enc.Base64);

      console.log("🔗 Redirecting to eSewa with payment data:", {
        amount: totalAmount,
        transactionId: transactionId,
        successUrl: esewaConfig.successUrl,
      });

      // Create form and submit to eSewa
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
    };

    reader.readAsDataURL(bannerFile);
  };

  // Calculate total stats
  const totalStats = {
    views: userAds?.reduce((sum, ad) => sum + (ad.views || 0), 0) || 0,
    clicks: userAds?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0,
    ctr:
      (userAds?.reduce((sum, ad) => {
        const adViews = ad.views || 0;
        const adClicks = ad.clicks || 0;
        return adViews > 0 ? sum + adClicks / adViews : sum;
      }, 0) /
        (userAds?.filter((ad) => ad.views > 0).length || 1)) *
        100 || 0,
  };

  // Get subscription plan info
  const getSubscriptionPlanInfo = () => {
    if (!subscription) {
      const usedAds =
        userAds?.filter(
          (ad) => ad.status === "approved" || ad.status === "pending"
        )?.length || 0;
      return {
        name: "Basic",
        icon: Star,
        color: "from-gray-500 to-gray-700",
        limit: 1,
        used: usedAds,
      };
    }

    // Use the correct property name from your subscription data
    const planType = subscription.plan?.toLowerCase();
    const usedAds =
      userAds?.filter(
        (ad) => ad.status === "approved" || ad.status === "pending"
      )?.length || 0;

    switch (planType) {
      case "premium":
        return {
          name: "Premium",
          icon: Zap,
          color: "from-purple-500 to-pink-600",
          limit: 3,
          used: usedAds,
        };
      case "platinum":
        return {
          name: "Platinum",
          icon: Crown,
          color: "from-yellow-500 to-orange-600",
          limit: 5,
          used: usedAds,
        };
      default:
        return {
          name: "Basic",
          icon: Star,
          color: "from-gray-500 to-gray-700",
          limit: 1,
          used: usedAds,
        };
    }
  };

  const planInfo = getSubscriptionPlanInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Advertisement Management
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Create and manage your advertising campaigns with detailed analytics
          </p>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${planInfo.color} text-white shadow-lg`}
              >
                <planInfo.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {planInfo.name} Plan
                </h3>
                <p className="text-slate-600">
                  Ad Limit: {planInfo.used}/{planInfo.limit} ads used
                </p>
              </div>
            </div>
            <div className="w-full md:w-48 bg-slate-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${planInfo.color} transition-all duration-500`}
                style={{
                  width: `${Math.min(
                    (planInfo.used / planInfo.limit) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
          {adLimitExceeded && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You've reached your ad limit.{" "}
                  {planInfo.name === "Basic" && "Upgrade to create more ads."}
                  {planInfo.name === "Premium" &&
                    "Upgrade to Platinum to create more ads."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {userAds?.length || 0}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Ads
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg shadow-md">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {userAds?.filter((ad) => ad.status === "approved").length || 0}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">Active</h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {totalStats.views}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Views
            </h3>
          </div>

          <div className="group bg-white/90 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                <MousePointer className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {totalStats.clicks}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-700">
              Total Clicks
            </h3>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ads by title or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-300 text-black"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="flex items-center px-3 py-2.5 bg-white/80 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {expandedFilters ? (
                  <ChevronDown className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1 transform rotate-180" />
                )}
              </button>

              <button
                onClick={() => {
                  if (adLimitExceeded) {
                    toast.error(
                      `You have reached your ad limit (${userAdLimit} ads). Please upgrade your subscription to create more ads.`
                    );
                    return;
                  }
                  setShowAdModal(true);
                }}
                disabled={adLimitExceeded}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
                  adLimitExceeded
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Ad
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {expandedFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-black"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                  <option value="views">Most Views</option>
                  <option value="clicks">Most Clicks</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ads Grid */}
        <div className="space-y-4">
          {filteredAds.length > 0 ? (
            filteredAds.map((ad, index) => {
              const statusConfig = getStatusConfig(ad.status);
              const adTypeConfig = getAdTypeConfig(ad.adType);
              const StatusIcon = statusConfig.icon;
              const ctr =
                ad.views > 0
                  ? (((ad.clicks || 0) / ad.views) * 100).toFixed(2)
                  : 0;

              return (
                <div
                  key={ad._id}
                  className="group bg-white/90 backdrop-blur-xl rounded-xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Banner Preview */}
                    <div className="md:w-48 h-40 md:h-auto relative overflow-hidden">
                      {ad?.banner ? (
                        <img
                          src={`http://localhost:5000${ad.banner}`}
                          alt={ad.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-indigo-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Ad Details */}
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors duration-300">
                            {ad.title}
                          </h3>
                          <div className="flex items-center mt-1 gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${adTypeConfig.color}`}
                            >
                              {adTypeConfig.label}
                            </span>
                            {ad.views > 0 && (
                              <span className="text-xs text-slate-500">
                                CTR: {ctr}%
                              </span>
                            )}
                          </div>
                          <a
                            href={ad.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm mt-2 group/link"
                          >
                            {ad.link.replace(/^https?:\/\//, "")}
                            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 transition" />
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewAnalytics(ad)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            title="View Analytics"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center text-slate-600">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                          <span>Created {formatDate(ad.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                          <span>
                            Position:{" "}
                            <span className="font-medium capitalize">
                              {ad.position.replace("homepage-", "")}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Eye className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          <span>{ad.views || 0} views</span>
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MousePointer className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                          <span>{ad.clicks || 0} clicks</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleViewAd(ad)}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          View Details
                        </button>
                        <button
                          onClick={() => handleViewAnalytics(ad)}
                          className="flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-xs shadow-md hover:shadow-lg"
                        >
                          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                          Analytics
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-xl p-12 border border-white/20 shadow-lg text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "No matching ads found"
                  : "No advertisements yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first ad to promote your content"}
              </p>
              {searchTerm || filterStatus !== "all" ? (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (adLimitExceeded) {
                      toast.error(
                        `You have reached your ad limit (${userAdLimit} ads). Please upgrade your subscription to create more ads.`
                      );
                      return;
                    }
                    setShowAdModal(true);
                  }}
                  disabled={adLimitExceeded}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                    adLimitExceeded
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  }`}
                >
                  Create Your First Ad
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Ad Modal */}
      {showAdModal && (
        <AdCreationModal
          onClose={() => setShowAdModal(false)}
          onSubmitForm={handleFormSubmit}
          loading={loading}
          adLimitExceeded={adLimitExceeded}
          userAdLimit={userAdLimit}
          planInfo={planInfo}
        />
      )}

      {/* Enhanced Payment Modal with eSewa UI */}
      {showPaymentModal && adFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-scaleIn relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setAdFormData(null);
                setBannerFile(null);
              }}
              className="absolute cursor-pointer top-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 group ring-2 ring-white/20 hover:ring-white/30"
            >
              <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Close
              </span>
            </button>

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
                <p className="text-green-50 text-sm mb-2">
                  Paying for {adFormData.title}
                </p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <Ticket className="w-4 h-4 text-green-600" /> Ad Campaign
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-700 text-sm">
                    Duration (weeks):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      disabled={duration <= 1}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-lg text-green-700">
                      {duration}
                    </span>
                    <button
                      onClick={() => setDuration(duration + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-50 transition-all duration-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Ad Type:</span>
                    <span className="font-medium capitalize">
                      {adFormData.adType}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Position:</span>
                    <span className="font-medium capitalize">
                      {adFormData.adType === "premium"
                        ? "Header"
                        : adFormData.position}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Price per Week:</span>
                    <span className="flex items-center font-medium">
                      <IndianRupee
                        size={12}
                        strokeWidth={2}
                        className="opacity-80"
                      />
                      {adFormData.adType === "premium" ? "500" : "200"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">{duration} week(s)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Service Fee:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-sm">
                      Total:
                    </span>
                    <span className="flex items-center text-xl font-bold text-green-700">
                      <IndianRupee
                        size={18}
                        strokeWidth={2}
                        className="opacity-80"
                      />
                      {calculateTotalAmount()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-green-600" /> Payment
                  Method
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

              <div className="space-y-3">
                <button
                  onClick={handleEsewaPayment}
                  disabled={paymentProcessing || paymentLoading}
                  className={`cursor-pointer w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    paymentProcessing || paymentLoading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {paymentProcessing || paymentLoading ? (
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
                      Pay <IndianRupee size={14} />
                      {calculateTotalAmount()}
                    </div>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                <Shield className="w-3 h-3" />
                <span>256-bit SSL Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad Detail Modal */}
      {selectedAd && (
        <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}

      {/* Enhanced Analytics Modal with Charts */}
      {showAnalyticsModal && selectedAdForAnalytics && (
        <AnalyticsModal
          ad={selectedAdForAnalytics}
          analytics={analytics[selectedAdForAnalytics._id]}
          loading={analyticsLoading}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedAdForAnalytics(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Enhanced Ad Creation Modal with Subscription Limits
 */
const AdCreationModal = ({
  onClose,
  onSubmitForm,
  loading,
  adLimitExceeded,
  userAdLimit,
  planInfo,
}) => {
  const [form, setForm] = useState({
    title: "",
    link: "",
    banner: null,
    adType: "standard",
    position: "sidebar",
  });
  const [bannerPreview, setBannerPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bannerFile, setBannerFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }
      setForm((prev) => ({ ...prev, banner: file }));
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (adLimitExceeded) {
      toast.error(
        `You have reached your ad limit (${userAdLimit} ads). Please upgrade your subscription to create more ads.`
      );
      return;
    }

    if (!form.title.trim() || !form.link.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!form.banner) {
      toast.error("Please upload a banner image.");
      return;
    }

    if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      onSubmitForm(form, bannerFile);
    }
  };

  const steps = [
    { number: 1, title: "Ad Details" },
    { number: 2, title: "Confirmation" },
  ];

  const calculateTotalAmount = () => {
    return form.adType === "premium" ? "500" : "200";
  };

  useEffect(() => {
    if (form.adType === "premium") {
      setForm((prev) => ({ ...prev, position: "header" }));
    } else {
      setForm((prev) => ({ ...prev, position: "sidebar" }));
    }
  }, [form.adType]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="border-b border-slate-100 p-6 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Create Advertisement
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Promote your content effectively
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Subscription Limit Warning */}
          {adLimitExceeded && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  You've reached your {planInfo.name} plan limit of{" "}
                  {userAdLimit} ads.
                  {planInfo.name === "Basic" &&
                    " Upgrade to Premium for more ads."}
                  {planInfo.name === "Premium" &&
                    " Upgrade to Platinum for more ads."}
                </span>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep >= step.number
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      currentStep >= step.number
                        ? "text-indigo-600"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {currentStep === 1 ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ad Title *
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl px-4 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                    <Type className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full px-3 py-3 outline-none text-slate-900 placeholder-slate-400 bg-transparent"
                      placeholder="Enter a compelling ad title"
                      required
                    />
                  </div>
                </div>

                {/* Link */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={form.link}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="https://example.com"
                    required
                  />
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Banner Image *
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition ${
                      bannerPreview
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-300 hover:border-indigo-300 hover:bg-slate-50"
                    }`}
                  >
                    {bannerPreview ? (
                      <div className="text-center">
                        <img
                          src={bannerPreview}
                          alt="Preview"
                          className="w-48 h-24 object-cover rounded-lg mx-auto mb-2 border border-slate-200"
                        />
                        <span className="text-sm text-indigo-600 font-medium">
                          Click to change image
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">
                          Click to upload banner image
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          Recommended: 728x90 px
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      name="banner"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                {/* Ad Type & Position */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ad Type *
                    </label>
                    <select
                      name="adType"
                      value={form.adType}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      required
                    >
                      <option value="standard">Standard - ₹200</option>
                      <option value="premium">Premium - ₹500</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {form.adType === "premium"
                        ? "Premium ads appear in header position"
                        : "Standard ads appear in sidebar position"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Position
                    </label>
                    <select
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      disabled={form.adType === "premium"}
                    >
                      <option value="sidebar">Sidebar</option>
                      <option value="header">Header (Premium only)</option>
                      <option value="footer">Footer</option>
                    </select>
                    {form.adType === "premium" && (
                      <p className="text-xs text-blue-500 mt-1">
                        Premium ads are automatically placed in header position
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">
                  Ad Confirmation
                </h4>
                <p className="text-slate-600 mb-6">
                  Review your ad details before proceeding to payment.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-left">
                  <h5 className="font-semibold text-slate-800 mb-3">
                    Ad Summary
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Title:</span>
                      <span className="font-medium">{form.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">URL:</span>
                      <span className="font-medium truncate max-w-[200px]">
                        {form.link}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ad Type:</span>
                      <span className="font-medium capitalize">
                        {form.adType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Position:</span>
                      <span className="font-medium capitalize">
                        {form.adType === "premium"
                          ? "Header (Auto-assigned)"
                          : form.position}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center text-lg font-bold text-indigo-600">
                      <span>Total Cost:</span>
                      <span className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {calculateTotalAmount()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading || adLimitExceeded}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition ${
                  loading || adLimitExceeded
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                }`}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin mx-auto" />
                ) : adLimitExceeded ? (
                  "Ad Limit Reached"
                ) : currentStep === 1 ? (
                  "Continue to Confirmation"
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Ad Detail Modal
 */
const AdDetailModal = ({ ad, onClose }) => {
  const statusConfig = {
    approved: { color: "bg-green-100 text-green-800", label: "Active" },
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Under Review" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
  }[ad.status] || { color: "bg-gray-100 text-gray-800", label: "Pending" };

  const adTypeConfig = {
    premium: { color: "bg-purple-100 text-purple-800", label: "Premium" },
    standard: { color: "bg-blue-100 text-blue-800", label: "Standard" },
  }[ad.adType] || { color: "bg-gray-100 text-gray-800", label: "Standard" };

  const ctr =
    ad.views > 0 ? (((ad.clicks || 0) / ad.views) * 100).toFixed(2) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Ad Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">
                Banner Preview
              </h4>
              {ad.banner ? (
                <img
                  src={`http://localhost:5000${ad.banner}`}
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg border border-slate-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-indigo-300" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Ad Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-slate-600">Title:</span>
                    <p className="font-medium">{ad.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">URL:</span>
                    <a
                      href={ad.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-700 break-all"
                    >
                      {ad.link}
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm text-slate-600">Type:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${adTypeConfig.color}`}
                      >
                        {adTypeConfig.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-600">Position:</span>
                      <p className="font-medium capitalize">
                        {ad.position.replace("homepage-", "")}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-2">
                  Performance Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-800">
                      {ad.views || 0}
                    </p>
                    <p className="text-xs text-slate-600">Total Views</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <MousePointer className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-800">
                      {ad.clicks || 0}
                    </p>
                    <p className="text-xs text-slate-600">Total Clicks</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-800">{ctr}%</p>
                    <p className="text-xs text-slate-600">Click Rate</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-600">Created Date</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Analytics Modal with Beautiful Charts
 */
const AnalyticsModal = ({ ad, analytics, loading, onClose }) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [chartType, setChartType] = useState("line");

  // Use actual ad data for analytics
  const stats = {
    views: ad?.views || 0,
    clicks: ad?.clicks || 0,
    ctr: ad?.views > 0 ? (((ad?.clicks || 0) / ad?.views) * 100).toFixed(1) : 0,
  };

  // Generate beautiful chart data
  const generateChartData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data = [];

    // Create realistic trending data
    let baseViews = stats.views / days;
    let baseClicks = stats.clicks / days;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Add realistic trends and patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendBoost = isWeekend ? 1.4 : 1.0;

      // Add some realistic noise and trends
      const trend = 1 + (i / days) * 0.3; // Increasing trend
      const noise = 0.8 + Math.random() * 0.4;

      const views = Math.max(
        1,
        Math.round(baseViews * trend * weekendBoost * noise)
      );
      const clicks = Math.max(
        0,
        Math.round(baseClicks * trend * weekendBoost * noise * 0.6)
      );
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : 0;

      data.push({
        date: date.toISOString().split("T")[0],
        views,
        clicks,
        ctr: parseFloat(ctr),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Performance metrics
  const performanceMetrics = [
    {
      label: "Total Views",
      value: stats.views.toLocaleString(),
      change: "+12.4%",
      trend: "up",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Total Clicks",
      value: stats.clicks.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: MousePointer,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
    },
    {
      label: "CTR Rate",
      value: `${stats.ctr}%`,
      change: stats.ctr > 5 ? "+2.3%" : "-1.2%",
      trend: stats.ctr > 5 ? "up" : "down",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      label: "Avg. Engagement",
      value: "4.2%",
      change: "+0.8%",
      trend: "up",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      borderColor: "border-orange-200",
    },
  ];

  const recentClicks = ad?.clickEvents || [];

  // Beautiful Bar Chart Component
  const BarChart = ({ data, height = 320 }) => {
    const maxValue =
      Math.max(...data.map((d) => Math.max(d.views, d.clicks))) * 1.1;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <div key={index} className="text-right pr-2">
              {Math.round(maxValue * ratio)}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full">
          <div className="flex items-end justify-between h-full gap-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group"
              >
                <div className="flex items-end justify-center gap-1 w-full relative">
                  {/* Views Bar with gradient */}
                  <div
                    className="w-2/3 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-lg relative group"
                    style={{
                      height: `${(item.views / maxValue) * (height - 60)}px`,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {item.views} views
                    </div>
                  </div>

                  {/* Clicks Bar with gradient */}
                  <div
                    className="w-2/3 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-500 hover:shadow-lg relative group"
                    style={{
                      height: `${(item.clicks / maxValue) * (height - 60)}px`,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                      {item.clicks} clicks
                    </div>
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="text-xs text-slate-500 mt-3 text-center">
                  <div className="font-medium">{item.dayName}</div>
                  <div className="text-slate-400">
                    {formatShortDate(item.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none ml-12">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <div
              key={index}
              className="border-t border-slate-200"
              style={{ marginTop: `${(height - 60) * ratio}px` }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Beautiful Line Chart Component
  const LineChart = ({ data, height = 320 }) => {
    const maxValue =
      Math.max(...data.map((d) => Math.max(d.views, d.clicks))) * 1.1;
    const chartWidth = `100%`;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <div key={index} className="text-right pr-2">
              {Math.round(maxValue * ratio)}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full relative">
          <svg width="100%" height={height} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1="0"
                y1={height - 60 - ratio * (height - 60)}
                x2="100%"
                y2={height - 60 - ratio * (height - 60)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}

            {/* Views line with gradient */}
            <defs>
              <linearGradient
                id="viewsGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient
                id="clicksGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Views area fill */}
            <path
              d={`M 0,${height - 60} ${data
                .map(
                  (item, index) =>
                    `L ${(index / (data.length - 1)) * 100}%,${
                      height - 60 - (item.views / maxValue) * (height - 60)
                    }`
                )
                .join(" ")} L 100%,${height - 60} Z`}
              fill="url(#viewsGradient)"
            />

            {/* Clicks area fill */}
            <path
              d={`M 0,${height - 60} ${data
                .map(
                  (item, index) =>
                    `L ${(index / (data.length - 1)) * 100}%,${
                      height - 60 - (item.clicks / maxValue) * (height - 60)
                    }`
                )
                .join(" ")} L 100%,${height - 60} Z`}
              fill="url(#clicksGradient)"
            />

            {/* Views line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data
                .map(
                  (item, index) =>
                    `${(index / (data.length - 1)) * 100}%,${
                      height - 60 - (item.views / maxValue) * (height - 60)
                    }`
                )
                .join(" ")}
            />

            {/* Clicks line */}
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data
                .map(
                  (item, index) =>
                    `${(index / (data.length - 1)) * 100}%,${
                      height - 60 - (item.clicks / maxValue) * (height - 60)
                    }`
                )
                .join(" ")}
            />

            {/* Data points */}
            {data.map((item, index) => (
              <g key={index}>
                <circle
                  cx={`${(index / (data.length - 1)) * 100}%`}
                  cy={height - 60 - (item.views / maxValue) * (height - 60)}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all duration-200 cursor-pointer"
                />
                <circle
                  cx={`${(index / (data.length - 1)) * 100}%`}
                  cy={height - 60 - (item.clicks / maxValue) * (height - 60)}
                  r="4"
                  fill="#8b5cf6"
                  className="hover:r-6 transition-all duration-200 cursor-pointer"
                />
              </g>
            ))}
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-4">
            {data
              .filter((_, index) => index % Math.ceil(data.length / 6) === 0)
              .map((item, index) => (
                <div key={index} className="text-xs text-slate-500 text-center">
                  <div className="font-medium">{item.dayName}</div>
                  <div className="text-slate-400">
                    {formatShortDate(item.date)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Advertisement Analytics</h3>
              <p className="text-indigo-100 mt-1">{ad?.title}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  Status: {ad?.status}
                </span>
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  Type: {ad?.adType}
                </span>
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  Position: {ad?.position?.replace("homepage-", "")}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-slate-600">Loading analytics...</span>
            </div>
          ) : ad ? (
            <div className="space-y-6">
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div
                      key={index}
                      className={`${metric.bgColor} border ${metric.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">
                            {metric.label}
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${metric.color}">
                            {metric.value}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} text-white shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-4 text-sm ${
                          metric.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        <div
                          className={`p-1 rounded ${
                            metric.trend === "up"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {metric.trend === "up" ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                        </div>
                        <span className="font-medium">{metric.change}</span>
                        <span className="text-slate-500">vs last period</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Chart Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h5 className="text-lg font-semibold text-slate-800">
                        Performance Trends
                      </h5>
                      <p className="text-slate-600">
                        Views and clicks over the selected period
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        {["7d", "30d", "90d"].map((range) => (
                          <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                              timeRange === range
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {range === "7d"
                              ? "1W"
                              : range === "30d"
                              ? "1M"
                              : "3M"}
                          </button>
                        ))}
                      </div>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        {[
                          { value: "line", label: "Line" },
                          { value: "bar", label: "Bar" },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setChartType(type.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                              chartType === type.value
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} height={320} />
                  ) : (
                    <LineChart data={chartData} height={320} />
                  )}

                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-1 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">
                        Clicks
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sections */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h5 className="text-lg font-semibold text-slate-800 mb-4">
                    Recent Activity
                  </h5>
                  {recentClicks.length > 0 ? (
                    <div className="space-y-3">
                      {recentClicks.slice(0, 5).map((click, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <MousePointer className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">
                              Click Event
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(click.clickedAt)} •{" "}
                              {click.referrer || "Direct"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <MousePointer className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No recent activity</p>
                      <p className="text-sm mt-2">
                        Clicks will appear here when users interact with your ad
                      </p>
                    </div>
                  )}
                </div>

                {/* Performance Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h5 className="text-lg font-semibold text-slate-800 mb-4">
                    Performance Summary
                  </h5>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Best Performing Day
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        Friday
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Peak Hours
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        2:00 - 4:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Avg. Session Duration
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        2m 34s
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Return Visitors
                      </span>
                      <span className="text-sm font-semibold text-orange-600">
                        24%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                No ad data available
              </p>
              <p className="text-sm mt-2">
                Unable to load analytics for this advertisement
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAdsSection;
