// // import { useEffect, useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
// // import {
// //   filterByCategory,
// //   clearFilter,
// //   getAllEventsAsync,
// // } from "../redux/slices/eventSlice";
// // import EventCard from "./EventCard";

// // export const EventGrid = () => {
// //   const dispatch = useDispatch();
// //   const { allEvents, filteredEvents, activeCategory, loading } = useSelector(
// //     (state) => state.events
// //   );
// //   console.log(allEvents);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [eventsPerPage] = useState(6);
// //   const [searchQuery, setSearchQuery] = useState(""); // New search state

// //   useEffect(() => {
// //     dispatch(getAllEventsAsync());
// //   }, [dispatch]);

// //   const events = allEvents || [];

// //   const categories = [
// //     "All",
// //     "Technology",
// //     "Music",
// //     "Food",
// //     "Arts",
// //     "Business",
// //     "Wellness",
// //   ];

// //   const getMappedCategory = (eventCategory) => {
// //     if (!eventCategory) return "Other";

// //     const lowerCategory = eventCategory.toLowerCase();
// //     if (lowerCategory.includes("tech")) return "Technology";
// //     if (lowerCategory.includes("music") || lowerCategory.includes("concert"))
// //       return "Music";
// //     if (lowerCategory.includes("food") || lowerCategory.includes("drink"))
// //       return "Food";
// //     if (lowerCategory.includes("art") || lowerCategory.includes("culture"))
// //       return "Arts";
// //     if (
// //       lowerCategory.includes("business") ||
// //       lowerCategory.includes("networking")
// //     )
// //       return "Business";
// //     if (lowerCategory.includes("wellness") || lowerCategory.includes("health"))
// //       return "Wellness";

// //     return eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1);
// //   };

// //   // Filter and search combined
// //   const displayEvents = (
// //     activeCategory === "All" || !activeCategory
// //       ? events
// //       : filteredEvents.length > 0
// //       ? filteredEvents
// //       : events.filter(
// //           (event) => getMappedCategory(event.category) === activeCategory
// //         )
// //   ).filter((event) =>
// //     event.title.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   useEffect(() => {
// //     setCurrentPage(1);
// //   }, [activeCategory, events, searchQuery]);

// //   const indexOfLastEvent = currentPage * eventsPerPage;
// //   const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
// //   const currentEvents = displayEvents.slice(
// //     indexOfFirstEvent,
// //     indexOfLastEvent
// //   );
// //   const totalPages = Math.ceil(displayEvents.length / eventsPerPage);

// //   const paginate = (pageNumber) => setCurrentPage(pageNumber);
// //   const nextPage = () =>
// //     currentPage < totalPages && setCurrentPage(currentPage + 1);
// //   const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

// //   const getPageNumbers = () => {
// //     const pageNumbers = [];
// //     const maxVisiblePages = 5;
// //     if (totalPages <= maxVisiblePages) {
// //       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
// //     } else {
// //       const startPage = Math.max(
// //         1,
// //         currentPage - Math.floor(maxVisiblePages / 2)
// //       );
// //       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
// //       for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
// //     }
// //     return pageNumbers;
// //   };

// //   if (loading) {
// //     return (
// //       <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
// //         <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
// //           Upcoming Events
// //         </h2>
// //         <p className="text-gray-600">Loading events...</p>
// //       </section>
// //     );
// //   }

// //   return (
// //     <section className="py-20 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Section Header */}
// //         <div className="text-center mb-8">
// //           <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
// //             Upcoming Events
// //           </h2>
// //           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
// //             Discover exciting events happening near you and around the world
// //           </p>
// //         </div>

// //         {/* Search Bar */}
// //         <div className="flex justify-center mb-6">
// //           <input
// //             type="text"
// //             placeholder="Search events..."
// //             value={searchQuery}
// //             onChange={(e) => setSearchQuery(e.target.value)}
// //             className="w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
// //           />
// //         </div>

// //         {/* Filter Bar */}
// //         <div className="flex flex-wrap gap-4 justify-center mb-12">
// //           {categories.map((category) => (
// //             <button
// //               key={category}
// //               onClick={() =>
// //                 category === "All"
// //                   ? dispatch(clearFilter())
// //                   : dispatch(filterByCategory(category))
// //               }
// //               className={`flex items-center px-4 py-2 rounded-md border transition-colors duration-200 ${
// //                 activeCategory === category
// //                   ? "bg-purple-50 border-purple-300 text-purple-700"
// //                   : "text-gray-600 border-transparent hover:text-purple-600 hover:bg-purple-50"
// //               }`}
// //             >
// //               {category === "All" && <Filter className="h-4 w-4 mr-2" />}
// //               {category === "Food" ? "Food & Drink" : category}
// //             </button>
// //           ))}

