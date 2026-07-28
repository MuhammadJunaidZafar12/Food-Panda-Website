import Restaurant from "../models/restaurant.model.js";
import slugify from "slugify";
export const getAllRestaurants = async (search = "") => {
  const filter = {
    status: "approved",
    isActive: true,
  };

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        category: {
          $regex: search,
          $options: "i",
        },
      },
      {
        city: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const restaurants = await Restaurant.find(filter).sort({
    createdAt: -1,
  });

  return restaurants;
};

export const getOwnerRestaurants = async (
  ownerId
) => {
  const restaurants = await Restaurant.find({
    owner: ownerId,
  }).sort({
    createdAt: -1,
  });

  return restaurants;
};

export const getRestaurant = async (id) => {
  const restaurant =
    await Restaurant.findById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  return restaurant;
};

// **************************************
export const createRestaurantService = async (
  restaurantData,
  ownerId
) => {
  const slug = slugify(
    restaurantData.name,
    {
      lower: true,
      strict: true,
    }
  );

  const existing =
    await Restaurant.findOne({ slug });

  if (existing) {
    throw new Error(
      "Restaurant already exists."
    );
  }

  const restaurant =
    await Restaurant.create({
      ...restaurantData,
      owner: ownerId,
      slug,
    });

  return restaurant;
};

/////////////////////////////
export const updateRestaurantService =
  async (
    id,
    ownerId,
    restaurantData
  ) => {
    const restaurant =
      await Restaurant.findOne({
        _id: id,
        owner: ownerId,
      });

    if (!restaurant) {
      throw new Error(
        "Restaurant not found."
      );
    }

    if (restaurantData.location) {
      if (
        typeof restaurantData.location === "string"
      ) {
        restaurantData.location = JSON.parse(
          restaurantData.location
        );
      }
    }

    // Name change hui?
    if (
      restaurantData.name &&
      restaurantData.name !== restaurant.name
    ) {
      const slug = slugify(restaurantData.name, {
        lower: true,
        strict: true,
      });

      const existingRestaurant = await Restaurant.findOne({
        slug,
        _id: { $ne: id }, // current restaurant ko ignore karo
      });

      if (existingRestaurant) {
        throw new Error("Restaurant name already exists.");
      }

      restaurantData.slug = slug;
    }

    restaurantData.status = "pending"


    Object.assign(
      restaurant,
      restaurantData
    );

    await restaurant.save();

    return restaurant;
  };

export const deleteRestaurantService =
  async (id) => {
    const restaurant =
      await Restaurant.findByIdAndDelete(
        id
      );

    if (!restaurant) {
      throw new Error(
        "Restaurant not found."
      );
    }

    return restaurant;
  };

export const getRestaurantByIdService =
  async (id, ownerId) => {
    const restaurant =
      await Restaurant.findOne({
        _id: id,
        owner: ownerId,
      });

    if (!restaurant) {
      throw new Error(
        "Restaurant not found."
      );
    }

    return restaurant;
  };