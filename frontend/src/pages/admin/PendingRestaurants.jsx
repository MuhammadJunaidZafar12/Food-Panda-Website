import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import AdminRestaurantList from "../../components/admin/AdminRestaurantList";

const PendingRestaurants = () => {
  const dispatch = useDispatch();
  const { pendingRestaurants, loading } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(getPendingRestaurantsThunk());
  }, [dispatch]);

  return (
    <AdminRestaurantList
      title="Pending Restaurants"
      description="Review new restaurant submissions and approve or reject them before they go live."
      restaurants={pendingRestaurants}
      variant="pending"
      loading={loading}
      emptyTitle="No pending restaurants"
      emptyDescription="Pending restaurants will show here when owners submit new listings for review."
    />
  );
};

export default PendingRestaurants;
