
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

        if (user?.role?.roleName?.toLowerCase() === "student") {
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



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      const response = await fetch(`${apiUrl}/admin-login`, {
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

      // Student role validation
      if (data.user?.role?.roleName?.toLowerCase() !== "student") {
        toast.error("This login is only for student accounts.");
        return;
      }

      if (!data.token) {
        throw new Error("Authentication token not received.");
      }

      // Save token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    // Save token and user
localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

toast.success("Login successful!");

router.replace("/home");

      toast.success("Login successful!");

      // Redirect to profile
      router.replace("/user-profile");

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
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <p className="font-semibold text-blue-600">
          Checking login...
        </p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10">
      <ToastContainer position="top-right" autoClose={2500} />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        {/* Left Section */}
        <section className="hidden flex-col justify-center bg-gradient-to-br from-blue-700 to-cyan-600 p-12 text-white md:flex">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold">
            M
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Welcome back to MediPath
          </h1>

          <p className="mt-5 leading-7 text-blue-50">
            Sign in to continue your medical counselling journey and manage
            your student profile.
          </p>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="font-semibold">Your future starts here.</p>
            <p className="mt-2 text-sm text-blue-50">
              Access your counselling information in one place.
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="p-6 sm:p-10 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Student Portal
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
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
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-20 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/forget-pass")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Registration */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/student-registration")}
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Create account
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
