
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

 if (value && index < 5) {
  inputRefs.current[index + 1]?.focus();
}
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

  if (e.key === "ArrowRight" && index < 5) {
  inputRefs.current[index + 1]?.focus();
}
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
  .getData("text")
  .replace(/\D/g, "")
  .slice(0, 6);

if (!pastedOtp) return;

setOtp([
  pastedOtp[0] || "",
  pastedOtp[1] || "",
  pastedOtp[2] || "",
  pastedOtp[3] || "",
  pastedOtp[4] || "",
  pastedOtp[5] || "",
]);

inputRefs.current[Math.min(pastedOtp.length, 5)]?.focus();
  };

  const handleVerify = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
  toast.error("Please enter complete 6-digit OTP.");
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
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();

        throw new Error(data.message || "OTP verification failed");
      }

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

      setOtp(["", "", "", "", "", ""]);
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f6fc] px-4 py-8 sm:px-6">

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
      />

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_25px_80px_rgba(15,23,42,0.12)] md:min-h-[690px] md:grid-cols-2">

        {/* LEFT PANEL */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#071b49] via-[#103c83] to-[#087eaa] p-10 text-white md:flex lg:p-14">

          <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-2xl" />

          <div className="relative z-10">

            {/* Brand */}
            <div className="mb-20 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl font-black text-blue-800 shadow-xl">
                M
              </div>

              <div>
                <h2 className="text-2xl font-extrabold tracking-wide">
                  MediPath
                </h2>
                <p className="text-[10px] font-bold tracking-[3px] text-cyan-200">
                  MEDICAL COUNSELLING
                </p>
              </div>
            </div>

            <div className="max-w-md">

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold tracking-widest text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                ACCOUNT SECURITY
              </span>

              <h1 className="mt-7 text-4xl font-extrabold leading-tight lg:text-5xl">
                Verify Your
                <span className="mt-2 block text-cyan-300">
                  Identity
                </span>
              </h1>

              <p className="mt-6 text-sm leading-8 text-blue-100 lg:text-base">
                Your security matters to us. Verify your registered
                email address using the one-time password to
                securely regain access to your account.
              </p>

            </div>

            {/* Features */}
            <div className="mt-12 space-y-6">

              {[
                {
                  title: "Secure OTP Verification",
                  desc: "Your email identity is verified securely.",
                },
                {
                  title: "Protected Account Access",
                  desc: "Only authorized users can reset passwords.",
                },
                {
                  title: "Fast & Simple Process",
                  desc: "Get back to your account in just a few steps.",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg text-cyan-300">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-sm font-bold">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-blue-200">
                      {item.desc}
                    </p>
                  </div>

                </div>
              ))}

            </div>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-sm font-semibold text-cyan-100">
              Your Medical Career, Our Guidance.
            </p>
            <p className="mt-2 text-[11px] text-blue-200">
              © 2026 MediPath Medical Counselling. All rights reserved.
            </p>
          </div>

        </section>

        {/* RIGHT PANEL */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">

          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-3 md:hidden">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-2xl font-black text-white">
              M
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-blue-950">
                MediPath
              </h2>
              <p className="text-[10px] font-bold tracking-[2px] text-slate-500">
                MEDICAL COUNSELLING
              </p>
            </div>

          </div>

          {/* Email Icon */}
          <div className="mb-7 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm ring-1 ring-blue-100">
            ✉️
          </div>

          <div className="mb-9">

            <p className="text-xs font-extrabold uppercase tracking-[2px] text-blue-700">
              Email Verification
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Verify OTP
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              We've sent a 4-digit verification code to your
              registered email address.
            </p>

            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

              <span className="text-blue-600">✉</span>

              <span className="break-all text-sm font-bold text-blue-800">
                {email || "Email address not found"}
              </span>

            </div>

          </div>

          <form onSubmit={handleVerify} className="space-y-8">

            {/* OTP INPUT */}
            <div>

              <label className="mb-5 block text-sm font-bold text-slate-800">
                Enter Verification Code
              </label>

              <div className="flex justify-between gap-3 sm:gap-4">

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
                    disabled={loading}
                    onChange={(e) =>
                      handleChange(e.target.value, index)
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(e, index)
                    }
                    onPaste={handlePaste}
                    className={`h-[58px] w-full max-w-[66px] rounded-2xl border-2 bg-slate-50 text-center text-2xl font-extrabold text-blue-800 outline-none transition-all duration-200 sm:h-[68px] ${
                      digit
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-slate-200"
                    } focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60`}
                  />
                ))}

              </div>

              <p className="mt-3 text-xs text-slate-400">
                Enter the 4-digit code received in your email.
              </p>

            </div>

            {/* RESEND OTP */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">

              <span className="text-sm text-slate-500">
                Didn't receive the code?
              </span>

              {timer > 0 ? (

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                  Resend in 00:{String(timer).padStart(2, "0")}
                </span>

              ) : (

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || loading}
                  className="text-sm font-extrabold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
                >
                  {resending ? "Sending OTP..." : "Resend OTP →"}
                </button>

              )}

            </div>

            {/* VERIFY BUTTON */}
            <button
              type="submit"
              disabled={loading || resending || !email}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-blue-700/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  Verify OTP
                  <span className="text-lg">→</span>
                </>
              )}

            </button>

          </form>

          {/* BACK BUTTON */}
          <div className="mt-8 border-t border-slate-100 pt-7 text-center">

            <button
              type="button"
              onClick={() => router.push("/forget-pass")}
              className="text-sm font-bold text-slate-500 transition hover:text-blue-700"
            >
              ← Back to Forgot Password
            </button>

          </div>

          {/* SECURITY NOTE */}
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">

            <span className="text-lg">🔒</span>

            <p className="text-xs leading-6 text-slate-600">
              Your verification code is valid for 5 minutes.
              For your security, never share your OTP with anyone.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
