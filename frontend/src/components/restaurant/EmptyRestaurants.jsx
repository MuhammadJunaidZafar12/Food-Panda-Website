import { SearchX } from "lucide-react";

const EmptyRestaurants = ({
  title = "No restaurants found",
  description = "Try searching with a different keyword or browse all restaurants.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
        <SearchX className="h-10 w-10 text-pink-600" />
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-gray-800">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default EmptyRestaurants;