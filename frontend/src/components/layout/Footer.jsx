import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import Logo from "../ui/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo variant="footer" size="sm" showTagline={false} />

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Order delicious food from your favourite restaurants with fast and
              reliable delivery.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Company</h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <a href="#" className="transition hover:text-pink-600">
                  About Us
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-pink-600">
                  Careers
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-pink-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>

            <ul className="space-y-3 text-gray-600">
              <li>
                <a href="#" className="transition hover:text-pink-600">
                  Help Center
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-pink-600">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="#" className="transition hover:text-pink-600">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>

            <div className="flex gap-4">
              <a
                href="#"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaFacebookF size={18} />
              </a>

              <a
                href="#"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaXTwitter size={18} />
              </a>

              <a
                href="#"
                className="rounded-full bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-600 hover:text-white"
              >
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          © {currentYear} foodpanda. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
