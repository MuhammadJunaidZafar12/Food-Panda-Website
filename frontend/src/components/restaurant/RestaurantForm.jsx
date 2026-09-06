import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import LocationPicker from "../map/LocationPicker";
import { isValidCoordinate } from "../../services/location.service";

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

const getFormData = (initialValues) => ({
  ...getInitialState(),
  ...(initialValues || {}),
  latitude: initialValues?.location?.coordinates?.[1] ?? "",
  longitude: initialValues?.location?.coordinates?.[0] ?? "",
});

const RestaurantForm = ({
  initialValues,
  onSubmit,
  loading = false,
  mode = "create",
  submitLabel,
}) => {
  const [formData, setFormData] = useState(() => getFormData(initialValues));
  const [locationError, setLocationError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed for logo/banner.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // The map is the source of truth for the coordinates and address.
  const handleLocationChange = useCallback((picked) => {
    setLocationError("");

    setFormData((prev) => ({
      ...prev,
      latitude: picked.latitude,
      longitude: picked.longitude,
      // While the lookup is still running the picker sends blanks — hold on to
      // what is on screen instead of emptying the two fields and refilling them.
      address: picked.resolving ? prev.address : picked.address || "",
      city: picked.resolving ? prev.city : picked.city || "",
    }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Detailed field validation with informative toast notifications
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter the restaurant name.");
      return;
    }

    if (!formData.category || !formData.category.trim()) {
      toast.error("Please select a restaurant category.");
      return;
    }

    if (!formData.phone || !formData.phone.trim()) {
      toast.error("Please enter a contact phone number.");
      return;
    }

    if (
      formData.email &&
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!formData.address || !formData.address.trim()) {
      toast.error("Please enter the complete restaurant address.");
      return;
    }

    if (!formData.city || !formData.city.trim()) {
      toast.error("Please enter the city.");
      return;
    }

    if (Number(formData.deliveryFee) < 0) {
      toast.error("Delivery fee cannot be negative.");
      return;
    }

    if (Number(formData.minimumOrder) < 0) {
      toast.error("Minimum order cannot be negative.");
      return;
    }

    if (Number(formData.deliveryRadius) <= 0) {
      toast.error("Delivery radius must be greater than 0 km.");
      return;
    }

    // Latitude/longitude validation
    if (!isValidCoordinate({ latitude: formData.latitude, longitude: formData.longitude })) {
      setLocationError("Please pick the restaurant location on the map.");
      toast.error("Please mark your restaurant location on the map.");
      return;
    }

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

  const formKey = initialValues?._id || initialValues?.name || mode;

  return (
    <form
      key={formKey}
      onSubmit={handleSubmit}
      noValidate
    >
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight={700}>Restaurant Information</Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
            <TextField label="Restaurant Name" name="name" value={formData.name} onChange={handleChange} required fullWidth />
            <FormControl fullWidth required>
              <InputLabel id="restaurant-category-label">Category</InputLabel>
              <Select labelId="restaurant-category-label" label="Category" name="category" value={formData.category} onChange={handleChange}>
                <MenuItem value="">Select Category</MenuItem>
                {["Fast Food", "Pizza", "Burger", "BBQ", "Chinese", "Desi", "Cafe", "Bakery"].map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} required fullWidth />
            <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth />
            <TextField label="Address" name="address" value={formData.address} onChange={handleChange} required fullWidth />
            <TextField label="City" name="city" value={formData.city} onChange={handleChange} required fullWidth />
            <TextField label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={4} fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
            <TextField label="Opening Hours" name="openingHours" placeholder="09:00 AM - 11:00 PM" value={formData.openingHours} onChange={handleChange} fullWidth sx={{ gridColumn: { md: "1 / -1" } }} />
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
            <TextField label="Delivery Fee" name="deliveryFee" type="number" value={formData.deliveryFee} onChange={handleChange} fullWidth inputProps={{ min: 0 }} />
            <TextField label="Minimum Order" name="minimumOrder" type="number" value={formData.minimumOrder} onChange={handleChange} fullWidth inputProps={{ min: 0 }} />
            <TextField label="Delivery Radius" name="deliveryRadius" type="number" value={formData.deliveryRadius} onChange={handleChange} fullWidth inputProps={{ min: 1 }} />
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <LocationPicker
          value={{
            latitude: formData.latitude,
            longitude: formData.longitude,
            address: formData.address,
            city: formData.city,
          }}
          onChange={handleLocationChange}
          height={320}
          label="Restaurant location"
          helperText="Search, drop a pin or use your current location. Riders and delivery distances are calculated from this exact point."
        />

        {locationError && (
          <Alert severity="error" sx={{ mt: 2 }}>{locationError}</Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2, mt: 2 }}>
          <TextField label="Latitude" type="number" name="latitude" value={formData.latitude} onChange={handleChange} inputProps={{ step: "any" }} InputProps={{ readOnly: true }} required fullWidth />
          <TextField label="Longitude" type="number" name="longitude" value={formData.longitude} onChange={handleChange} inputProps={{ step: "any" }} InputProps={{ readOnly: true }} required fullWidth />
        </Box>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button component="label" variant="outlined" fullWidth>
              {formData.logo instanceof File ? formData.logo.name : "Choose Logo"}
              <input hidden type="file" accept="image/*" name="logo" onChange={handleChange} />
            </Button>
            <Button component="label" variant="outlined" fullWidth>
              {formData.banner instanceof File ? formData.banner.name : "Choose Banner"}
              <input hidden type="file" accept="image/*" name="banner" onChange={handleChange} />
            </Button>
          </Stack>

          <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ bgcolor: "#E21B70", "&:hover": { bgcolor: "#C2185B" } }}>
            {loading ? "Saving..." : submitLabel || (mode === "edit" ? "Save Changes" : "Create Restaurant")}
          </Button>
        </Stack>
      </Paper>
    </form>
  );
};

export default RestaurantForm;
