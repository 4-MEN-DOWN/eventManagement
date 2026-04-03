import {
  Calendar,
  MapPin,
  Users,
  X,
  Crown,
  Sparkles,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAdsAdmin,
  trackAdView,
  trackAdClick,
  incrementAdViews,
  incrementAdClicks,
} from "../redux/slices/adSlice";
import { Navbar } from "./Navbar";
import { CreateEventModal } from "./CreateEventModal";
import React from "react";

// Custom hook for ad rotation with enhanced tracking
const useAdRotation = (ads, intervalTime = 5000) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const trackedAdsRef = useRef(new Set());

  const filteredAds = ads || [];

  useEffect(() => {
    if (filteredAds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % filteredAds.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [filteredAds.length, intervalTime]);

  // Enhanced view tracking - once per user per ad
  useEffect(() => {
    const currentAd = filteredAds[currentAdIndex];
    if (currentAd) {
      trackAdViewOnce(currentAd._id);
    }
  }, [currentAdIndex, filteredAds]);

  // Track ad view only once per user per ad
  const trackAdViewOnce = useCallback(
    async (adId) => {
      try {
        // Generate a unique tracking key based on user ID or session
        const userIdentifier = user
          ? `user_${user._id}`
          : `session_${getSessionId()}`;
        const trackingKey = `ad_viewed_${userIdentifier}_${adId}`;

        // Check if already tracked in localStorage (persistent across sessions)
        const alreadyTracked = localStorage.getItem(trackingKey);

        if (!alreadyTracked) {
          // Mark as tracked
          localStorage.setItem(trackingKey, "true");

          // Also mark in sessionStorage for current session
          const sessionKey = `ad_viewed_${adId}`;
          sessionStorage.setItem(sessionKey, "true");

          trackedAdsRef.current.add(adId);

          // Dispatch tracking actions
          dispatch(incrementAdViews({ adId }));
          dispatch(trackAdView(adId));

          console.log(`📊 Tracked view for ad ${adId} by ${userIdentifier}`);
        }
      } catch (error) {
        console.error("Error tracking ad view:", error);
      }
    },
    [user, dispatch]
  );

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("user_session_id", sessionId);
    }
    return sessionId;
  }, []);

  const nextAd = useCallback(() => {
    setCurrentAdIndex((prev) => (prev + 1) % filteredAds.length);
  }, [filteredAds.length]);

  const prevAd = useCallback(() => {
    setCurrentAdIndex(
      (prev) => (prev - 1 + filteredAds.length) % filteredAds.length
    );
  }, [filteredAds.length]);

  return {
    currentAd: filteredAds[currentAdIndex],
    currentAdIndex,
    nextAd,
    prevAd,
    totalAds: filteredAds.length,
  };
};

