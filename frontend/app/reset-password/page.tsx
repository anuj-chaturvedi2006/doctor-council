
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const resetEmail =
    typeof window !== "undefined"
      ? sessionStorage.getItem("resetEmail")
      : null;

  const resetToken =
    typeof window !== "undefined"
      ? sessionStorage.getItem("resetToken")
      : null;

  // Password validation
  const requirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const strength = requirements.filter(
    (item) => item.valid
  ).length;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!resetEmail || !resetToken) {
      toast.error("Session expired. Please verify OTP again.");
      router.push("/forget-pass");
      return;
    }

    if (strength !== 5) {
      toast.error("Please fulfill all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forget-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            password,
            resetToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Password reset failed."
        );
      }

      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");

      toast.success("Password updated successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 1200);

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4 py-10">

      <ToastContainer position="top-right" autoClose={2500} />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        {/* LEFT SECTION */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 p-10 text-white md:flex lg:p-14">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            {/* LOGO */}
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-blue-800 shadow-lg">
                M
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-wide">
                  MediPath
                </h2>

                <p className="text-xs font-medium tracking-widest text-blue-100">
                  MEDICAL COUNSELLING
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-md">

              <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-100">
                ACCOUNT RECOVERY
              </p>

              <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                Create New
                <span className="mt-2 block text-cyan-300">
                  Password
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-blue-50">
                Your email has been verified successfully.
                Create a strong new password to secure your
                MediPath student account.
              </p>

            </div>

            {/* SECURITY FEATURES */}
            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">
                    Strong Password
                  </h3>
                  <p className="text-sm text-blue-100">
                    Protect your account with a secure password.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">
                    Secure Account
                  </h3>
                  <p className="text-sm text-blue-100">
                    Your account security is our priority.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <div className="relative z-10 mt-12 border-t border-white/20 pt-6">
            <p className="text-sm text-blue-100">
              Your Medical Career, Our Guidance.
            </p>

            <p className="mt-2 text-xs text-blue-200">
              © 2026 MediPath Medical Counselling. All rights reserved.
            </p>
          </div>

        </section>

        {/* RIGHT SECTION */}
        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">

          {/* MOBILE LOGO */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-2xl font-bold text-white">
              M
            </div>

            <div>
              <h2 className="text-xl font-bold text-blue-950">
                MediPath
              </h2>

              <p className="text-xs font-semibold tracking-widest text-slate-500">
                MEDICAL COUNSELLING
              </p>
            </div>
          </div>

          {/* ICON */}
          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🔐
          </div>

          {/* HEADING */}
          <div className="mb-8">

            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Account Security
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              New Password
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Create a strong password for your account.
              Make sure it is different from your previous password.
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NEW PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-800">
                New Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700 hover:text-blue-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* PASSWORD STRENGTH */}
            {password.length > 0 && (
              <div>

                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span className="text-slate-600">
                    Password Strength
                  </span>

                  <span className={
                    strength <= 2
                      ? "text-red-500"
                      : strength <= 4
                      ? "text-amber-500"
                      : "text-green-600"
                  }>
                    {strength <= 2
                      ? "Weak"
                      : strength <= 4
                      ? "Medium"
                      : "Strong"}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className={`h-1.5 flex-1 rounded-full ${
                        strength >= item
                          ? strength <= 2
                            ? "bg-red-500"
                            : strength <= 4
                            ? "bg-amber-500"
                            : "bg-green-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

              </div>
            )}

            {/* PASSWORD REQUIREMENTS */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

              <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-700">
                Password Requirements
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                {requirements.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className={
                      item.valid
                        ? "font-bold text-green-600"
                        : "text-slate-400"
                    }>
                      {item.valid ? "✓" : "○"}
                    </span>

                    <span className={
                      item.valid
                        ? "text-green-700"
                        : "text-slate-600"
                    }>
                      {item.label}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            {/* CONFIRM PASSWORD */}
            <div>

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-16 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-700 hover:text-blue-900"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>

              </div>

              {confirmPassword.length > 0 && (
                <p className={`mt-2 text-xs font-semibold ${
                  password === confirmPassword
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </p>
              )}

            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>

          </form>

          {/* BACK TO LOGIN */}
          <div className="mt-8 border-t border-slate-200 pt-7 text-center">

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-extrabold text-blue-700 transition hover:text-blue-900"
            >
              ← Back to Login
            </button>

          </div>

          {/* FOOTER */}
          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-center text-xs leading-6 text-slate-700">
              Keep your password confidential. Never share
              your account credentials with anyone.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
