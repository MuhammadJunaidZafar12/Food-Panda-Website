import StaticPageLayout from "../../components/layout/StaticPageLayout";

const CareersPage = () => {
  return (
    <StaticPageLayout
      title="Careers"
      subtitle="Join our growing food delivery platform and help us bring great meals to more people."
    >
      <section className="space-y-4 text-gray-600">
        <p className="leading-7">
          FoodPanda is always looking for passionate people who care about
          customer experience, technology, and local restaurant communities.
        </p>
        <p className="leading-7">
          We are building a platform that supports customers, restaurant owners,
          delivery riders, and operations teams — and we grow best when every
          role works together.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Open opportunities</h2>
        <div className="space-y-3">
          {[
            "Customer Support Specialist",
            "Restaurant Partnership Manager",
            "Frontend Developer",
            "Delivery Operations Coordinator",
          ].map((role) => (
            <div
              key={role}
              className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800"
            >
              {role}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Send your CV to{" "}
          <a
            href="mailto:junaidzafar434@gmail.com"
            className="font-semibold text-pink-600 hover:underline"
          >
            junaidzafar434@gmail.com
          </a>
        </p>
      </section>
    </StaticPageLayout>
  );
};

export default CareersPage;
