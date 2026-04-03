import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";

// Components & Layouts
import { MainLayout } from "./components/MainLayout";
import { BareLayout } from "./components/BareLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { VerifyEvents } from "./components/admin/VerifyEvents";
import { EventsList } from "./components/admin/EventsList";
import { VerifyAds } from "./components/admin/VerifyAds";
import Index from "./pages/Index";
import Login from "./components/auth/Login";
import MyEventDashboard from "./components/eventDashboard/EventDashboard";
import { OrganizeEvents } from "./components/eventDashboard/OrganizeEvents";
import EventWatchList from "./components/eventDashboard/EventWatchList";
import { EventsToAttend } from "./components/eventDashboard/EventsToAttend";
import SubmitAdPage from "./components/eventDashboard/SubmitAdPage";
import { EventDetail } from "./pages/EventDetail";
import { PaymentSuccess } from "./components/paymentHandler/PaymentSuccess";
import { PaymentFailure } from "./components/paymentHandler/PaymentFailure";
import { SubscriptionPlans } from "./components/SubscriptionPlans";
import { SubscriptionPaymentSuccess } from "./components/SubscriptionPaymentSuccess";
import { ManageSubscription } from "./components/ManageSubscription";

// Redux slices
import { loadUserFromStorage } from "./redux/slices/authSlice";
import { getAllEventsAsync, setWatchlist } from "./redux/slices/eventSlice";
import { getSubscriptionDetails } from "./redux/slices/subscriptionSlice";
import Recommendations from "./components/eventDashboard/RecommendEvents";
import EventComments from "./components/EventComments";
import { LiveEvents } from "./components/LiveEvents";
import ForgotPassword from "./components/PasswordManagement/ForgotPassword";
import ResetPassword from "./components/PasswordManagement/ResetPassword";
import UpdatePassword from "./components/PasswordManagement/UpdatePassword";
import {
  getAllUserMessages,
  syncMessagesFromServer,
} from "./redux/slices/messageSlice";
import { socketManager } from "./utils/socketManager";
import BannerGenerator from "./components/BannerGenerator";
import { Toaster } from "sonner";
import AutoCheckInDetector from "./components/AutoCheckInDetector";
import Signup from "./components/auth/Signup";
import EventChatbot from "./components/EventChatbox";

function App() {
  const user = useSelector((state) => state.auth.user);
  const events = useSelector((state) => state.events.allEvents);
  console.log(events);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllEventsAsync());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSubscriptionDetails());
  }, [dispatch]);

  // Socket management
  useEffect(() => {
    if (user) {
      // Initialize socket connection
      socketManager.connect(user);

      // Load all user messages when app starts
      dispatch(syncMessagesFromServer());
    } else {
      // Disconnect socket when user logs out
      socketManager.disconnect();
    }

    return () => {
      // Cleanup on app unmount
      socketManager.disconnect();
    };
  }, [user, dispatch]);

  const userId = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    // Load watchlist from localStorage on app start
    const savedWatchlist = localStorage.getItem("userWatchlist");
    if (savedWatchlist) {
      try {
        const watchlistArray = JSON.parse(savedWatchlist);
        dispatch(setWatchlist(watchlistArray));
      } catch (error) {
        console.error("Error parsing watchlist from localStorage:", error);
      }
    }
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        {user && <EventChatbot events={events} />}
        {/* NEW: Add AutoCheckInDetector here - it will show on all pages when user is logged in */}
        {user && <AutoCheckInDetector />}

        <Routes>
          {/* Routes with conditional Navbar/Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/subscription" element={<SubscriptionPlans />} />
            <Route
              path="/subscription/manage"
              element={<ManageSubscription />}
            />
            <Route path="/live" element={<LiveEvents />} />
          </Route>
          <Route path="/events/:id/comment" element={<EventComments />} />

          {/* Auth routes (no Navbar/Footer) */}
          <Route element={<BareLayout />}>
            <Route path="register" element={<Signup />} />
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="password/reset/:token" element={<ResetPassword />} />
            <Route path="/change-password" element={<UpdatePassword />} />
          </Route>

          {/* User dashboard routes */}
          <Route path="/myevents" element={<MyEventDashboard />}>
            <Route index element={<OrganizeEvents />} />
            <Route path="organize" element={<OrganizeEvents />} />
            <Route path="watchlist" element={<EventWatchList />} />
            <Route path="attend" element={<EventsToAttend />} />
            <Route path="submit-ad" element={<SubmitAdPage />} />
            <Route
              path="recommended"
              element={<Recommendations userId={userId} />}
            />

            <Route path="banner-generator" element={<BannerGenerator />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="verify" element={<VerifyEvents />} />
            <Route path="events" element={<EventsList />} />
            <Route path="verifyads" element={<VerifyAds />} />
          </Route>

          {/* Payment Routes */}
          <Route path="/payment-success" element={<PaymentSuccessHandler />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/events/:id" element={<EventDetail />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function PaymentSuccessHandler() {
  const [searchParams] = useSearchParams();
  const action = searchParams.get("action");

  if (action === "subscription") {
    return <SubscriptionPaymentSuccess />;
  } else if (action === "addToEventsToAttend") {
    return <PaymentSuccess />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default App;
