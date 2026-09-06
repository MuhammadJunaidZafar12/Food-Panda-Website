import { categories } from "../../data/homeData";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Heading */}

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Browse by Category
          </h2>

          <p className="mt-2 text-gray-500">
            Discover delicious food from your favourite categories.
          </p>
        </div>

        {/* Categories */}

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/restaurants?category=${encodeURIComponent(category.name)}`)}
              className="
                group
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-pink-500
                hover:shadow-xl
              "
            >
              <div className="text-5xl">
                {category.icon}
              </div>

              <h3 className="mt-4 font-semibold text-gray-800 group-hover:text-pink-600">
                {category.name}
              </h3>
            </button>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Categories;