// import { Outlet, useLocation } from "react-router-dom";
// import { Footer } from "./Footer";
// import { Navbar } from "./Navbar";
// import { useState } from "react";
// import { CreateEventModal } from "./CreateEventModal";

// export const MainLayout = () => {
//   const location = useLocation();
//   const hideNavbarFooter = ["/login", "/register", "/"].includes(
//     location.pathname
//   );

//   // State for Create Event modal
//   const [showCreateEventModal, setShowCreateEventModal] = useState(false);
//   const [eventToOrganize, setEventToOrganize] = useState(null);

//   const handleOpenCreateEventModal = () => {
//     setEventToOrganize({
//       title: "",
//       description: "",
//       date: "",
//       time: "",
//       location: "",
//       category: "",
//       price: "",
//     });
//     setShowCreateEventModal(true);
//   };

//   return (
//     <div className="flex flex-col min-h-screen">
//       {!hideNavbarFooter && (
//         <Navbar onOpenCreateEventModal={handleOpenCreateEventModal} />
//       )}

//       <main className="flex-grow">
//         <Outlet />
//       </main>

//       {!hideNavbarFooter && <Footer />}

//       {showCreateEventModal && (
//         <CreateEventModal
//           event={eventToOrganize}
//           onClose={() => setShowCreateEventModal(false)}
//         />
//       )}
//     </div>
//   );
// };
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { useState } from "react";
import { CreateEventModal } from "./CreateEventModal";

export const MainLayout = () => {
  const location = useLocation();

  // Separate logic for navbar and footer
  const hideNavbar = ["/login", "/register", "/"].includes(location.pathname);
  const hideFooter = ["/login", "/register"].includes(location.pathname); // Footer visible on landing page

  // State for Create Event modal
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [eventToOrganize, setEventToOrganize] = useState(null);

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

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && (
        <Navbar onOpenCreateEventModal={handleOpenCreateEventModal} />
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      {!hideFooter && <Footer />}

      {showCreateEventModal && (
        <CreateEventModal
          event={eventToOrganize}
          onClose={() => setShowCreateEventModal(false)}
        />
      )}
    </div>
  );
};
