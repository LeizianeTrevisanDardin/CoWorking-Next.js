import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo */}
          <div>
            <Image
              src="/images/coworkingNoBckg.png"
              alt="Coworking App"
              width={150}
              height={70}
            />

            <p className="text-gray-400 mt-4 text-sm leading-6">
              Find modern coworking spaces with ease.
              Discover verified properties, flexible
              workspaces and secure bookings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/why-choose-us"
                  className="hover:text-white transition"
                >
                  Why Choose Us
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  href="/register"
                  className="hover:text-white transition"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-5">
              Resources
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="font-semibold text-lg mb-5">
              Follow Us
            </h3>

            <div className="flex gap-4">

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 transition-all duration-300"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 transition-all duration-300"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-900 transition-all duration-300"
              >
                <FaXTwitter size={18} />
              </a>

              <a
                href="#"
                className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-r hover:from-gray-700 hover:to-purple-600 transition-all duration-300"
              >
                <FaGithub size={18} />
              </a>

            </div>

            <p className="text-gray-400 text-sm mt-5 leading-6">
              Stay connected with our latest updates and discover
              new coworking opportunities.
            </p>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">

          <p>
            © {new Date().getFullYear()} Coworking App.
            All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">

            <Link
              href="/privacy"
              className="hover:text-white transition"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="hover:text-white transition"
            >
              Terms
            </Link>

            <Link
              href="/contact"
              className="hover:text-white transition"
            >
              Contact
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}