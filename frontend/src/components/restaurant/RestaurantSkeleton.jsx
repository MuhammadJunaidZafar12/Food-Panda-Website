const RestaurantSkeleton = ({ count = 8 }) => {
  return (
    <div
      className="
        mt-8
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        >
          <div className="h-48 animate-pulse bg-gray-200" />

          <div className="space-y-3 p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantSkeleton;