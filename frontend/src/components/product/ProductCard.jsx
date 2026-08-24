import {
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  role = "customer",
}) => {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Image */}

      <div className="relative h-52 overflow-hidden bg-gray-100 sm:h-56">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Availability */}

        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              product.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.isAvailable
              ? "Available"
              : "Unavailable"}
          </span>
        </div>
      </div>


      {/* Content */}

      <div className="p-4 sm:p-5">

        <div className="mb-3">
          <p className="text-sm font-medium text-pink-600">
            {product.category}
          </p>

          <h3 className="mt-1 line-clamp-1 text-lg font-bold text-gray-800 sm:text-xl">
            {product.name}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {product.description ||
              "No description available."}
          </p>
        </div>


        {/* Price */}

        <div className="mb-4">
          <span className="text-xl font-bold text-gray-800">
            Rs. {product.price}
          </span>
        </div>


        {/* Customer */}

        {role === "customer" && (
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 font-semibold text-white transition hover:bg-pink-700">
            <Eye size={18} />
            View Product
          </button>
        )}


        {/* Owner */}

        {role === "owner" && (
          <div className="flex flex-col gap-2 sm:flex-row">

            <button
              onClick={() => onEdit(product)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <Pencil size={17} />
              Edit
            </button>

            <button
              onClick={() => onDelete(product._id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <Trash2 size={17} />
              Delete
            </button>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;