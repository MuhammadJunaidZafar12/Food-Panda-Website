import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { getProfileThunk, updateProfileThunk } from "../../redux/auth/authThunk";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    dispatch(getProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setFormData((current) => ({
      ...current,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    }));
  }, [user]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await dispatch(
        updateProfileThunk({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {}),
        })
      ).unwrap();
      setFormData((current) => ({ ...current, password: "", confirmPassword: "" }));
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error || "Failed to update profile.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-3xl bg-linear-to-r from-pink-600 to-rose-500 p-8 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <UserRound size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-100">
              Account Profile
            </p>
            <h1 className="mt-1 text-3xl font-bold">{user?.name || "Your profile"}</h1>
            <p className="mt-1 text-pink-100">Manage your personal information.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Full name</span>
            <span className="relative block">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="name" value={formData.name} onChange={handleChange} required minLength={3} className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-pink-500" />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Email</span>
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-pink-500" />
            </span>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-gray-700">Phone</span>
            <span className="relative block">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-3 outline-none focus:border-pink-500" />
            </span>
          </label>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={19} className="text-pink-600" />
            <h2 className="font-bold text-gray-900">Change password</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New password" minLength={8} className="rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-pink-500" />
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" minLength={8} className="rounded-xl border border-gray-300 px-3 py-3 outline-none focus:border-pink-500" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-xl bg-pink-600 px-5 py-3 font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
