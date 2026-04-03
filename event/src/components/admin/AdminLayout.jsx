// import { useState, useRef, useEffect } from "react";
// import { Outlet, useNavigate } from "react-router-dom";
// import { Settings, Menu, X, User, LogOut, Key } from "lucide-react";
// import { AdminSidebar } from "./AdminSidebar";
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser, updatePassword } from "../../redux/slices/authSlice";
// import { toast } from "sonner";

// export function AdminLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [showSettingsMenu, setShowSettingsMenu] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmNewPassword: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   const profileMenuRef = useRef(null);
//   const settingsMenuRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         profileMenuRef.current &&
//         !profileMenuRef.current.contains(event.target)
//       ) {
//         setShowProfileMenu(false);
//       }
//       if (
//         settingsMenuRef.current &&
//         !settingsMenuRef.current.contains(event.target)
//       ) {
//         setShowSettingsMenu(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       setShowProfileMenu(false);
//       toast.success("Logged out successfully");
//       navigate("/login");
//     } catch (error) {
//       toast.error(error || "Logout failed");
//     }
//   };

//   const handleUpdatePassword = async (e) => {
//     e.preventDefault();

//     if (passwordData.newPassword !== passwordData.confirmNewPassword) {
//       toast.error("New passwords don't match");
//       return;
//     }

//     if (passwordData.newPassword.length < 6) {
//       toast.error("Password must be at least 6 characters long");
//       return;
//     }

//     setLoading(true);
//     try {
//       const requestData = {
//         currentPassword: passwordData.currentPassword,
//         newPassword: passwordData.newPassword,
//         confirmNewPassword: passwordData.confirmNewPassword,
//       };

//       await dispatch(updatePassword(requestData)).unwrap();

//       setShowPasswordModal(false);
//       setShowSettingsMenu(false);
//       setPasswordData({
//         currentPassword: "",
//         newPassword: "",
//         confirmNewPassword: "",
//       });
//       toast.success("Password updated successfully");
//     } catch (error) {
//       toast.error(error || "Password update failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePasswordChange = (e) => {
//     setPasswordData({
//       ...passwordData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       <div
//         className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//       `}
//       >
//         <AdminSidebar onClose={() => setSidebarOpen(false)} />
//       </div>

//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
//               >
//                 {sidebarOpen ? (
//                   <X className="w-5 h-5" />
//                 ) : (
//                   <Menu className="w-5 h-5" />
//                 )}
//               </button>

//               <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
//                 Admin Panel
//               </h1>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="relative" ref={profileMenuRef}>
//                 <button
//                   onClick={() => {
//                     setShowProfileMenu(!showProfileMenu);
//                     setShowSettingsMenu(false);
//                   }}
//                   className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer"
//                 >
//                   <User className="w-4 h-4 text-purple-600" />
//                 </button>

//                 {showProfileMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
//                     <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
//                       <p className="font-medium">{user?.name || "Admin"}</p>
//                       <p className="text-gray-500 text-xs">{user?.email}</p>
//                     </div>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                     >
//                       <LogOut className="w-4 h-4 mr-2" />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>

//               <div className="relative" ref={settingsMenuRef}>
//                 <button
//                   onClick={() => {
//                     setShowSettingsMenu(!showSettingsMenu);
//                     setShowProfileMenu(false);
//                   }}
//                   className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
//                 >
//                   <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
//                 </button>

//                 {showSettingsMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
//                     <button
//                       onClick={() => {
//                         setShowPasswordModal(true);
//                         setShowSettingsMenu(false);
//                       }}
//                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
//                     >
//                       <Key className="w-4 h-4 mr-2" />
//                       Update Password
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 p-4 sm:p-6 overflow-auto">
//           <Outlet />
//         </main>
//       </div>

//       {showPasswordModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg w-full max-w-md">
//             <div className="p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Update Password
//               </h2>

//               <form onSubmit={handleUpdatePassword}>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Current Password
//                     </label>
//                     <input
//                       type="password"
//                       name="currentPassword"
//                       value={passwordData.currentPassword}
//                       onChange={handlePasswordChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       New Password
//                     </label>
//                     <input
//                       type="password"
//                       name="newPassword"
//                       value={passwordData.newPassword}
//                       onChange={handlePasswordChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       required
//                       minLength={6}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Confirm New Password
//                     </label>
//                     <input
//                       type="password"
//                       name="confirmNewPassword"
//                       value={passwordData.confirmNewPassword}
//                       onChange={handlePasswordChange}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       required
//                       minLength={6}
//                     />
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-3 mt-6">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowPasswordModal(false);
//                       setPasswordData({
//                         currentPassword: "",
//                         newPassword: "",
//                         confirmNewPassword: "",
//                       });
//                     }}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     {loading ? "Updating..." : "Update Password"}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Settings, Menu, X, User, LogOut, Key } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updatePassword } from "../../redux/slices/authSlice";
import { toast } from "sonner";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const profileMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setShowProfileMenu(false);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      };

      await dispatch(updatePassword(requestData)).unwrap();

      setShowPasswordModal(false);
      setShowSettingsMenu(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowSettingsMenu(false);
                  }}
                  className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-purple-600" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{user?.name || "Admin"}</p>
                      <p className="text-gray-500 text-xs">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <div className="relative" ref={settingsMenuRef}>
                <button
                  onClick={() => {
                    setShowSettingsMenu(!showSettingsMenu);
                    setShowProfileMenu(false);
                  }}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowSettingsMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Update Password
              </h2>

              <form onSubmit={handleUpdatePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordData.confirmNewPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
