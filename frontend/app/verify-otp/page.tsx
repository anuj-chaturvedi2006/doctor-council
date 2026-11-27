
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // OTP input change
  const handleChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace handling
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Paste complete OTP
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!pastedOtp) return;

    setOtp([
      pastedOtp[0] || "",
      pastedOtp[1] || "",
      pastedOtp[2] || "",
      pastedOtp[3] || "",
    ]);

    inputRefs.current[
      Math.min(pastedOtp.length, 3)
    ]?.focus();
  };

  // Verify OTP API
  const handleVerify = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      toast.error("Please enter complete 4-digit OTP.");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/verifyemail-forget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: enteredOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed");
      }

      // Store reset token for next password reset page
      sessionStorage.setItem("resetToken", data.resetToken);
      sessionStorage.setItem("resetEmail", email);

      toast.success("OTP verified successfully!");

      setTimeout(() => {
        router.push("/reset-password");
      }, 1000);

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

  // Resend OTP API
  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found.");
      return;
    }

    try {
      setResending(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/forget-pass`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP resend failed");
      }

      setOtp(["", "", "", ""]);
      setTimer(60);
      inputRefs.current[0]?.focus();

      toast.success("New OTP sent successfully!");

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to resend OTP."
      );
    } finally {
      setResending(false);
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
                ACCOUNT SECURITY
              </p>

              <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                Verify Your
                <span className="mt-2 block text-cyan-300">
                  Identity
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-blue-50">
                We have sent a verification code to your
                registered email address. Enter the code
                to securely continue resetting your password.
              </p>
            </div>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold">Secure OTP Verification</h3>
                  <p className="text-sm text-blue-100">
                    Verify your registered email.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold">Account Protection</h3>
                  <p className="text-sm text-blue-100">
                    Only you can reset your password.
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
            ✉️
          </div>

          <div className="mb-9">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Email Verification
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Verify OTP
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Enter the 4-digit verification code sent to
              your registered email address.
            </p>

            <p className="mt-3 break-all text-sm font-bold text-blue-700">
              {email || "Email address not found"}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-7">

            {/* OTP INPUTS */}
            <div>
              <label className="mb-4 block text-sm font-bold text-slate-800">
                Enter Verification Code
              </label>

              <div className="flex justify-between gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(e.target.value, index)
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(e, index)
                    }
                    onPaste={handlePaste}
                    className="h-14 w-14 rounded-xl border-2 border-slate-300 bg-slate-50 text-center text-2xl font-extrabold text-blue-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:h-16 sm:w-16"
                  />
                ))}
              </div>
            </div>

            {/* RESEND OTP */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">

              <span className="text-slate-600">
                Didn't receive the code?
              </span>

              {timer > 0 ? (
                <span className="font-bold text-blue-700">
                  Resend in 00:{String(timer).padStart(2, "0")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-bold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend OTP"}
                </button>
              )}

            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>

          {/* BACK BUTTON */}
          <div className="mt-8 border-t border-slate-200 pt-7 text-center">
            <button
              type="button"
              onClick={() => router.push("/forget-pass")}
              className="text-sm font-extrabold text-blue-700 transition hover:text-blue-900"
            >
              ← Back to Forgot Password
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-center text-xs leading-6 text-slate-700">
              Your verification code is valid for 5 minutes.
              Never share your OTP with anyone.
            </p>
          </div>

        </section>
      </div>
    </main>
  );
}
