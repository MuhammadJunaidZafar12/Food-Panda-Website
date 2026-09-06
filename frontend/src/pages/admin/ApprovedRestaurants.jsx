import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllApprovedRestaurantsThunk } from "../../redux/restaurant/restaurantThunk";
import AdminRestaurantList from "../../components/admin/AdminRestaurantList";

const ApprovedRestaurants = () => {
  const dispatch = useDispatch();
  const { allApprovedRestaurants, loading } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(getAllApprovedRestaurantsThunk());
  }, [dispatch]);

  return (
    <AdminRestaurantList
      title="Approved Restaurants"
      description="View all restaurants currently approved and active on the platform."
      restaurants={allApprovedRestaurants}
      variant="approved"
      loading={loading}
      emptyTitle="No approved restaurants found."
      emptyDescription="Approved restaurants will appear here once listings are accepted."
    />
  );
};

export default ApprovedRestaurants;
