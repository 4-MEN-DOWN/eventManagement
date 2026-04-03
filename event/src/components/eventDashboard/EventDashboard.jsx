import React, { useState } from "react";
import {
  Menu,
  X,
  Calendar,
  Heart,
  Users,
  ChevronRight,
  LayoutDashboard,
  Megaphone,
  Star,
  ArrowLeft,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const MyEventDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 w-72 transform bg-gray-800 border-r border-gray-700 p-6 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } md:translate-x-0 md:relative md:flex md:flex-col`}
      >
        {/* Back Arrow Section */}
        <NavLink to="/">
          <div className="flex items-center mb-6 cursor-pointer group">
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="ml-2 text-gray-400 group-hover:text-white font-medium transition-colors text-sm">
              Back
            </span>
          </div>
        </NavLink>

        {/* Dashboard Header Section */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            My Events
          </h2>
        </div>

        {/* Close button for mobile */}
        <button
          className="md:hidden p-1 rounded-full hover:bg-gray-700 absolute top-6 right-6"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          <NavLink
            to="organize"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <span>Events to Organize</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </NavLink>

          <NavLink
            to="watchlist"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-1.5 bg-pink-500/20 rounded-lg">
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <span>Event Watchlist</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </NavLink>

          <NavLink
            to="attend"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <span>Events to Attend</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </NavLink>

          <NavLink
            to="recommended"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <Star className="text-yellow-500 w-6 h-6" />
            </div>
            <span>Recommended Events</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </NavLink>

          <NavLink
            to="submit-ad"
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="p-1.5 bg-indigo-500/20 rounded-lg">
              <Megaphone className="w-5 h-5 text-indigo-400" />
            </div>
            <span>Submit Ad Request</span>
            <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Hamro Event</div>
          <div className="text-xs text-gray-500">© 2023.</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            My Events Dashboard
          </h1>
          <div className="w-5 h-5"></div> {/* Spacer for alignment */}
        </div>

        {/* Content Area */}
        <div className="h-full overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyEventDashboard;