// //           {activeCategory && activeCategory !== "All" && (
// //             <button
// //               onClick={() => dispatch(clearFilter())}
// //               className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
// //             >
// //               Clear Filter
// //             </button>
// //           )}
// //         </div>

// //         {/* Event Count */}
// //         <div className="text-center mb-6">
// //           <p className="text-gray-600">
// //             Showing {Math.min(indexOfFirstEvent + 1, displayEvents.length)}-
// //             {Math.min(indexOfLastEvent, displayEvents.length)} of{" "}
// //             {displayEvents.length} events
// //             {activeCategory &&
// //               activeCategory !== "All" &&
// //               ` in ${activeCategory}`}
// //           </p>
// //         </div>

// //         {/* Event Grid */}
// //         {currentEvents.length > 0 ? (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
// //             {currentEvents.map((event) => (
// //               <EventCard key={event._id} event={event} />
// //             ))}
// //           </div>
// //         ) : (
// //           <div className="text-center py-12">
// //             <p className="text-gray-500 text-lg">
// //               {events.length === 0
// //                 ? "No events available."
// //                 : "No events found matching your search/filter."}
// //             </p>
// //           </div>
// //         )}

// //         {/* Pagination */}
// //         {totalPages > 1 && (
// //           <div className="flex justify-center items-center mt-12">
// //             <nav className="flex items-center space-x-2">
// //               <button
// //                 onClick={prevPage}
// //                 disabled={currentPage === 1}
// //                 className={`p-2 rounded-md border ${
// //                   currentPage === 1
// //                     ? "text-gray-400 cursor-not-allowed"
// //                     : "text-gray-700 hover:bg-gray-100"
// //                 }`}
// //               >
// //                 <ChevronLeft className="h-5 w-5" />
// //               </button>

// //               {getPageNumbers().map((number) => (
// //                 <button
// //                   key={number}
// //                   onClick={() => paginate(number)}
// //                   className={`h-10 w-10 rounded-md border flex items-center justify-center ${
// //                     currentPage === number
// //                       ? "bg-purple-600 text-white border-purple-600"
// //                       : "text-gray-700 border-gray-300 hover:bg-gray-100"
// //                   }`}
// //                 >
// //                   {number}
// //                 </button>
// //               ))}

// //               <button
// //                 onClick={nextPage}
// //                 disabled={currentPage === totalPages}
// //                 className={`p-2 rounded-md border ${
// //                   currentPage === totalPages
// //                     ? "text-gray-400 cursor-not-allowed"
// //                     : "text-gray-700 hover:bg-gray-100"
// //                 }`}
// //               >
// //                 <ChevronRight className="h-5 w-5" />
// //               </button>
// //             </nav>
// //           </div>
// //         )}
// //       </div>
// //     </section>
// //   );
// // };
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
// import {
//   filterByCategory,
//   clearFilter,
//   getAllEventsAsync,
// } from "../redux/slices/eventSlice";
// import EventCard from "./EventCard";

// export const EventGrid = () => {
//   const dispatch = useDispatch();
//   const { allEvents, filteredEvents, activeCategory, loading } = useSelector(
//     (state) => state.events
//   );
//   const [currentPage, setCurrentPage] = useState(1);
//   const [eventsPerPage] = useState(6);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     dispatch(getAllEventsAsync());
//   }, [dispatch]);

//   // Filter events to show only approved events with today's and onward dates
//   const getFilteredEvents = () => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0); // Set to start of today for accurate date comparison

//     return allEvents.filter((event) => {
//       // Check if event is approved
//       const isApproved = event.status === "approved";

//       // Check if event date is today or in the future
//       const eventDate = new Date(event.date);
//       eventDate.setHours(0, 0, 0, 0); // Set to start of event date for accurate comparison
//       const isTodayOrFuture = eventDate >= today;

//       return isApproved && isTodayOrFuture;
//     });
//   };

//   const events = getFilteredEvents();

//   const categories = [
//     "All",
//     "Technology",
//     "Music",
//     "Food",
//     "Arts",
//     "Business",
//     "Wellness",
//   ];

//   const getMappedCategory = (eventCategory) => {
//     if (!eventCategory) return "Other";

