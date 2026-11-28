
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check already logged-in student
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        if (
          user?.role?.roleName?.toLowerCase() === "student"
        ) {
          router.replace("/home");
          return;
        }
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setCheckingAuth(false);
  }, [router]);

  // Login Submit
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const API =process.env.NEXT_PUBLIC_API_URL ||  "https://doctor-council.onrender.com";

      if (!API) {
        throw new Error("API URL is not configured.");
      }

      const response = await fetch(`${API}/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      // Student Role Validation
      if (
        data.user?.role?.roleName?.toLowerCase() !== "student"
      ) {
        toast.error("This login is only for student accounts.");
        return;
      }

      if (!data.token) {
        throw new Error("Authentication token not received.");
      }

      // Save Login Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Welcome! Login successful.");
       if(data.success==true) 
       {
        setForm({email:"",password:""})
       }
      

      router.replace("/home");

    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-semibold text-blue-700">
          Checking your account...
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-100 px-4 py-10">

      <ToastContainer
        position="top-right"
        autoClose={2500}
      />

      <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        {/* LEFT SECTION */}

        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 p-10 text-white md:flex lg:p-14">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10" />

          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10" />

          <div className="relative z-10">

            {/* Logo */}

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

            {/* Main Heading */}

            <div className="max-w-md">

              <p className="mb-4 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-100">
                MBBS ADMISSION PORTAL
              </p>

              <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">
                Your Journey to
                <span className="mt-2 block text-cyan-300">
                  Becoming a Doctor
                </span>
                Starts Here.
              </h1>

              <p className="mt-6 text-base leading-8 text-blue-50">
                Your trusted platform for MBBS admission and
                NEET UG counselling. Explore medical colleges,
                understand counselling procedures and take
                the next step towards your medical career.
              </p>

            </div>

            {/* Features */}

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">
                    NEET UG Counselling
                  </h3>

                  <p className="text-sm text-blue-100">
                    Guidance for medical admission procedures.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">
                    Medical College Selection
                  </h3>

                  <p className="text-sm text-blue-100">
                    Explore colleges and available courses.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-xl">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold">
                    Admission Assistance
                  </h3>

                  <p className="text-sm text-blue-100">
                    Get support throughout your admission journey.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Footer */}

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

          {/* Mobile Logo */}

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

          {/* Heading */}

          <div className="mb-9">

            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Student Portal
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Welcome Back!
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Sign in to access your MBBS counselling dashboard,
              manage your profile and track your medical admission journey.
            </p>

          </div>

          {/* Login Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your registered email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 pr-20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

            {/* Forgot Password */}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={() => router.push("/forget")}
                className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
              >
                Forgot Password?
              </button>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-5 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In to Your Account"}
            </button>

          </form>

          {/* Registration */}

          <div className="mt-8 border-t border-slate-200 pt-7 text-center">

            <p className="text-sm text-slate-600">
              Don't have a student account?
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/student-registration")
              }
              className="mt-2 text-sm font-extrabold text-blue-700 transition hover:text-blue-900"
            >
              Create Your Account →
            </button>

          </div>

          {/* Bottom Information */}

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">

            <p className="text-center text-xs leading-6 text-slate-700">
              Need assistance with MBBS admission or NEET UG
              counselling? Sign in to access your student portal
              and counselling services.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
