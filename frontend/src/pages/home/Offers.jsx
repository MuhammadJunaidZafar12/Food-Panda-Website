import { offers } from "../../data/homeData";

const Offers = () => {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900">
            Today's Offers
          </h2>

          <p className="mt-2 text-gray-500">
            Save more with our exclusive deals.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-3xl bg-gradient-to-r ${offer.color} p-8 text-white shadow-lg transition duration-300 hover:-translate-y-2`}
            >
              <h3 className="text-3xl font-bold">
                {offer.title}
              </h3>

              <p className="mt-3 text-lg">
                {offer.description}
              </p>

              <button className="mt-8 rounded-xl bg-white px-6 py-3 font-semibold text-pink-600 transition hover:scale-105">
                Order Now
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Offers;