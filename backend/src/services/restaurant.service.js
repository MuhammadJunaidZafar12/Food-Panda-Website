import Restaurant from "../models/restaurant.model.js";
import User from "../models/user.model.js";
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
