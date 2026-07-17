import { createSlice } from "@reduxjs/toolkit";
import { loginThunk, registerThunk, getCurrentUserThunk } from "./authThunk";
import { getToken, getUser, saveToken, saveUser, clearStorage } from "../../utils/storage";
import { logoutUser } from "../../services/auth.service";

const initialState = {
    user: getUser(),
    token: getToken(),
    isAuthenticated: !!getToken(),
    loading: false,
    isCheckingAuth: true,    // App startup authentication check
    error: null,
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
            });

    }
});

export const { logout, finishAuthCheck } = authSlice.actions;
export default authSlice.reducer;