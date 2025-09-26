import React from "react";
import { Facebook, Mail, Phone } from "lucide-react";
import logo from "../assets/logo.jpg";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-lg flex items-center justify-center">
                 <img src={logo} alt="Logo" className="w-20 h-20 object-contain"/>
              </div>
              <div>
                <h3 className="text-xl font-bold">Educamp</h3>
                <p className="text-sm text-emerald-400">
                  Vidura Higher Education Centre
                </p>
              </div>
            </div>
            <p className="text-slate-300 mb-4">
              Best Teachers with Best results for your Best Class. Serving
              students from Grades 6 to 11.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 mt-0.5 text-emerald-400">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-300">
                    Vidura Higher Education Institution
                    <br />
                    Thalawa Road, Kekirawa
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400" />
                <a
                  href="mailto:info@educamp.lk"
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  info@Vidura.lk
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-400" />
                <div className="text-slate-300">
                  <p>025 324 7560</p>
                  <p>070 243 9721</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=100066134127283&mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <div className="text-slate-300">
                <span>Vidura</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2025 Educamp - Vidura Higher Education Institute. All rights
            reserved.
          </p>
          <p className="text-slate-400 text-sm mt-2 sm:mt-0">
            
            <a
              rel="nofollow"
              target="_blank"
              href="https://meku.dev"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
