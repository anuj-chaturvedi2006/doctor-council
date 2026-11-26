
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);

      // Backend API integration abhi pending hai.
      // Pehle UI ready kar rahe hain.

      toast.info("Forgot password API integration is pending.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
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

            <div className="max-w-md">
              <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-100">
                ACCOUNT RECOVERY
              </p>

              <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                Forgot Your
                <span className="mt-2 block text-cyan-300">
                  Password?
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-blue-50">
                Don't worry! It happens. Enter your registered
                email address and follow the steps to securely
                reset your MediPath account password.
              </p>
            </div>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">Secure Verification</h3>
                  <p className="text-sm text-blue-100">
                    Verify your registered email address.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">Easy Password Reset</h3>
                  <p className="text-sm text-blue-100">
                    Create a new password securely.
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

          <div className="mb-9">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Student Portal
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Reset Password
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Enter the email address associated with your
              student account. We will help you recover access
              to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Registered Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>

          <div className="mt-8 border-t border-slate-200 pt-7 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-extrabold text-blue-700 transition hover:text-blue-900"
            >
              ← Back to Login
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-center text-xs leading-6 text-slate-700">
              If you need assistance recovering your account,
              please contact the MediPath support team.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}
