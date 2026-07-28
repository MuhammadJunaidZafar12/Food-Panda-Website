import {
  getAllRestaurants,
  getRestaurant,
  createRestaurantService,
  updateRestaurantService,
  deleteRestaurantService,
  getOwnerRestaurants,
  getRestaurantByIdService,
} from "../services/restaurant.service.js";

export const getRestaurants = async (
  req,
  res,
  next
) => {
  try {
    const { search = "" } = req.query;

    const restaurants =
      await getAllRestaurants(search);

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRestaurants = async (
  req,
  res,
  next
) => {
  try {
    const restaurants =
      await getOwnerRestaurants(req.user._id);
    return res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    next(error);
  }
};

// export const getRestaurantById = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const restaurant =
//       await getRestaurant(req.params.id);

//     res.status(200).json({
//       success: true,
//       restaurant,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getRestaurantById = async (
  req,
  res,
  next
) => {
  try {
    const restaurant =
      await getRestaurantByIdService(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (
  req,
  res,
  next
) => {
  try {
    const logo =
      req.files?.logo?.[0]?.path || "";

    const banner =
      req.files?.banner?.[0]?.path || "";

    const restaurantData = {
      ...req.body,
      logo,
      banner,
    };

    if (req.body.location) {
      restaurantData.location =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    }

    const restaurant =
      await createRestaurantService(
        restaurantData,
        req.user._id
      );

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (
  req,
  res,
  next
) => {
  try {
    const logo =
      req.files?.logo?.[0]?.path;

    const banner =
      req.files?.banner?.[0]?.path;

    const restaurantData = {
      ...req.body,
    };

    if (req.body.location) {
      restaurantData.location =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;
    }

    if (logo) {
      restaurantData.logo = logo;
    }

    if (banner) {
      restaurantData.banner = banner;
    }

    const restaurant =
      await updateRestaurantService(
        req.params.id,
        req.user._id,
        restaurantData
      );

    res.status(200).json({
      success: true,
      message:
        "Restaurant updated successfully.",
      restaurant,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (
  req,
  res,
  next
) => {
  try {
    await deleteRestaurantService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};