
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function StudentRegistration() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://doctor-council.onrender.com";

  // Form validation
  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error("Enter a valid 10-digit phone number.");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  // Handle normal form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (registrationCompleted) return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If details change after OTP is sent, require a fresh OTP
    if (otpSent || emailVerified) {
      setOtpSent(false);
      setEmailVerified(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (registrationCompleted) return;

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch(`${apiUrl}/student-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setEmailVerified(false);
      setOtp(["", "", "", "", "", ""]);

      toast.success("OTP sent successfully to your email.");

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setOtp((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      return;
    }

    // Support pasting all six digits into one box
    if (digits.length > 1) {
      const pastedOtp = digits.slice(0, 6).split("");

      setOtp((prev) => {
        const updated = [...prev];

        pastedOtp.forEach((digit, i) => {
          if (i < 6) updated[i] = digit;
        });

        return updated;
      });

      otpRefs.current[Math.min(pastedOtp.length, 5)]?.focus();
      return;
    }

    setOtp((prev) => {
      const updated = [...prev];
      updated[index] = digits;
      return updated;
    });

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Backspace handling
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    try {
      setOtpLoading(true);

      const response = await fetch(
        `${apiUrl}/verify-student-register-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            otp: enteredOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setEmailVerified(true);
      setRegistrationCompleted(true);
      setOtpSent(false);

      toast.success("Email verified! Student account created successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "OTP verification failed. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Final submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailVerified || !registrationCompleted) {
      toast.error("Please verify your email before continuing.");
      return;
    }

    router.push("/login");
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">

          {/* Left Section */}
          <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 p-10 text-white lg:flex xl:p-14">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/10" />
            <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full border-[50px] border-white/10" />

            <Link href="/" className="relative z-10 inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-teal-700">
                +
              </div>
              <span className="text-2xl font-black tracking-wide">
                MEDIPATH
              </span>
            </Link>

            <div className="relative z-10 my-12">
              <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[2px]">
                Your future starts here
              </span>

              <h1 className="mt-8 text-4xl font-black leading-tight xl:text-5xl">
                Begin your journey toward a brighter future.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-teal-50">
                Create your student account and get ready to explore colleges,
                courses and counselling opportunities with MediPath.
              </p>

              <div className="mt-10 space-y-5">
                {[
                  "Explore colleges and universities",
                  "Discover courses and specializations",
                  "Organize your counselling journey",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm">
                      ✓
                    </span>
                    <span className="text-sm font-medium text-white/95">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="relative z-10 text-xs text-teal-100">
              © 2026 MediPath Counselling Platform
            </p>
          </section>

          {/* Registration Form */}
          <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-700"
            >
              <span aria-hidden="true">←</span>
              Back to home
            </Link>

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[2px] text-teal-600">
                Student Registration
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your details below to get started with MediPath.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={registrationCompleted}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Email address
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={registrationCompleted}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70"
                    required
                  />

                  {!registrationCompleted && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={
                        loading ||
                        !/^\S+@\S+\.\S+$/.test(form.email.trim())
                      }
                      className="rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Sending..."
                        : otpSent
                          ? "Resend OTP"
                          : "Verify Email"}
                    </button>
                  )}

                  {emailVerified && (
                    <span className="flex items-center justify-center gap-1 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* OTP Popup */}
                {otpSent && !emailVerified && (
                  <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          Verify your email
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Enter the 6-digit OTP sent to{" "}
                          <span className="font-bold text-teal-700">
                            {form.email}
                          </span>
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700">
                        6 Digits
                      </span>
                    </div>

                    <div className="mt-5 flex justify-between gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) =>
                            handleOtpKeyDown(index, e)
                          }
                          className="h-12 w-10 rounded-xl border border-slate-200 bg-white text-center text-lg font-bold text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 sm:h-14 sm:w-12"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.join("").length !== 6}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {otpLoading ? "Verifying..." : "Verify OTP"}
                      {!otpLoading && <span>→</span>}
                    </button>

                    <p className="mt-3 text-center text-xs text-slate-500">
                      Didn't receive OTP? Click Resend OTP above.
                    </p>
                  </div>
                )}

                {emailVerified && (
                  <p className="mt-2 text-xs font-semibold text-green-600">
                    Your email has been successfully verified.
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  value={form.phone}
                  disabled={registrationCompleted}
                  onChange={(e) =>
                    handleChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: "phone",
                        value: e.target.value.replace(/\D/g, "").slice(0, 10),
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password (min. 8 characters)"
                    value={form.password}
                    onChange={handleChange}
                    disabled={registrationCompleted}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70"
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={registrationCompleted}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || otpLoading || !emailVerified}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailVerified ? "Continue to Login" : "Verify Email to Continue"}
                <span aria-hidden="true">→</span>
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-bold text-teal-700 hover:text-teal-900"
                >
                  Log in
                </button>
              </p>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree to provide accurate information
              for your counselling profile.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
