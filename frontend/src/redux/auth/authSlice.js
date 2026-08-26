import { createSlice } from "@reduxjs/toolkit";
import {
    loginThunk,
    registerThunk,
    getCurrentUserThunk,
    getAllUsersThunk,
    updateUserRoleThunk,
    deleteUserThunk,
} from "./authThunk";
import { getToken, getUser, clearStorage } from "../../utils/storage";

const initialState = {
    user: getUser(),
    token: getToken(),
    isAuthenticated: !!getToken(),
    loading: false,
    isCheckingAuth: true,    // App startup authentication check
    error: null,
    users: [],
    usersLoading: false,
    usersError: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            clearStorage();
        },
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        finishAuthCheck(state) {
            state.isCheckingAuth = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;

            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;

            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            }).addCase(getCurrentUserThunk.pending, (state) => {
                state.isCheckingAuth = true;
            })
            .addCase(getCurrentUserThunk.fulfilled, (state, action) => {
                state.isCheckingAuth = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(getCurrentUserThunk.rejected, (state) => {
                state.isCheckingAuth = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                clearStorage();
            })
            .addCase(getAllUsersThunk.pending, (state) => {
                state.usersLoading = true;
                state.usersError = null;
            })
            .addCase(getAllUsersThunk.fulfilled, (state, action) => {
                state.usersLoading = false;
                state.users = action.payload.users;
            })
            .addCase(getAllUsersThunk.rejected, (state, action) => {
                state.usersLoading = false;
                state.usersError = action.payload;
            })
            .addCase(updateUserRoleThunk.pending, (state) => {
                state.usersLoading = true;
                state.usersError = null;
            })
            .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
                state.usersLoading = false;
                const updatedUser = action.payload.user;
                state.users = state.users.map((u) =>
                    u._id === updatedUser._id ? updatedUser : u
                );
            })
            .addCase(updateUserRoleThunk.rejected, (state, action) => {
                state.usersLoading = false;
                state.usersError = action.payload;
            })
            .addCase(deleteUserThunk.pending, (state) => {
                state.usersLoading = true;
                state.usersError = null;
            })
            .addCase(deleteUserThunk.fulfilled, (state, action) => {
                state.usersLoading = false;
                const { userId } = action.payload;
                state.users = state.users.filter((u) => u._id !== userId);
            })
            .addCase(deleteUserThunk.rejected, (state, action) => {
                state.usersLoading = false;
                state.usersError = action.payload;
            });

    }
});

export const { logout, setUser, finishAuthCheck } = authSlice.actions;
export default authSlice.reducer;