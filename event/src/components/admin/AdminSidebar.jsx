// import { NavLink, useLocation } from "react-router-dom";
// import { Home, CheckCircle, List, Users, Megaphone, X } from "lucide-react";

// const navigation = [
//   { name: "Home", href: "/admin", icon: Home },
//   { name: "Verify Events", href: "/admin/verify", icon: CheckCircle },
//   { name: "Events List", href: "/admin/events", icon: List },
//   { name: "AD Request", href: "/admin/verifyads", icon: Megaphone },
// ];

// export function AdminSidebar({ onClose }) {
//   const location = useLocation();

//   const handleNavClick = () => {
//     // Close sidebar on mobile when a link is clicked
//     if (window.innerWidth < 1024) {
//       onClose?.();
//     }
//   };

//   return (
//     <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
//       {/* Logo Section */}
//       <div className="p-6 border-b border-gray-700 flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
//             <span className="text-gray-900 font-bold text-sm">E</span>
//           </div>
//           <span className="text-lg font-semibold">Hamro Event</span>
//         </div>

//         {/* Close button for mobile */}
//         <button
//           onClick={onClose}
//           className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4">
//         <ul className="space-y-2">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <li key={item.name}>
//                 <NavLink
//                   to={item.href}
//                   onClick={handleNavClick}
//                   className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     isActive
//                       ? "bg-purple-600 text-white shadow-lg"
//                       : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
//                   }`}
//                 >
//                   <item.icon className="w-5 h-5 flex-shrink-0" />
//                   <span className="truncate">{item.name}</span>
//                 </NavLink>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* User Info */}
//       <div className="p-4 border-t border-gray-700">
//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//             <Users className="w-4 h-4 text-white" />
//           </div>
//           <div className="min-w-0">
//             <p className="text-sm font-medium truncate">Admin</p>
//             <p className="text-xs text-gray-400 truncate">administrator</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { NavLink, useLocation } from "react-router-dom";
import { Home, CheckCircle, List, Users, Megaphone, X } from "lucide-react";

const navigation = [
  { name: "Home", href: "/admin", icon: Home },
  { name: "Verify Events", href: "/admin/verify", icon: CheckCircle },
  { name: "Events List", href: "/admin/events", icon: List },
  { name: "AD Request", href: "/admin/verifyads", icon: Megaphone },
];

export function AdminSidebar({ onClose }) {
  const location = useLocation();

  const handleNavClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">E</span>
          </div>
          <span className="text-lg font-semibold">Hamro Event</span>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info - This will now stick to the bottom based on content height */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
