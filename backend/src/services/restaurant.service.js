import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
import slugify from "slugify";
export const getAllRestaurants = async (options = {}) => {
  const params = typeof options === "string" ? { search: options } : options;
  const {
    search = "",
    latitude,
    longitude,
    lat,
    lng,
    radius,
    category,
    sortBy = "nearest",
    onlyDeliverable,
  } = params;

  const userLat = Number(latitude ?? lat);
  const userLng = Number(longitude ?? lng);
  const hasCoordinates =
    Number.isFinite(userLat) &&
    Number.isFinite(userLng) &&
    userLat >= -90 &&
    userLat <= 90 &&
    userLng >= -180 &&
    userLng <= 180;

  const matchQuery = {
    status: "approved",
    isActive: true,
  };

  if (category && category !== "all") {
    matchQuery.category = { $regex: category, $options: "i" };
  }

  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: "i" };
    matchQuery.$or = [
      { name: searchRegex },
      { category: searchRegex },
      { city: searchRegex },
      { address: searchRegex },
    ];
  }

  if (hasCoordinates) {
    const radiusNum = Number(radius);
    const radiusInMeters =
      Number.isFinite(radiusNum) && radiusNum > 0
        ? radiusNum * 1000
        : undefined;

    const geoNearStage = {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [userLng, userLat],
        },
        distanceField: "distance", // distance in meters
        spherical: true,
        query: matchQuery,
      },
    };

    if (radiusInMeters) {
      geoNearStage.$geoNear.maxDistance = radiusInMeters;
    }

    const pipeline = [geoNearStage];

    // If onlyDeliverable is true, match where distance <= deliveryRadius * 1000
    if (onlyDeliverable === true || onlyDeliverable === "true") {
      pipeline.push({
        $match: {
          $expr: {
            $lte: ["$distance", { $multiply: ["$deliveryRadius", 1000] }],
          },
        },
      });
    }

    // Sorting
    if (sortBy === "rating") {
      pipeline.push({ $sort: { rating: -1, distance: 1 } });
    } else if (sortBy === "deliveryFee") {
      pipeline.push({ $sort: { deliveryFee: 1, distance: 1 } });
    } else {
      // Default: nearest first
      pipeline.push({ $sort: { distance: 1 } });
    }

    const restaurants = await Restaurant.aggregate(pipeline);
    return restaurants;
  }

  // Fallback when no coordinates provided
  let query = Restaurant.find(matchQuery);

  if (sortBy === "rating") {
    query = query.sort({ rating: -1, createdAt: -1 });
  } else if (sortBy === "deliveryFee") {
    query = query.sort({ deliveryFee: 1, createdAt: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const restaurants = await query.exec();
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

export const getPublicRestaurantByIdService = async (id, user = null) => {
  const restaurant = await Restaurant.findById(id).populate(
    "owner",
    "name email phone"
  );

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  const isOwner =
    user &&
    restaurant.owner &&
    (restaurant.owner._id?.toString() === user._id?.toString() ||
      restaurant.owner.toString() === user._id?.toString());
  const isAdmin = user && user.role === "admin";

  if (restaurant.status !== "approved" || !restaurant.isActive) {
    if (!isAdmin && !isOwner) {
      throw new Error("Restaurant not found or not approved.");
    }
  }

  // Find this user's existing rating (if logged in)
  let userRating = null;
  if (user) {
    const existing = restaurant.ratings.find(
      (r) => r.user.toString() === user._id.toString()
    );
    if (existing) userRating = existing.rating;
  }

  return { restaurant, userRating };
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

// Admin Service to get pending restaurants
export const getPendingRestaurantsService =
  async () => {
    const restaurants =
      await Restaurant.find({
        status: "pending",
      })
        .populate(
          "owner",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    return restaurants;
  };

// Admin Service to approve a restaurant
export const approveRestaurantService = async (id) => {
  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  restaurant.status = "approved";
  await restaurant.save();

  return restaurant;
};
//Admin Service to reject a restaurant
export const rejectRestaurantService = async (id) => {
  const restaurant = await Restaurant.findById(id);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }
  restaurant.status = "rejected";
  await restaurant.save();

  return restaurant;
};

//Admin Sercices to get all approved restaurants
export const getAllApprovedRestaurantsService = async () => {
  const restaurants = await Restaurant.find({
    status: "approved",
  })
    .populate(
      "owner",
      "name email phone"
    )
    .sort({
      createdAt: -1,
    });

  return restaurants;
};

//Admin Sercice to get all rejected restaurants
export const getAllRejectedRestaurantsService = async () => {
  const restaurants = await Restaurant.find({
    status: "rejected",
  })
    .populate(
      "owner",
      "name email phone"
    )
    .sort({
      createdAt: -1,
    });

  return restaurants;
};

// Admin Service to get dashboard stats and analytics
// export const getAdminStatsService = async () => {
//   // 1. General counts
//   const pendingCount = await Restaurant.countDocuments({ status: "pending" });
//   const approvedCount = await Restaurant.countDocuments({ status: "approved" });
//   const rejectedCount = await Restaurant.countDocuments({ status: "rejected" });
//   const totalOwners = await User.countDocuments({ role: "owner" });

//   // 2. User distribution by role
//   const customerCount = await User.countDocuments({ role: "customer" });
//   const adminCount = await User.countDocuments({ role: "admin" });

//   const userDistribution = [
//     { name: "Customers", value: customerCount },
//     { name: "Owners", value: totalOwners },
//     { name: "Admins", value: adminCount },
//   ];

//   // 3. Restaurants created in this week (last 7 days)
//   const weeklyCreation = [];
//   const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   for (let i = 6; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(d.getDate() - i);
//     d.setHours(0, 0, 0, 0);

//     const start = d;
//     const end = new Date(d);
//     end.setHours(23, 59, 59, 999);

//     const count = await Restaurant.countDocuments({
//       createdAt: { $gte: start, $lte: end },
//     });

//     weeklyCreation.push({
//       day: daysOfWeek[d.getDay()],
//       count,
//     });
//   }

//   return {
//     pendingCount,
//     approvedCount,
//     rejectedCount,
//     totalOwners,
//     userDistribution,
//     weeklyCreation,
//   };
// };

// Rate or update a restaurant rating (upsert per user)
export const rateRestaurantService = async (restaurantId, userId, rating) => {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new Error("Restaurant not found.");
  }

  if (restaurant.status !== "approved" || !restaurant.isActive) {
    throw new Error("Restaurant not found or not approved.");
  }

  // Upsert: find existing vote by this user
  const existingIndex = restaurant.ratings.findIndex(
    (r) => r.user.toString() === userId.toString()
  );

  const isUpdate = existingIndex !== -1;

  if (isUpdate) {
    // Replace the user's old rating
    restaurant.ratings[existingIndex].rating = rating;
  } else {
    // Add a new rating entry
    restaurant.ratings.push({ user: userId, rating });
  }

  // Recalculate average from the full ratings array
  const total = restaurant.ratings.length;
  const sum = restaurant.ratings.reduce((acc, r) => acc + r.rating, 0);
  restaurant.rating = Math.round((sum / total) * 10) / 10;
  restaurant.totalReviews = total;

  await restaurant.save();

  return { restaurant, isUpdate };
};

export const getAdminDashboardStatsService = async () => {
  const now = new Date();

  // Last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    pendingRestaurants,
    approvedRestaurants,
    rejectedRestaurants,
    totalOwners,
    restaurantGraph,
    userGraph,
  ] = await Promise.all([
    // Stats
    Restaurant.countDocuments({
      status: "pending",
    }),

    Restaurant.countDocuments({
      status: "approved",
    }),

    Restaurant.countDocuments({
      status: "rejected",
    }),

    User.countDocuments({
      role: "owner",
    }),

    // Restaurant graph
    Restaurant.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lte: now,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]),

    // User graph
    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
            $lte: now,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  return {
    stats: {
      pendingRestaurants,
      approvedRestaurants,
      rejectedRestaurants,
      totalOwners,
    },

    restaurantGraph,

    userGraph,
  };
};
