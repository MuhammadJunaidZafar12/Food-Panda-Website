import { useState, useEffect } from "react";
import { Link, Router } from "react-router-dom";
import { Route } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import api from "../../api/axios";
import { loginUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { saveToken, saveUser } from "../../utils/storage";
import { useDispatch } from "react-redux";
import { loginThunk } from "../../redux/auth/authThunk";
import { useSelector } from "react-redux";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }
    if (!formData.password.trim()) {
      return toast.error("Password is required");
    }

    try {
      const response = await dispatch(
        loginThunk(formData),
      ).unwrap();

      toast.success(response.message);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error || "Login failed");
    }
    // loginUser(formData)
    //   .then((response) => {
    //     console.log("Login successful:", response);
    //     toast.success("Login successful");
    //     // Save authentication
    //     saveToken(response.token);
    //     saveUser(response.user);
    //     // Handle successful login, e.g., redirect to dashboard
    //     navigate("/");
    //   })
    //   .catch((error) => {
    //     console.error("Login failed:", error);
    //     toast.error(error.response?.data?.message || "Login failed");
    //   });
  };

  return (
    <AuthLayout>
      <Logo variant="auth" size="lg" />

      <h2 className="mt-8 text-3xl font-bold text-gray-800">Welcome Back</h2>

      <p className="mt-2 text-gray-500">
        Login to continue ordering your favourite food.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        <PasswordInput
          label="Password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-pink-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-pink-600 hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
