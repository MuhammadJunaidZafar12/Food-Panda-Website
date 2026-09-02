import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setDestination,
  setRadius,
  clearDestination,
  setLocating,
  setLocationError,
} from "../redux/location/locationSlice";
import {
  getCurrentPosition,
  reverseGeocode,
  isValidCoordinate,
} from "../services/location.service";

/**
 * Custom hook to interact with the user's destination & nearby search radius.
 */
export const useUserLocation = () => {
  const dispatch = useDispatch();
  const locationState = useSelector((state) => state.location);

  const locateUser = useCallback(async () => {
    dispatch(setLocating(true));
    try {
      const { latitude, longitude } = await getCurrentPosition();
      const geoInfo = await reverseGeocode(latitude, longitude);

      dispatch(
        setDestination({
          latitude,
          longitude,
          address: geoInfo.address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          city: geoInfo.city || "",
          label: geoInfo.city ? `${geoInfo.city} (Current Location)` : "Current Location",
          isCustom: false,
        })
      );
      dispatch(setLocating(false));
      return { latitude, longitude, ...geoInfo };
    } catch (err) {
      dispatch(setLocationError(err.message || "Could not retrieve location"));
      dispatch(setLocating(false));
      throw err;
    }
  }, [dispatch]);

  const updateDestination = useCallback(
    (point) => {
      dispatch(setDestination(point));
    },
    [dispatch]
  );

  const updateRadius = useCallback(
    (km) => {
      dispatch(setRadius(km));
    },
    [dispatch]
  );

  const resetDestination = useCallback(() => {
    dispatch(clearDestination());
  }, [dispatch]);

  const hasCoordinates = isValidCoordinate({
    latitude: locationState.latitude,
    longitude: locationState.longitude,
  });

  return {
    ...locationState,
    hasCoordinates,
    locateUser,
    updateDestination,
    updateRadius,
    resetDestination,
  };
};

export default useUserLocation;
