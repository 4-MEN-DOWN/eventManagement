// import React, { useState } from "react";
// import {
//   Calendar,
//   Star,
//   Users,
//   MessageCircle,
//   ChevronDown,
// } from "lucide-react";

// const CreateEventSection = () => {
//   const [openIndex, setOpenIndex] = useState(null);

//   const faqs = [
//     {
//       question:
//         "What advertisement options are available and how much do they cost?",
//       answer:
//         "We offer multiple ad formats including banner ads, featured event promotions, and homepage highlights. Pricing varies depending on duration and placement, starting as low as $10 per day.",
//     },
//     {
//       question: "How does the subscription plan work?",
//       answer:
//         "Our subscription gives organizers access to premium tools like advanced analytics, unlimited event postings, and reduced service fees. Plans start at $19/month.",
//     },
//     {
//       question: "Can I manage attendees and ticketing through the platform?",
//       answer:
//         "Yes! EventFlow provides a full ticketing system, attendee check-in tools, and real-time sales tracking for organizers.",
//     },
//     {
//       question: "Do you support free as well as paid events?",
//       answer:
//         "Absolutely. You can host both free and paid events. For paid events, we handle secure payment processing on your behalf.",
//     },
//     {
//       question: "How do I track event performance?",
//       answer:
//         "With our built-in dashboard, you can monitor ticket sales, ad engagement, and attendance in real-time to optimize your event strategy.",
//     },
//   ];

//   const features = [
//     {
//       title: "Easy Event Management",
//       description:
//         "Create and manage events with intuitive tools and real-time analytics to stay in control at every step.",
//       icon: <Calendar className="h-7 w-7 text-white" />,
//       bg: "bg-gradient-to-tr from-purple-500 to-indigo-500",
//     },
//     {
//       title: "Reach More People",
//       description:
//         "Connect with a broader audience and increase event attendance effortlessly with built-in promotion tools.",
//       icon: <Users className="h-7 w-7 text-white" />,
//       bg: "bg-gradient-to-tr from-blue-500 to-cyan-400",
//     },
//     {
//       title: "Premium Experience",
//       description:
//         "Deliver exceptional experiences with our comprehensive and modern event management platform.",
//       icon: <Star className="h-7 w-7 text-white" />,
//       bg: "bg-gradient-to-tr from-green-400 to-emerald-500",
//     },
//   ];

//   const toggleFAQ = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-24">
//       {/* Header */}
//       <div className="text-center mb-24">
//         <h3 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
//           Why Choose{" "}
//           <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
//             EventFlow?
//           </span>
//         </h3>
//         <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
//           We empower organizers with powerful tools to create, promote, and
//           manage events seamlessly — all in one platform.
//         </p>
//       </div>

//       {/* Features & FAQ Grid */}
//       <div className="grid lg:grid-cols-2 gap-20">
//         {/* Features */}
//         <div className="space-y-12">
//           {features.map((feature, idx) => (
//             <div
//               key={idx}
//               className={`group flex flex-col md:flex-row items-center md:items-start gap-6 p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent bg-white`}
//             >
//               <div
//                 className={`flex items-center justify-center w-16 h-16 rounded-xl ${feature.bg} transform transition-transform duration-300 group-hover:scale-110`}
//               >
//                 {feature.icon}
//               </div>
//               <div>
//                 <h4 className="text-2xl font-semibold text-gray-800 mb-2">
//                   {feature.title}
//                 </h4>
//                 <p className="text-gray-600 text-base md:text-sm leading-relaxed">
//                   {feature.description}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* FAQ Section */}
//         <div className="space-y-6">
//           <h4 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 mb-8">
//             Frequently Asked Questions
//           </h4>

//           {faqs.map((faq, index) => (
//             <div
//               key={index}
//               className="bg-gradient-to-tr from-white to-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
//             >
//               <button
//                 onClick={() => toggleFAQ(index)}
//                 className="w-full flex justify-between items-center p-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
//               >
//                 <span className="font-semibold text-gray-800 text-left text-base md:text-lg">
//                   {faq.question}
//                 </span>
//                 <ChevronDown
//                   className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
//                     openIndex === index ? "rotate-180 text-purple-600" : ""
//                   }`}
//                 />
//               </button>
//               <div
//                 className={`px-6 pb-6 text-gray-600 text-base md:text-sm transition-all duration-500 ease-in-out overflow-hidden ${
//                   openIndex === index
//                     ? "max-h-96 opacity-100"
//                     : "max-h-0 opacity-0"
//                 }`}
//               >
//                 {faq.answer}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateEventSection;
import React, { useState } from "react";
import {
  Calendar,
  Star,
  Users,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

// The main component for the redesigned section
const CreateEventSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question:
        "What advertisement options are available and how much do they cost?",
      answer:
        "We offer multiple ad formats including banner ads, featured event promotions, and homepage highlights. Pricing varies depending on duration and placement, starting as low as $10 per day.",
    },
    {
      question: "How does the subscription plan work?",
      answer:
        "Our subscription gives organizers access to premium tools like advanced analytics, unlimited event postings, and reduced service fees. Plans start at $19/month.",
    },
    {
      question: "Can I manage attendees and ticketing through the platform?",
      answer:
        "Yes! EventFlow provides a full ticketing system, attendee check-in tools, and real-time sales tracking for organizers.",
    },
    {
      question: "Do you support free as well as paid events?",
      answer:
        "Absolutely. You can host both free and paid events. For paid events, we handle secure payment processing on your behalf.",
    },
    {
      question: "How do I track event performance?",
      answer:
        "With our built-in dashboard, you can monitor ticket sales, ad engagement, and attendance in real-time to optimize your event strategy.",
    },
  ];

  const features = [
    {
      title: "Easy Event Management",
      description:
        "Create and manage events with intuitive tools and real-time analytics to stay in control at every step.",
      icon: <Calendar className="h-7 w-7 text-white" />,
      bg: "bg-gradient-to-tr from-purple-500 to-indigo-500",
    },
    {
      title: "Reach More People",
      description:
        "Connect with a broader audience and increase event attendance effortlessly with built-in promotion tools.",
      icon: <Users className="h-7 w-7 text-white" />,
      bg: "bg-gradient-to-tr from-blue-500 to-cyan-400",
    },
    {
      title: "Premium Experience",
      description:
        "Deliver exceptional experiences with our comprehensive and modern event management platform.",
      icon: <Star className="h-7 w-7 text-white" />,
      bg: "bg-gradient-to-tr from-green-400 to-emerald-500",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 font-sans leading-relaxed text-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header Section */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Why Choose{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Hamro Event?
            </span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            We empower organizers with powerful tools to create, promote, and
            manage events seamlessly — all in one platform.
          </p>
        </div>

        {/* Features & FAQ Grid */}
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Features Section */}
          <div className="space-y-12">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`
                  group flex flex-col md:flex-row items-center md:items-start gap-6 p-6 rounded-3xl
                  bg-white border border-gray-100 shadow-xl
                  transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl
                `}
              >
                <div
                  className={`flex items-center justify-center w-16 h-16 rounded-xl ${feature.bg} 
                    shadow-lg
                    transform transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-500 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 mb-8">
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                  <span className="font-semibold text-gray-800 text-left text-base md:text-lg">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180 text-purple-600" : ""
                    }`}
                  />
                </button>
                <div
                  className={`
                    px-6 pb-6 text-gray-600 text-base transition-all duration-500 ease-in-out
                    ${
                      openIndex === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventSection;
