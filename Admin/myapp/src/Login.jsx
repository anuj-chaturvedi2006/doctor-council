import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:2002/admin-login",
        form
      );

      console.log(res.data);

      if (res.data.success) {
        toast.success(res.data.message || "Login successful!");

        localStorage.setItem(
          "email",
          JSON.stringify(form.email)
        );

        if (!res.data.token) {
          toast.error("Login response mein token nahi mila!");
          return;
        }

        localStorage.setItem("token", res.data.token);

        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user)
        );

        navigate("/admin/dashboard");
      } else {
        toast.error(res.data.message || "Login failed.");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const forgetPassword = () => {
    navigate("/forget");
  };

  const resetPassword = () => {
    if (form.email.trim() === "") {
      toast.error("Please enter your email first!");
      return;
    }

    localStorage.setItem(
      "email",
      JSON.stringify(form.email)
    );

    navigate("/reset");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">

      {/* Background Decoration */}
      <div className="fixed left-0 top-0 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="fixed bottom-0 right-0 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl" />

      {/* Login Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-slate-300/60">

        {/* Top Gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-violet-600" />

        <div className="px-6 py-9 sm:px-10 sm:py-10">

          {/* Header */}
          <div className="mb-9 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg shadow-indigo-200">
              🔐
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your admin dashboard
            </p>

          </div>

          {/* Login Form */}
          <form onSubmit={loginHandler} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg">
                  ✉️
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={changeHandler}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={forgetPassword}
                  className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg">
                  🔑
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={changeHandler}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-14 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-xl text-slate-500 transition hover:text-indigo-600"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && <span>→</span>}
            </button>

            {/* Reset Password */}
            <button
              type="button"
              onClick={resetPassword}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Reset Password
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              SECURE ADMIN ACCESS
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="font-bold text-indigo-600 transition hover:text-indigo-800"
            >
              Sign Up
            </button>
          </p>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Admin Panel. All rights reserved.
          </p>
        </div>

      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

    </div>
  );
};

export default Login;
