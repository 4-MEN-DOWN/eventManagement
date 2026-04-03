import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  verifyOtp,
  clearError,
  clearSuccess,
} from "../../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, successMessage, user } = useSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState("register");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setHasShownSuccess(false);
    dispatch(registerUser(formData)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setStep("otp");
      }
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setHasShownSuccess(false);
    dispatch(verifyOtp({ email: formData.email, otp }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle success messages
  useEffect(() => {
    if (successMessage && !hasShownSuccess) {
      if (step === "register") {
        toast.success(successMessage);
      } else if (step === "otp" && user) {
        toast.success(successMessage);

        // Navigate after showing success message for OTP verification
        const timer = setTimeout(() => {
          navigate("/");
        }, 1500);

        return () => clearTimeout(timer);
      }
      setHasShownSuccess(true);
      dispatch(clearSuccess());
    }
  }, [successMessage, hasShownSuccess, step, user, dispatch, navigate]);

  // Handle user state change for OTP verification
  useEffect(() => {
    if (user && step === "otp" && !hasShownSuccess) {
      // If user is set after OTP verification but we haven't shown success
      const timer = setTimeout(() => {
        navigate("/");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, step, hasShownSuccess, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-100/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === "register" ? "Create Account" : "Verify OTP"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "register"
              ? "Enter your details to sign up."
              : "Enter the OTP sent to your email."}
          </p>
        </div>

        {step === "register" && (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Registering...
                </div>
              ) : (
                "Register"
              )}
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Login
                </Link>
              </span>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter OTP sent to your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 text-center text-lg font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Didn't receive OTP?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setHasShownSuccess(false);
                    dispatch(registerUser(formData));
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Resend
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
