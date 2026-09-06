import StaticPageLayout from "../../components/layout/StaticPageLayout";

const TermsPage = () => {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using the FoodPanda platform."
    >
      <section className="space-y-4 text-sm leading-7 text-gray-600">
        <p>
          By using FoodPanda, you agree to use the platform responsibly and
          provide accurate account and delivery information.
        </p>
        <p>
          Restaurant menus, prices, and availability are managed by restaurant
          partners. FoodPanda facilitates ordering and communication but does
          not prepare food directly.
        </p>
        <p>
          Delivery times are estimates and may vary due to traffic, weather,
          restaurant preparation time, or rider availability.
        </p>
        <p>
          Users must not misuse the platform, attempt unauthorized access, or
          submit false restaurant or order information.
        </p>
        <p>
          FoodPanda may update these terms as the platform evolves. Continued use
          of the service means you accept the latest version.
        </p>
      </section>
    </StaticPageLayout>
  );
};

export default TermsPage;
