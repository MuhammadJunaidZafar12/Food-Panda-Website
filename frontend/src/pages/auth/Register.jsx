import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import AuthLayout from "../../components/layout/AuthLayout";
import Logo from "../../components/ui/Logo";
import { registerUser } from "../../services/auth.service";
import { saveToken, saveUser } from "../../utils/storage";
import { registerThunk } from "../../redux/auth/authThunk";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.name.trim()) {
      setLoading(false);
      return toast.error("Name is required");
    }

    if (!formData.email.trim()) {
      setLoading(false);
      return toast.error("Email is required");
    }

    if (!formData.phone.trim()) {
      setLoading(false);
      return toast.error("Phone number is required");
    }

    if (!formData.password) {
      setLoading(false);
      return toast.error("Password is required");
    }

    if (formData.password.length < 6) {
      setLoading(false);
      return toast.error("Password must be at least 6 characters");
    }

    if (!formData.acceptTerms) {
      setLoading(false);
      return toast.error("Please accept the Terms & Conditions");
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };

      //let responseData;

      //responseData = await registerUser(payload);
      const response = await dispatch(
        registerThunk(payload),
      ).unwrap();
      // This will be executed if the registration is successful and the thunk is fulfilled and use unwrap to get the actual response data
      toast.success(response.message);
      navigate("/");

      // This will be executed if the registration is successful and the thunk is fulfilled and use without unwrap to get the actual response data
      // if (registerThunk.fulfilled.match(response)) {
      //   toast.success(response.payload.message);
      //   navigate("/");
      // } else {
      //   toast.error(response.payload);
      // }

      //saveToken(responseData.token);
      //saveUser(responseData.user);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        acceptTerms: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />

      <h2 className="mt-10 text-4xl font-bold">Create Account 🚀</h2>

      <p className="mt-3 text-gray-500">
        Create your account and start ordering delicious food.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Name */}

        <div>
          <label className="mb-2 block font-medium">Full Name</label>

          <div className="relative">
            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />
          </div>
        </div>

        {/* Email */}

        <div>
          <label className="mb-2 block font-medium">Email</label>

          <div className="relative">
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />
          </div>
        </div>
        {/* Password */}
        <div>
          <label className="mb-2 block font-medium">Password</label>

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-12 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Phone */}

        <div>
          <label className="mb-2 block font-medium">Phone</label>

          <div className="relative">
            <Phone
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="phone"
              placeholder="03XXXXXXXXX"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 py-4 pl-12 pr-4 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />
          </div>
        </div>

        {/* Terms */}

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="accent-pink-600"
          />
          I agree to the Terms & Conditions
        </label>

        {/* Button */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-4 text-lg font-semibold text-white transition hover:scale-[1.02]"

        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-gray-600">
        Already have an account?
        <Link
          to="/"
          className="ml-2 font-semibold text-pink-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
