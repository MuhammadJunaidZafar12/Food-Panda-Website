import { useEffect, useState } from "react";

const getInitialState = () => ({
  name: "",
  category: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  description: "",
  openingHours: "",
  deliveryFee: 0,
  minimumOrder: 0,
  deliveryRadius: 5,
  latitude: "",
  longitude: "",
  logo: null,
  banner: null,
});

const RestaurantForm = ({
  initialValues,
  onSubmit,
  loading = false,
  mode = "create",
  submitLabel,
}) => {
  const [formData, setFormData] = useState(() => ({
    ...getInitialState(),
    ...(initialValues || {}),
    latitude: initialValues?.location?.coordinates?.[1] ?? "",
    longitude: initialValues?.location?.coordinates?.[0] ?? "",
  }));

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();

    payload.append("name", formData.name || "");
    payload.append("category", formData.category || "");
    payload.append("phone", formData.phone || "");
    payload.append("email", formData.email || "");
    payload.append("address", formData.address || "");
    payload.append("city", formData.city || "");
    payload.append("description", formData.description || "");
    payload.append("openingHours", formData.openingHours || "");

    payload.append("deliveryFee", Number(formData.deliveryFee || 0));
    payload.append("minimumOrder", Number(formData.minimumOrder || 0));
    payload.append("deliveryRadius", Number(formData.deliveryRadius || 5));

    payload.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [Number(formData.longitude || 0), Number(formData.latitude || 0)],
      })
    );

    if (formData.logo instanceof File) {
      payload.append("logo", formData.logo);
    }

    if (formData.banner instanceof File) {
      payload.append("banner", formData.banner);
    }

    onSubmit(payload);
  };

  useEffect(() => {
    if (!initialValues) return;

    setFormData({
      ...getInitialState(),
      ...initialValues,
      latitude: initialValues.location?.coordinates?.[1] ?? "",
      longitude: initialValues.location?.coordinates?.[0] ?? "",
    });
  }, [initialValues]);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl bg-white p-8 shadow"
    >
      <h2 className="text-3xl font-bold">Restaurant Information</h2>

      {/* Restaurant Name */}

      <div>
        <label className="mb-2 block font-medium">Restaurant Name</label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3 outline-none focus:border-pink-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-2 block font-medium">Category</label>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3 outline-none focus:border-pink-500"
        >
          <option value="">Select Category</option>

          <option>Fast Food</option>
          <option>Pizza</option>
          <option>Burger</option>
          <option>BBQ</option>
          <option>Chinese</option>
          <option>Desi</option>
          <option>Cafe</option>
          <option>Bakery</option>
        </select>
      </div>

      {/* Phone */}

      <div>
        <label className="mb-2 block font-medium">Phone</label>

        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Email */}

      <div>
        <label className="mb-2 block font-medium">Email</label>

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Address */}

      <div>
        <label className="mb-2 block font-medium">Address</label>

        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* City */}
      <div>
        <label className="mb-2 block font-medium">City</label>

        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block font-medium">Description</label>

        <textarea
          rows="4"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Opening Hours */}

      <div>
        <label className="mb-2 block font-medium">Opening Hours</label>

        <input
          type="text"
          name="openingHours"
          placeholder="09:00 AM - 11:00 PM"
          value={formData.openingHours}
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Numbers */}

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block font-medium">Delivery Fee</label>

          <input
            type="number"
            name="deliveryFee"
            value={formData.deliveryFee}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Minimum Order</label>

          <input
            type="number"
            name="minimumOrder"
            value={formData.minimumOrder}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Delivery Radius</label>

          <input
            type="number"
            name="deliveryRadius"
            value={formData.deliveryRadius}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      {/* Coordinates */}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-medium">Latitude</label>

          <input
            type="number"
            step="any"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">Longitude</label>

          <input
            type="number"
            step="any"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      {/* Logo */}

      <div>
        <label className="mb-2 block font-medium">Logo URL</label>

        <input
          type="file"
          accept="image/*"
          name="logo"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />
      </div>

      {/* Banner */}

      <div>
        <label className="mb-2 block font-medium">Banner URL</label>

        <input
          type="file"
          accept="image/*"
          name="banner"
          onChange={handleChange}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        disabled={loading}
        className="w-full rounded-xl bg-pink-600 py-4 font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel || (mode === "edit" ? "Save Changes" : "Create Restaurant")}
      </button>
    </form>
  );
};

export default RestaurantForm;
