
"use client";

import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  

  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.password ||
    !form.confirmPassword
  ) {
    toast.error("Please fill in all fields.");
    return;
  }

 if (!/^\S+@\S+\.\S+$/.test(form.email)) {
  toast.error("Please enter a valid email address.");
  return;
}

  if (!/^[0-9]{10}$/.test(form.phone)) {
    toast.error("Enter a valid 10-digit phone number.");
    return;
  }

  if (form.password.length < 8) {
    toast.error("Password must be at least 8 characters.");
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.error("Passwords do not match.");
    return;
  }

  try {
    console.log("FORM SUBMITTED");
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://doctor-council.onrender.com";
    console.log("API URL:", apiUrl);

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured.");
    }
  console.log("Sending API request...");
    const response = await fetch(`${apiUrl}/student-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      }),
    });
console.log("Response status:", response.status);
    const data = await response.json();
console.log("Backend response:", data)
    if (!response.ok || !data.status) {
      throw new Error(data.message || "Registration failed.");
    }

    toast.success("Student registered successfully!");

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <>
     <ToastContainer
      position="top-right"
      autoClose={3000}
      theme="colored"
    />

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                required
              />
            </div>

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
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                required
              />
            </div>

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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Student Account"}
              {!loading && <span aria-hidden="true">→</span>}
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
