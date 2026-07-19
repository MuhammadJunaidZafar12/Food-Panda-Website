import { Search } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-pink-50 to-white">
      <div className="mx-auto flex min-h-[500px] max-w-7xl flex-col items-center justify-between gap-12 px-6 py-16 lg:flex-row">

        {/* Left */}
        <div className="max-w-xl">

          <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-600">
            🍔 Pakistan's Favourite Food Delivery
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-gray-900">
            Enjoy your favourite food,
            <span className="text-pink-600"> anytime.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover restaurants near you, order delicious meals,
            and get them delivered to your doorstep in minutes.
          </p>

          {/* Search */}
          <div className="mt-8 flex overflow-hidden rounded-xl border bg-white shadow-lg">

            <input
              type="text"
              placeholder="Search restaurants or food..."
              className="flex-1 px-5 py-4 outline-none"
            />

            <button className="bg-pink-600 px-6 text-white transition hover:bg-pink-700">
              <Search />
            </button>

          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-10">

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                500+
              </h2>

              <p className="text-gray-500">
                Restaurants
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                50K+
              </h2>

              <p className="text-gray-500">
                Happy Customers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-pink-600">
                30 min
              </h2>

              <p className="text-gray-500">
                Delivery
              </p>
            </div>

          </div>

        </div>

        {/* Right */}
        <div className="flex justify-center">

          <img
            src="/hero-food.png"
            alt="Food"
            className="max-w-md drop-shadow-2xl"
          />

        </div>

      </div>
    </section>
  );
};

export default Hero;