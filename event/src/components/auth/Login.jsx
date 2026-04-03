import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  clearError,
  clearSuccess,
} from "../../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, successMessage, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ── Toast handling
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearSuccess());
    }
  }, [successMessage, dispatch]);

  // ── NAVIGATION + DISABLE BACK BUTTON
  useEffect(() => {
    if (user) {
      const targetPath = user.role === "admin" ? "/admin" : "/";

      const timer = setTimeout(() => {
        // 1. Replace login with dashboard
        navigate(targetPath, { replace: true });

        // 2. Disable back button by pushing a dummy state
        //    This makes the history look like: ... → dashboard → (dummy)
        //    So back button stays on dashboard.
        window.history.pushState(null, "", window.location.href);

        // 3. Block any further back navigation
        const blockBack = () => {
          window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", blockBack);

        // Cleanup on unmount (e.g., logout)
        return () => {
          window.removeEventListener("popstate", blockBack);
        };
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-100/50 backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                placeholder="••••••••"
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
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