//     const lowerCategory = eventCategory.toLowerCase();
//     if (lowerCategory.includes("tech")) return "Technology";
//     if (lowerCategory.includes("music") || lowerCategory.includes("concert"))
//       return "Music";
//     if (lowerCategory.includes("food") || lowerCategory.includes("drink"))
//       return "Food";
//     if (lowerCategory.includes("art") || lowerCategory.includes("culture"))
//       return "Arts";
//     if (
//       lowerCategory.includes("business") ||
//       lowerCategory.includes("networking")
//     )
//       return "Business";
//     if (lowerCategory.includes("wellness") || lowerCategory.includes("health"))
//       return "Wellness";

//     return eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1);
//   };

//   // Filter and search combined
//   const displayEvents = (
//     activeCategory === "All" || !activeCategory
//       ? events
//       : filteredEvents.length > 0
//       ? filteredEvents
//       : events.filter(
//           (event) => getMappedCategory(event.category) === activeCategory
//         )
//   ).filter((event) =>
//     event.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeCategory, events, searchQuery]);

//   const indexOfLastEvent = currentPage * eventsPerPage;
//   const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
//   const currentEvents = displayEvents.slice(
//     indexOfFirstEvent,
//     indexOfLastEvent
//   );
//   const totalPages = Math.ceil(displayEvents.length / eventsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);
//   const nextPage = () =>
//     currentPage < totalPages && setCurrentPage(currentPage + 1);
//   const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

//   const getPageNumbers = () => {
//     const pageNumbers = [];
//     const maxVisiblePages = 5;
//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
//     } else {
//       const startPage = Math.max(
//         1,
//         currentPage - Math.floor(maxVisiblePages / 2)
//       );
//       const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//       for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
//     }
//     return pageNumbers;
//   };

//   if (loading) {
//     return (
//       <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
//         <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//           Upcoming Events
//         </h2>
//         <p className="text-gray-600">Loading events...</p>
//       </section>
//     );
//   }

//   return (
//     <section className="py-20 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center mb-8">
//           <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
//             Upcoming Events
//           </h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Discover exciting approved events happening today and in the future
//           </p>
//         </div>

//         {/* Search Bar */}
//         <div className="flex justify-center mb-6">
//           <input
//             type="text"
//             placeholder="Search events..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full max-w-md px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         {/* Filter Bar */}
//         <div className="flex flex-wrap gap-4 justify-center mb-12">
//           {categories.map((category) => (
//             <button
//               key={category}
//               onClick={() =>
//                 category === "All"
//                   ? dispatch(clearFilter())
//                   : dispatch(filterByCategory(category))
//               }
//               className={`flex items-center px-4 py-2 rounded-md border transition-colors duration-200 ${
//                 activeCategory === category
//                   ? "bg-purple-50 border-purple-300 text-purple-700"
//                   : "text-gray-600 border-transparent hover:text-purple-600 hover:bg-purple-50"
//               }`}
//             >
//               {category === "All" && <Filter className="h-4 w-4 mr-2" />}
//               {category === "Food" ? "Food & Drink" : category}
//             </button>
//           ))}

//           {activeCategory && activeCategory !== "All" && (
//             <button
//               onClick={() => dispatch(clearFilter())}
//               className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
//             >
//               Clear Filter
//             </button>
//           )}
//         </div>

//         {/* Event Count */}
//         <div className="text-center mb-6">
//           <p className="text-gray-600">
//             Showing {Math.min(indexOfFirstEvent + 1, displayEvents.length)}-
//             {Math.min(indexOfLastEvent, displayEvents.length)} of{" "}
//             {displayEvents.length} approved events
//             {activeCategory &&
//               activeCategory !== "All" &&
//               ` in ${activeCategory}`}
//           </p>
//         </div>

//         {/* Event Grid */}
//         {currentEvents.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
//             {currentEvents.map((event) => (
//               <EventCard key={event._id} event={event} />
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <p className="text-gray-500 text-lg">
//               {events.length === 0
//                 ? "No approved upcoming events available."
//                 : "No approved events found matching your search/filter."}
//             </p>
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center items-center mt-12">
//             <nav className="flex items-center space-x-2">
//               <button
//                 onClick={prevPage}
//                 disabled={currentPage === 1}
//                 className={`p-2 rounded-md border ${
//                   currentPage === 1
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </button>

//               {getPageNumbers().map((number) => (
//                 <button
//                   key={number}
//                   onClick={() => paginate(number)}
//                   className={`h-10 w-10 rounded-md border flex items-center justify-center ${
//                     currentPage === number
//                       ? "bg-purple-600 text-white border-purple-600"
//                       : "text-gray-700 border-gray-300 hover:bg-gray-100"
//                   }`}
//                 >
//                   {number}
//                 </button>
//               ))}

