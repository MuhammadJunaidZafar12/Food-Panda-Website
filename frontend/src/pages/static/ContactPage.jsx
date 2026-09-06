import { Mail, MapPin, Phone } from "lucide-react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";

const ContactPage = () => {
  return (
    <StaticPageLayout
      title="Contact Us"
      subtitle="Have a question, feedback, or partnership request? We would love to hear from you."
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Mail className="text-pink-600" size={22} />
          <h2 className="mt-3 font-bold text-gray-900">Email</h2>
          <a
            href="mailto:junaidzafar434@gmail.com"
            className="mt-2 block text-sm text-gray-600 hover:text-pink-600"
          >
            junaidzafar434@gmail.com
          </a>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Phone className="text-pink-600" size={22} />
          <h2 className="mt-3 font-bold text-gray-900">Phone</h2>
          <a
            href="tel:+923461255799"
            className="mt-2 block text-sm text-gray-600 hover:text-pink-600"
          >
            +92 346 1255799
          </a>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <MapPin className="text-pink-600" size={22} />
          <h2 className="mt-3 font-bold text-gray-900">Location</h2>
          <p className="mt-2 text-sm text-gray-600">Pakistan</p>
        </div>
      </section>

      <section className="space-y-3 text-gray-600">
        <h2 className="text-lg font-bold text-gray-900">Support hours</h2>
        <p className="leading-7">
          Our support team is available Monday to Saturday, 9:00 AM to 9:00 PM
          (PKT). For urgent delivery issues, please include your order ID in
          your message so we can help faster.
        </p>
      </section>
    </StaticPageLayout>
  );
};

export default ContactPage;
