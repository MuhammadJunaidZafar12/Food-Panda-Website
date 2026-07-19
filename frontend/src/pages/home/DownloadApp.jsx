import { Smartphone, Download } from "lucide-react";

const DownloadApp = () => {
  return (
    <section className="bg-pink-600 py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-6 lg:flex-row">

        {/* Left Content */}
        <div className="max-w-xl text-white">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm">
            📱 Mobile App
          </span>

          <h2 className="mt-6 text-4xl font-bold leading-tight">
            Order Faster with the
            <br />
            foodpanda App
          </h2>

          <p className="mt-6 text-lg leading-8 text-pink-100">
            Download our mobile application and enjoy
            faster ordering, exclusive discounts,
            live order tracking, and a better experience.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <button className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-pink-600 transition hover:scale-105">
              <Download size={20} />
              Google Play
            </button>

            <button className="flex items-center gap-3 rounded-xl border border-white px-6 py-4 font-semibold text-white transition hover:bg-white hover:text-pink-600">
              <Smartphone size={20} />
              App Store
            </button>

          </div>
        </div>

        {/* Right Content */}

        <div className="flex h-80 w-72 items-center justify-center rounded-[40px] border-8 border-white bg-white shadow-2xl">

          <div className="text-center">
            <Smartphone
              size={80}
              className="mx-auto text-pink-600"
            />

            <p className="mt-4 text-lg font-semibold text-gray-700">
              App Preview
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Screenshot will be added later
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DownloadApp;