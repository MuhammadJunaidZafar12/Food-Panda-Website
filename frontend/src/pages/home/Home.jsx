import { useEffect } from "react";
import { getCurrentUser } from "../../services/auth.service";
import { getToken } from "../../utils/storage";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";
import Categories from "./Categories";
import FeaturedRestaurants from "./FeaturedRestaurants";
import Offers from "./Offers";
import DownloadApp from "./DownloadApp";
const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {

    const fetchUser = async () => {
      try {

        if (!getToken()) {
          console.log("No token found. User is not authenticated.");
          navigate("/login");
        }
        const response = await getCurrentUser();

        console.log(response);

      } catch (error) {

        console.log(error.response?.data);

      }
    };

    fetchUser();

  }, []);

  return (
    <div>
      <Hero />
      <Categories />
      <FeaturedRestaurants />
      <Offers />
      <DownloadApp  />
    </div>
  );
};

export default Home;