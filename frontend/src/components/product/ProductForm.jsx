import { useState } from "react";

const ProductForm = ({
  onSubmit,
  loading = false,
  restaurants = [],
  initialData = {},
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    category: initialData.category || "",
    description: initialData.description || "",
    price: initialData.price || "",
    restaurant:
      initialData.restaurant?._id ||
      initialData.restaurant || "",
    isAvailable:
      initialData.isAvailable ?? true,
    image: null,
  });

  const handleChange = (e) => {
    const {
      name,
      value,
      files,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : files
            ? files[0]
            : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.restaurant) {
      return;
    }

    const payload = new FormData();

    payload.append("name", formData.name);

    payload.append(
      "category",
      formData.category
    );

    payload.append(
      "description",
      formData.description
    );

    payload.append(
      "price",
      Number(formData.price)
    );

    payload.append(
      "restaurant",
      formData.restaurant
    );

    payload.append(
      "isAvailable",
      formData.isAvailable
    );

    if (formData.image) {
      payload.append(
        "image",
        formData.image
      );
    }

    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Product Name */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Product Name
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Chicken Biryani"
          required
          className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        />
      </div>


      {/* Category */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Category
        </label>

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g. Biryani"
          required
          className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        />
      </div>


      {/* Restaurant */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Restaurant
        </label>

        <select
          name="restaurant"
          value={formData.restaurant}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        >
          <option value="">
            Select Restaurant
          </option>

          {restaurants.map((restaurant) => (
            <option
              key={restaurant._id}
              value={restaurant._id}
            >
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>


      {/* Price */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Price
        </label>

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="500"
          min="0"
          required
          className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        />
      </div>


      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Describe your product..."
          className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
        />
      </div>


      {/* Image */}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Product Image
        </label>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 p-3 text-sm"
        />
      </div>


      {/* Availability */}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isAvailable"
          checked={formData.isAvailable}
          onChange={handleChange}
          className="h-5 w-5 rounded border-gray-300 text-pink-600"
        />

        <label className="text-sm font-medium text-gray-700">
          Product is available
        </label>
      </div>


      {/* Buttons */}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            restaurants.length === 0
          }
          className="rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? initialData._id
              ? "Updating..."
              : "Creating..."
            : initialData._id
              ? "Update Product"
              : "Create Product"}
        </button>

      </div>

    </form>
  );
};

export default ProductForm;