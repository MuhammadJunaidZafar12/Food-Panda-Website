import { Link } from "react-router-dom";
import FoodPanda from "../../assets/foodpanda.svg";

const Logo = ({
  variant = "auth", // auth | navbar | footer
  size = "md", // sm | md | lg
  showTagline = true,
  className = "",
}) => {
  const imageSize = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  // Navbar & Footer Layout
  if (variant === "navbar" || variant === "footer") {
    return (
      <Link
        to="/"
        className={`flex items-center gap-2 ${className}`}
      >
        <img
          src={FoodPanda}
          alt="foodpanda"
          className={imageSize[size]}
        />

        <span
          className={`${textSize[size]} font-bold text-pink-600`}
        >
          foodpanda
        </span>
      </Link>
    );
  }

  // Login / Register Layout
  return (
    <Link
      to="/"
      className={`flex flex-col items-center ${className}`}
    >
      <img
        src={FoodPanda}
        alt="foodpanda"
        className={imageSize[size]}
      />

      <h1
        className={`${textSize[size]} mt-2 font-bold text-pink-600`}
      >
        foodpanda
      </h1>

      {showTagline && (
        <p className="mt-2 text-center text-gray-500">
          Order food from your favourite restaurants
        </p>
      )}
    </Link>
  );
};

export default Logo;