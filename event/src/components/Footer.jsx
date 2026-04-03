import {
  Heart,
  Mail,
  Phone,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-12 pb-8 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-700/10" />
      <div className="absolute top-10 left-10 w-12 h-12 bg-purple-300 rounded-full opacity-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-10 animate-pulse delay-1000" />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex justify-between mb-10">
          {/* About Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Hamro Event
            </h2>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              Connecting communities through unforgettable experiences. Create,
              discover, and attend events that matter to you.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Twitter, color: "text-blue-400" },
                { icon: Instagram, color: "text-pink-400" },
                { icon: Facebook, color: "text-blue-500" },
                { icon: Linkedin, color: "text-blue-300" },
              ].map((Social, i) => (
                <a
                  key={i}
                  href="#"
                  className={`${Social.color} hover:text-white transition-colors`}
                >
                  <Social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-4 w-4 text-purple-300 mt-1 mr-2" />
                <span className="text-slate-300 text-sm">
                  hamroevent@gmail.com
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="h-4 w-4 text-blue-300 mt-1 mr-2" />
                <span className="text-slate-300 text-sm">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-indigo-300 mt-1 mr-2" />
                <span className="text-slate-300 text-sm">
                  123 Gyaneshwor , Ktm
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-xs mb-3 md:mb-0">
            © {new Date().getFullYear()} Hamro Event. All rights reserved.
          </p>
          <div className="flex items-center text-slate-400 text-xs">
            <span>Made with</span>
            <Heart className="h-3 w-3 mx-1 text-pink-500 fill-current" />
            <span>by Hamro Event Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
