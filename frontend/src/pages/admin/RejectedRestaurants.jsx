import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRejectedRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import AdminRestaurantList from "../../components/admin/AdminRestaurantList";

const RejectedRestaurants = () => {
  const dispatch = useDispatch();
  const { allRejectedRestaurants, loading } = useSelector(
    (state) => state.restaurant
  );

  const rejectedRestaurants = (allRejectedRestaurants || []).filter(
    (restaurant) => restaurant.status === "rejected"
  );

  useEffect(() => {
    dispatch(getAllRejectedRestaurantsThunk());
  }, [dispatch]);

  return (
    <AdminRestaurantList
      title="Rejected Restaurants"
      description="Review restaurants that were rejected and track follow-up actions."
      restaurants={rejectedRestaurants}
      variant="rejected"
      loading={loading}
      emptyTitle="No rejected restaurants found."
      emptyDescription="Rejected restaurants will appear here when a submission is declined."
    />
  );
};

export default RejectedRestaurants;