export const Hero = () => {
  const dispatch = useDispatch();
  const allAds = useSelector((state) => state.ads.allAds);
  console.log(allAds);
  const user = useSelector((state) => state.auth.user);
  const [showTopAd, setShowTopAd] = useState(true);
  const [dismissedAds, setDismissedAds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToOrganize, setEventToOrganize] = useState(null);

  // Memoize the filtered ads to prevent unnecessary re-renders
  const topAds =
    allAds?.filter(
      (ad) =>
        ad.status === "approved" &&
        ad.position === "homepage-top" &&
        !dismissedAds.has(ad._id)
    ) || [];

  const sidebarAds =
    allAds?.filter(
      (ad) => ad.status === "approved" && ad.position === "homepage-sidebar"
    ) || [];

  // Use custom hooks for ad rotation
  const {
    currentAd: currentTopAd,
    currentAdIndex: currentTopAdIndex,
    nextAd: nextTopAd,
    prevAd: prevTopAd,
    totalAds: totalTopAds,
  } = useAdRotation(topAds, 5000);

  const {
    currentAd: currentSidebarAd,
    currentAdIndex: currentSidebarAdIndex,
    nextAd: nextSidebarAd,
    prevAd: prevSidebarAd,
    totalAds: totalSidebarAds,
  } = useAdRotation(sidebarAds, 8000);

  // Load ads only once on component mount
  useEffect(() => {
    dispatch(getAllAdsAdmin());
  }, [dispatch]);

  // Reset dismissed ads after timeout
  useEffect(() => {
    if (dismissedAds.size > 0) {
      const timer = setTimeout(() => {
        setDismissedAds(new Set());
        setShowTopAd(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [dismissedAds]);

  const getAdBannerUrl = useCallback((banner) => {
    const filename = banner.includes("/") ? banner.split("/").pop() : banner;
    return `http://localhost:5000/uploads/ad-banners/${filename}`;
  }, []);

  const dismissAd = useCallback((adId) => {
    setDismissedAds((prev) => new Set(prev).add(adId));
    setShowTopAd(false);
  }, []);

  const handleOpenModal = useCallback(() => {
    setEventToOrganize({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      price: "",
    });
    setIsModalOpen(true);
  }, []);

  // Enhanced ad click tracking with user-specific tracking
  const handleAdClick = useCallback(
    async (adId, adLink, event) => {
      event.preventDefault();

      try {
        // Generate unique click tracking key
        const userIdentifier = user
          ? `user_${user._id}`
          : `session_${getSessionId()}`;
        const clickTrackingKey = `ad_clicked_${userIdentifier}_${adId}`;

        // Check if already clicked in this session/user context
        const alreadyClicked = sessionStorage.getItem(clickTrackingKey);

        if (!alreadyClicked) {
          // Mark as clicked for this session/user
          sessionStorage.setItem(clickTrackingKey, "true");

          // Optimistically update the click count
          dispatch(incrementAdClicks({ adId }));

          // Track the click on the server
          await dispatch(trackAdClick(adId)).unwrap();

          console.log(`🖱️ Tracked click for ad ${adId} by ${userIdentifier}`);
        }

        // Always open the link (even if we didn't track for analytics)
        window.open(adLink, "_blank");
      } catch (error) {
        console.error("Error tracking ad click:", error);
        // Fallback: open the link directly if tracking fails
        window.open(adLink, "_blank");
      }
    },
    [dispatch, user]
  );

  // Helper function to get session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem("user_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("user_session_id", sessionId);
    }
    return sessionId;
  }, []);

  // Handle direct click without tracking (for fallback)
  const handleDirectClick = useCallback((adLink) => {
    window.open(adLink, "_blank");
  }, []);

  return (
    <div className="relative">
      {/* Navbar with modal open handler */}
      <Navbar onOpenCreateEventModal={handleOpenModal} />

      {/* Premium Top Ad Banner */}
      {currentTopAd && showTopAd && (
        <TopAdBanner
          ad={currentTopAd}
          currentIndex={currentTopAdIndex}
          totalAds={totalTopAds}
          onNext={nextTopAd}
          onPrev={prevTopAd}
          onDismiss={() => dismissAd(currentTopAd._id)}
          onAdClick={handleAdClick}
          onDirectClick={handleDirectClick}
          getBannerUrl={getAdBannerUrl}
        />
      )}

      {/* Main hero section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 opacity-10 rounded-3xl mx-4"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-20 animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                Discover Amazing
                <br />
                <span className="text-transparent bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text">
                  Events
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl leading-relaxed">
                Connect with your community through unforgettable experiences.
                Create, discover, and attend events that matter to you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-md shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Explore Events
                </button>
                <button
                  onClick={handleOpenModal}
                  className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-md hover:border-purple-400 transition-all duration-300"
                >
                  Create Your Event
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    1000+
                  </h3>
                  <p className="text-gray-600">Events Created</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    50K+
                  </h3>
                  <p className="text-gray-600">Happy Attendees</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <MapPin className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">25+</h3>
                  <p className="text-gray-600">Cities Covered</p>
                </div>
              </div>
            </div>

            {/* Sidebar Ad Area */}
            {currentSidebarAd && (
              <SidebarAd
                ad={currentSidebarAd}
                currentIndex={currentSidebarAdIndex}
                totalAds={totalSidebarAds}
                onNext={nextSidebarAd}
                onPrev={prevSidebarAd}
                onAdClick={handleAdClick}
                onDirectClick={handleDirectClick}
                getBannerUrl={getAdBannerUrl}
              />
            )}
          </div>
        </div>
      </section>

      {/* Modal with event data passed as prop */}
      {isModalOpen && (
        <CreateEventModal
          onClose={() => setIsModalOpen(false)}
          eventToOrganize={eventToOrganize}
        />
      )}
    </div>
  );
};

// Extracted TopAdBanner component for better performance
const TopAdBanner = React.memo(
  ({
    ad,
    currentIndex,
    totalAds,
    onNext,
    onPrev,
    onDismiss,
    onAdClick,
    onDirectClick,
    getBannerUrl,
  }) => (
    <div className="relative w-full overflow-hidden transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/70 to-indigo-900/80 z-10"></div>

      {ad.banner && (
        <img
          src={getBannerUrl(ad.banner)}
          alt={ad.title}
          className="w-full h-64 object-cover absolute inset-0 opacity-60"
        />
      )}

      <div className="relative z-20 max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-900 px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-sm">PREMIUM AD</span>
          </div>

          <div className="flex items-center gap-4 flex-1 group">
            {ad.banner && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0">
                <img
                  src={getBannerUrl(ad.banner)}
                  alt={ad.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            )}

            <div className="text-white flex-1">
              <button
                onClick={(e) => onAdClick(ad._id, ad.link, e)}
                className="text-left w-full group-hover:underline drop-shadow-md"
              >
                <h3 className="font-bold text-xl mb-2">{ad.title}</h3>
                <p className="text-blue-100 text-sm max-w-md line-clamp-2 drop-shadow-md">
                  {ad.description ||
                    "Exclusive premium offering - Limited time only!"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-amber-300 text-xs font-medium bg-black/30 px-2 py-1 rounded-full">
                    Special Offer
                  </span>
                  <span className="text-xs text-blue-200 flex items-center gap-1">
                    Click to learn more <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {totalAds > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-sm"
                title="Previous ad"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalAds }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i === currentIndex ? "bg-amber-400" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={onNext}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-sm"
                title="Next ad"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white backdrop-blur-sm"
            title="Dismiss ad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="absolute top-3 right-20 z-20">
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
      </div>
      <div className="absolute bottom-3 left-40 z-20">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse delay-1000" />
      </div>
    </div>
  )
);

// Extracted SidebarAd component for better performance
const SidebarAd = React.memo(
  ({
    ad,
    currentIndex,
    totalAds,
    onNext,
    onPrev,
    onAdClick,
    onDirectClick,
    getBannerUrl,
  }) => (
    <div className="lg:w-80 flex-shrink-0">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Sponsored Events
          </h3>
          {totalAds > 1 && (
            <div className="flex gap-1">
              {Array.from({ length: totalAds }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <div className="block group">
            {ad.banner && (
              <button
                onClick={(e) => onAdClick(ad._id, ad.link, e)}
                className="w-full rounded-xl overflow-hidden mb-4 border border-gray-200 block"
              >
                <img
                  src={getBannerUrl(ad.banner)}
                  alt={ad.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={(e) => onAdClick(ad._id, ad.link, e)}
                  className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-left"
                >
                  {ad.title}
                </button>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  Sponsored
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {ad.description || "Discover amazing offers and events!"}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>By {ad.userName}</span>
                <button
                  onClick={(e) => onAdClick(ad._id, ad.link, e)}
                  className="text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 transition-colors"
                >
                  Learn more <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {totalAds > 1 && (
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={onPrev}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={onNext}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

export default Hero;
