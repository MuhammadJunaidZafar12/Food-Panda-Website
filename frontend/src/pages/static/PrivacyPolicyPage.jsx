import StaticPageLayout from "../../components/layout/StaticPageLayout";

const PrivacyPolicyPage = () => {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="We respect your privacy and are committed to protecting your personal information."
    >
      <section className="space-y-4 text-sm leading-7 text-gray-600">
        <p>
          FoodPanda collects basic account information such as your name, email,
          phone number, and delivery address to provide ordering and delivery
          services.
        </p>
        <p>
          Location data may be used to show nearby restaurants, calculate
          delivery distance, and support live order tracking when you choose to
          share it.
        </p>
        <p>
          We do not sell your personal data. Information is used only to operate
          the platform, improve service quality, and support customer, owner,
          and rider workflows.
        </p>
        <p>
          You can update profile details from your account settings. For privacy
          requests, contact us through the Contact page.
        </p>
      </section>
    </StaticPageLayout>
  );
};

export default PrivacyPolicyPage;
