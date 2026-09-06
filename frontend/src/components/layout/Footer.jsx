import {
  FaGithub,
  FaLinkedinIn,
} from "react-icons/fa6";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

import Logo from "../ui/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" size="sm" showTagline={false} />

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Order delicious food from your favourite restaurants with fast and
              reliable delivery.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <Link to="/about" className="transition hover:text-pink-600">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/careers" className="transition hover:text-pink-600">
                  Careers
                </Link>
              </li>

              <li>
                <Link to="/contact" className="transition hover:text-pink-600">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <Link to="/help" className="transition hover:text-pink-600">
                  Help Center
                </Link>
              </li>

              <li>
                <Link to="/privacy" className="transition hover:text-pink-600">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/terms" className="transition hover:text-pink-600">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/MuhammadJunaidZafar12"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaGithub size={18} />
              </a>

              <a
                href="https://www.linkedin.com/in/junaid-zafar70"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaLinkedinIn size={18} />
              </a>

              <a
                href="mailto:junaidzafar434@gmail.com"
                aria-label="Email us"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <Mail size={18} />
              </a>

              <a
                href="tel:+923461255799"
                aria-label="Contact us"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          © {currentYear} foodpanda. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
