import StaticPageLayout from "../../components/layout/StaticPageLayout";

const HelpCenterPage = () => {
  const faqs = [
    {
      q: "How do I place an order?",
      a: "Browse restaurants, add items to your cart, set your delivery location, and complete checkout.",
    },
    {
      q: "Can I track my delivery?",
      a: "Yes. After placing an order, open your order details page to follow live status updates.",
    },
    {
      q: "How do I become a restaurant partner?",
      a: "Register on FoodPanda, switch to an owner account, and submit your restaurant for admin approval.",
    },
    {
      q: "What payment methods are supported?",
      a: "Cash on delivery is available now. Card and wallet options can be enabled in future updates.",
    },
  ];

  return (
    <StaticPageLayout
      title="Help Center"
      subtitle="Quick answers to common questions about ordering, delivery, and restaurant partnerships."
    >
      <section className="space-y-4">
        {faqs.map(({ q, a }) => (
          <article
            key={q}
            className="rounded-xl border border-gray-100 bg-gray-50 p-5"
          >
            <h2 className="font-bold text-gray-900">{q}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{a}</p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-pink-100 bg-pink-50 p-5 text-sm text-gray-700">
        Still need help? Visit our{" "}
        <a href="/contact" className="font-semibold text-pink-600 hover:underline">
          Contact page
        </a>{" "}
        and our team will get back to you.
      </section>
    </StaticPageLayout>
  );
};

export default HelpCenterPage;