//               <button
//                 onClick={nextPage}
//                 disabled={currentPage === totalPages}
//                 className={`p-2 rounded-md border ${
//                   currentPage === totalPages
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <ChevronRight className="h-5 w-5" />
//               </button>
//             </nav>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Filter, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import {
  filterByCategory,
  clearFilter,
  getAllEventsAsync,
} from "../redux/slices/eventSlice";
import EventCard from "./EventCard";

export const EventGrid = () => {
  const dispatch = useDispatch();
  const { allEvents, filteredEvents, activeCategory, loading } = useSelector(
    (state) => state.events
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // New state for date filter

  useEffect(() => {
    dispatch(getAllEventsAsync());
  }, [dispatch]);

  // Filter events to show only approved events and apply date filter if selected
  const getFilteredEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allEvents.filter((event) => {
      // Check if event is approved
      const isApproved = event.status === "approved";

      // Check date based on selected filter
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      let dateMatches = true;

      if (selectedDate) {
        // If a specific date is selected, show only events on that exact date
        const filterDate = new Date(selectedDate);
        filterDate.setHours(0, 0, 0, 0);
        dateMatches = eventDate.getTime() === filterDate.getTime();
      } else {
        // If no date selected, show today and future events
        dateMatches = eventDate >= today;
      }

      return isApproved && dateMatches;
    });
  };

  const events = getFilteredEvents();

  const categories = [
    "All",
    "Technology",
    "Music",
    "Food",
    "Arts",
    "Business",
    "Wellness",
  ];

  const getMappedCategory = (eventCategory) => {
    if (!eventCategory) return "Other";

    const lowerCategory = eventCategory.toLowerCase();
    if (lowerCategory.includes("tech")) return "Technology";
    if (lowerCategory.includes("music") || lowerCategory.includes("concert"))
      return "Music";
    if (lowerCategory.includes("food") || lowerCategory.includes("drink"))
      return "Food";
    if (lowerCategory.includes("art") || lowerCategory.includes("culture"))
      return "Arts";
    if (
      lowerCategory.includes("business") ||
      lowerCategory.includes("networking")
    )
      return "Business";
    if (lowerCategory.includes("wellness") || lowerCategory.includes("health"))
      return "Wellness";

    return eventCategory.charAt(0).toUpperCase() + eventCategory.slice(1);
  };

  // Filter and search combined
  const displayEvents = (
    activeCategory === "All" || !activeCategory
      ? events
      : filteredEvents.length > 0
      ? filteredEvents
      : events.filter(
          (event) => getMappedCategory(event.category) === activeCategory
        )
  ).filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, events, searchQuery, selectedDate]);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = displayEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(displayEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Clear date filter
  const clearDateFilter = () => {
    setSelectedDate("");
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Upcoming Events
        </h2>
        <p className="text-gray-600">Loading events...</p>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exciting approved events{" "}
            {selectedDate
              ? `on ${formatDisplayDate(selectedDate)}`
              : "happening today and in the future"}
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[150px]"
                min={new Date().toISOString().split("T")[0]} // Restrict to today and future dates
              />
            </div>

            {selectedDate && (
              <button
                onClick={clearDateFilter}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                category === "All"
                  ? dispatch(clearFilter())
                  : dispatch(filterByCategory(category))
              }
              className={`flex items-center px-4 py-2 rounded-md border transition-colors duration-200 ${
                activeCategory === category
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "text-gray-600 border-transparent hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              {category === "All" && <Filter className="h-4 w-4 mr-2" />}
              {category === "Food" ? "Food & Drink" : category}
            </button>
          ))}

          {activeCategory && activeCategory !== "All" && (
            <button
              onClick={() => dispatch(clearFilter())}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
            >
              Clear Category
            </button>
          )}
        </div>

        {/* Event Count */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Showing {Math.min(indexOfFirstEvent + 1, displayEvents.length)}-
            {Math.min(indexOfLastEvent, displayEvents.length)} of{" "}
            {displayEvents.length} approved events
            {selectedDate && ` on ${formatDisplayDate(selectedDate)}`}
            {activeCategory &&
              activeCategory !== "All" &&
              ` in ${activeCategory}`}
          </p>
        </div>

        {/* Event Grid */}
        {currentEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {events.length === 0
                ? selectedDate
                  ? `No approved events found on ${formatDisplayDate(
                      selectedDate
                    )}.`
                  : "No approved upcoming events available."
                : "No approved events found matching your search/filter."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPageNumbers().map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`h-10 w-10 rounded-md border flex items-center justify-center ${
                    currentPage === number
                      ? "bg-purple-600 text-white border-purple-600"
                      : "text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};
