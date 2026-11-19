
"use client";

import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Forget = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [otp1, setOtp1] = useState("");
  const [otp2, setOtp2] = useState("");
  const [otp3, setOtp3] = useState("");
  const [otp4, setOtp4] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [verify, setVerify] = useState(false);

  const [newpassword, setNewpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Send OTP
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://doctor-council.onrender.com/forget-pass",
        { email }
      );

      if (res.data.success) {
        toast.success(res.data.message || "OTP sent successfully!");
        setShowOtp(true);
      } else {
        toast.error(res.data.message || "Email verification failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otp = otp1 + otp2 + otp3 + otp4;

    if (otp.length !== 4) {
      toast.warning("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://doctor-council.onrender.com/verifyemail-forget",
        { email, otp }
      );

      if (res.data.success) {
        toast.success(res.data.message || "OTP verified successfully!");

        setShowOtp(false);
        setVerify(true);
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const passwordHandler = async (e) => {
    e.preventDefault();

    if (!newpassword || !confirmPassword) {
      toast.warning("Please fill all password fields");
      return;
    }

    if (newpassword !== confirmPassword) {
      toast.error("Password does not match!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://doctor-council.onrender.com/forget-password",
        {
          email,
          password: newpassword,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Password changed successfully!");

        setNewpassword("");
        setConfirmPassword("");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(res.data.message || "Password change failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  // OTP Input
  const handleOtpChange = (value, setter) => {
    setter(value.replace(/\D/g, "").slice(0, 1));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

      {/* Background Decoration */}
      <div className="absolute -top-32 -right-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl min-h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SECTION */}
        <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">

          <div className="absolute -right-24 -bottom-24 w-80 h-80 border border-white/10 rounded-full"></div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 border border-white/10 rounded-full"></div>

          {/* Brand */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-700 font-black text-2xl shadow-lg">
              U
            </div>

            <span className="text-xl font-bold tracking-wide">
              University Portal
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 my-12">

            <span className="text-blue-300 text-xs font-bold tracking-[3px]">
              ACCOUNT SECURITY
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mt-5">
              Secure your account.
              <span className="block text-blue-300 mt-2">
                Reset your password.
              </span>
            </h1>

            <p className="text-blue-100/80 text-sm leading-7 mt-6 max-w-md">
              Don't worry! It happens. Follow a few simple steps
              to recover your account and get back to where you left off.
            </p>

            {/* Steps */}
            <div className="mt-10 space-y-6">

              {[
                ["01", "Verify your email", "Enter your registered email address."],
                ["02", "Verify OTP", "Enter the verification code sent to you."],
                ["03", "Create new password", "Set a strong password for your account."]
              ].map((item) => (
                <div key={item[0]} className="flex items-center gap-4">

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-300 font-bold">
                    {item[0]}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm">{item[1]}</h4>
                    <p className="text-xs text-blue-200 mt-1">{item[2]}</p>
                  </div>

                </div>
              ))}

            </div>
          </div>

          <div className="relative z-10 text-xs text-blue-200/70">
            © 2026 University Portal. All rights reserved.
          </div>

        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-white">

          <div className="w-full max-w-md">

            {!verify ? (

              <>
                {/* Forgot Password */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl mb-7">
                  🔐
                </div>

                <span className="text-blue-600 text-xs font-bold tracking-[2px]">
                  PASSWORD RECOVERY
                </span>

                <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                  Forgot Password?
                </h2>

                <p className="text-slate-500 text-sm leading-6 mt-3 mb-8">
                  Enter your registered email address and we'll
                  send you a verification code.
                </p>

                <form onSubmit={submitHandler}>

                  <div className="mb-6">

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>

                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 rounded-xl px-4 h-14 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                      <span className="text-slate-400 text-lg">✉</span>

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                        className="w-full outline-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400"
                      />

                    </div>

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending OTP..." : "Send Verification Code"}
                    {!loading && <span className="text-xl">→</span>}
                  </button>

                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-xs text-slate-400">OR</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 border border-blue-200 rounded-xl text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-all"
                >
                  ← Back to Login
                </button>

                <div className="mt-8 text-center text-xs text-slate-400">
                  🔒 Your information is protected and secure.
                </div>
              </>

            ) : (

              <>
                {/* New Password */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl mb-7">
                  🔑
                </div>

                <span className="text-blue-600 text-xs font-bold tracking-[2px]">
                  NEW PASSWORD
                </span>

                <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
                  Create Password
                </h2>

                <p className="text-slate-500 text-sm leading-6 mt-3 mb-8">
                  Create a strong new password for your account.
                </p>

                <form onSubmit={passwordHandler}>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>

                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 rounded-xl px-4 h-14 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                      <span>🔒</span>

                      <input
                        type="password"
                        value={newpassword}
                        onChange={(e) => setNewpassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full outline-none bg-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-7">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>

                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 rounded-xl px-4 h-14 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                      <span>🔐</span>

                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full outline-none bg-transparent text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
                  >
                    {loading ? "Updating Password..." : "Change Password →"}
                  </button>

                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                  🔒 Choose a strong and unique password.
                </div>
              </>

            )}

          </div>
        </div>
      </div>

      {/* OTP POPUP */}
      {showOtp && (

        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 sm:p-10 text-center">

            <button
              type="button"
              onClick={() => setShowOtp(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 text-xl transition-all"
            >
              ×
            </button>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-4xl mb-6">
              ✉️
            </div>

            <span className="text-blue-600 text-xs font-bold tracking-[2px]">
              EMAIL VERIFICATION
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 mt-3">
              Verify Your Email
            </h2>

            <p className="text-sm text-slate-500 leading-6 mt-3">
              We've sent a 4-digit verification code to
              <br />
              <strong className="text-blue-700 break-all">{email}</strong>
            </p>

            {/* OTP INPUTS */}
            <div className="flex justify-center gap-3 my-9">

              {[otp1, otp2, otp3, otp4].map((value, index) => {

                const setters = [setOtp1, setOtp2, setOtp3, setOtp4];

                return (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) =>
                      handleOtpChange(e.target.value, setters[index])
                    }
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-blue-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                );
              })}

            </div>

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold shadow-lg shadow-blue-200 hover:shadow-xl transition-all disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>

            <p className="text-xs text-slate-500 mt-7">
              Wrong email address?{" "}
              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="text-blue-600 font-bold hover:underline"
              >
                Change Email
              </button>
            </p>

          </div>
        </div>

      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

    </div>
  );
};

export default Forget;
