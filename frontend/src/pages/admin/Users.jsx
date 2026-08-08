import { UserCog, Mail, Phone, Shield, ShieldAlert, Trash2, ShieldOff, User } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersThunk, updateUserRoleThunk, deleteUserThunk } from "../../redux/auth/authThunk";
import toast from "react-hot-toast";

const Users = () => {
  const dispatch = useDispatch();
  const { users, usersLoading, usersError, user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  const handleToggleAdmin = async (user) => {
    const isSelf = currentUser?._id === user._id || currentUser?.id === user._id;
    if (isSelf) {
      toast.error("You cannot change your own admin privileges.");
      return;
    }

    const newRole = user.role === "admin" ? "customer" : "admin";
    const actionText = newRole === "admin" ? "promote to Admin" : "remove Admin privileges from";
    
    if (window.confirm(`Are you sure you want to ${actionText} ${user.name}?`)) {
      try {
        const result = await dispatch(updateUserRoleThunk({ userId: user._id, role: newRole })).unwrap();
        toast.success(result.message || "User role updated successfully.");
      } catch (err) {
        toast.error(err || "Failed to update user role.");
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const isSelf = currentUser?._id === user._id || currentUser?.id === user._id;
    if (isSelf) {
      toast.error("You cannot delete your own account.");
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete the user ${user.name}?`)) {
      try {
        const result = await dispatch(deleteUserThunk(user._id)).unwrap();
        toast.success(result.message || "User deleted successfully.");
      } catch (err) {
        toast.error(err || "Failed to delete user.");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Users</h1>
          <p className="mt-2 text-sm text-gray-500">Monitor accounts, assign platform roles, and manage user status.</p>
        </div>
      </div>

      {usersLoading && users.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
        </div>
      ) : usersError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
          <p className="font-semibold">Error Loading Users</p>
          <p className="mt-1 text-sm">{usersError}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium">No users found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const isSelf = currentUser?._id === user._id || currentUser?.id === user._id;
            return (
              <div key={user._id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                {isSelf && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                    You
                  </span>
                )}
                
                <div>
                  <div className="flex items-center gap-3.5">
                    <div className={`rounded-xl p-2.5 ${
                      user.role === "admin" 
                        ? "bg-red-100 text-red-600" 
                        : user.role === "owner" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      <UserCog size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">{user.name}</h2>
                      <span className={`inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "owner"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <p className="flex items-center gap-2.5">
                      <Mail size={16} className="text-gray-400" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="flex items-center gap-2.5">
                        <Phone size={16} className="text-gray-400" />
                        <span>{user.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex gap-3 border-t border-gray-100 pt-4">
                  {user.role === "admin" ? (
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      disabled={isSelf}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                    >
                      <ShieldOff size={16} />
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
                    >
                      <Shield size={16} />
                      Make Admin
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user)}
                    disabled={isSelf}
                    className="flex items-center justify-center rounded-xl border border-red-200 px-3.5 py-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Users;
