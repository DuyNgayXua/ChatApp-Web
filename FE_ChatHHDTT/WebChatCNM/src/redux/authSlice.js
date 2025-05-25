import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    login: {
      currentUser: null,
      isFetching: false,
      error: false,
    },
    register: {
      isFetching: false,
      error: false,
      sucess: false,
    },
  },
  reducers: {
    loginStart: (state) => {
      state.login.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.login.isFetching = false;
      state.login.currentUser = action.payload;
      state.login.error = false;
    },
    loginFailed: (state) => {
      state.login.isFetching = false;

      state.login.error = true;
    },
    //register
    registerStart: (state) => {
      state.register.isFetching = true;
    },
    registerSuccess: (state) => {
      state.register.isFetching = false;

      state.register.error = false;
      state.register.sucess = true;
    },
    registerFailed: (state) => {
      state.register.isFetching = false;

      state.register.error = true;
      state.register.sucess = false;
    },
    //logout
    logoutStart: (state) => {
      state.login.isFetching = true;
    },
    logoutSuccess: (state) => {
      state.login.isFetching = false;
      state.login.currentUser = null;
      state.login.error = false;
    },
    logoutFailed: (state) => {
      state.login.isFetching = false;

      state.login.error = true;
    },
    //forgot password
    forgotPasswordStart: (state) => {
      state.isFetching = true;
    },
    forgotPasswordSuccess: (state, action) => {
      state.isFetching = false;
      state.message = action.payload;
    },
    forgotPasswordFailed: (state, action) => {
      state.isFetching = false;
      state.error = true;
      state.message = action.payload;
    },

    //reset
    resetPasswordStart: (state) => {
      state.isResettingPassword = true;
    },
    resetPasswordSuccess: (state, action) => {
      state.isResettingPassword = false;
      state.resetPasswordSuccess = true;
      state.resetPasswordMessage = action.payload;
    },
    resetPasswordFailed: (state, action) => {
      state.isResettingPassword = false;
      state.resetPasswordSuccess = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginStart,
  loginFailed,
  loginSuccess,
  registerStart,
  registerSuccess,
  registerFailed,
  logoutStart,
  logoutSuccess,
  logoutFailed,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailed,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailed,
} = authSlice.actions;

export default authSlice.reducer;
