import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "foodpanda_user_destination";

const loadStoredLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        latitude: parsed.latitude ?? null,
        longitude: parsed.longitude ?? null,
        address: parsed.address || "",
        city: parsed.city || "",
        label: parsed.label || parsed.address || "",
        radius: Number(parsed.radius) || 5, // default 5 km
        isCustom: Boolean(parsed.isCustom),
      };
    }
  } catch (e) {
    console.error("Failed to load destination from storage", e);
  }
  return {
    latitude: null,
    longitude: null,
    address: "",
    city: "",
    label: "",
    radius: 5, // default 5 km
    isCustom: false,
  };
};

const initialData = loadStoredLocation();

const initialState = {
  ...initialData,
  isLocating: false,
  locationError: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setDestination: (state, action) => {
      const {
        latitude,
        longitude,
        address,
        city,
        label,
        radius,
        isCustom,
      } = action.payload || {};

      state.latitude =
        latitude !== undefined && latitude !== null
          ? Number(latitude)
          : state.latitude;
      state.longitude =
        longitude !== undefined && longitude !== null
          ? Number(longitude)
          : state.longitude;
      state.address = address !== undefined ? address : state.address;
      state.city = city !== undefined ? city : state.city;
      state.label =
        label !== undefined
          ? label
          : address !== undefined
          ? address
          : state.label;
      if (radius !== undefined && radius !== null) {
        state.radius = Number(radius);
      }
      state.isCustom = isCustom !== undefined ? isCustom : true;
      state.locationError = null;

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            latitude: state.latitude,
            longitude: state.longitude,
            address: state.address,
            city: state.city,
            label: state.label,
            radius: state.radius,
            isCustom: state.isCustom,
          })
        );
      } catch (e) {
        console.error("Failed to save destination to storage", e);
      }
    },

    setRadius: (state, action) => {
      state.radius = Number(action.payload) || 5;
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...stored, radius: state.radius })
        );
      } catch (e) {}
    },

    clearDestination: (state) => {
      state.latitude = null;
      state.longitude = null;
      state.address = "";
      state.city = "";
      state.label = "";
      state.radius = 5;
      state.isCustom = false;
      state.locationError = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },

    setLocating: (state, action) => {
      state.isLocating = Boolean(action.payload);
    },

    setLocationError: (state, action) => {
      state.locationError = action.payload;
      state.isLocating = false;
    },
  },
});

export const {
  setDestination,
  setRadius,
  clearDestination,
  setLocating,
  setLocationError,
} = locationSlice.actions;

export default locationSlice.reducer;
