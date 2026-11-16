
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const router = useRouter();
  const [name, setName] = useState("Student");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      router.replace("/student-login");
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      setName(user.name || "Student");
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/student-login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/student-login");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between bg-white px-6 py-5 shadow-sm">
        <h1 className="text-xl font-extrabold text-teal-700">
          MEDIPATH
        </h1>

        {/* <button
          onClick={handleLogout}
          className="rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100"
        >
          Logout
        </button> */}
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white shadow-lg sm:p-12">
          <p className="text-sm font-medium text-teal-50">
            STUDENT PORTAL
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome, {name}!
          </h2>

          <p className="mt-4 max-w-xl text-teal-50">
            Welcome to your MediPath dashboard. Your medical counselling
            journey starts here.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              My Profile
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              View and manage your student details.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              Counselling
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Keep track of your counselling journey.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800">
              Colleges
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Explore colleges and available courses.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
