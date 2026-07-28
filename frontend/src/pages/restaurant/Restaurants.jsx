import { useSearchParams } from "react-router-dom";
import RestaurantGrid from "../../components/restaurant/RestaurantGrid";
import EmptyRestaurants from "../../components/restaurant/EmptyRestaurants";
import RestaurantSkeleton from "../../components/restaurant/RestaurantSkeleton";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
let dummyRestaurants = [
  {
    _id: "1",
    name: "KFC Johar Town",
    image: "https://picsum.photos/400/250",
    rating: 4.7,
    deliveryTime: "25-35 min",
    deliveryFee: 120,
    category: "Fast Food",
  },
  {
    _id: "2",
    name: "Pizza Hut DHA",
    image: "https://picsum.photos/401/250",
    rating: 4.5,
    deliveryTime: "30-40 min",
    deliveryFee: 150,
    category: "Pizza",
  },
];

const Restaurants = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("search") || "";
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.restaurant);

  useEffect(() => {
    dispatch(getRestaurantsThunk({
      search: keyword,
    }));
  }, [dispatch, keyword]);

  //const loading = true;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <RestaurantSkeleton />
      </div>
    );
  } 
  if (!restaurants.length) {
    return <EmptyRestaurants />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Restaurants</h1>

        {
          <p className="mt-2 text-gray-600">
            Search Results for:
            <span className="font-semibold"> {keyword || "Restaurents"}</span>
            {restaurants.length > 0 ? (
              <RestaurantGrid restaurants={restaurants} />
            ) : (
              <EmptyRestaurants />
            )}
          </p>
        }
      </div>
    </div>
  );
};

export default Restaurants;
