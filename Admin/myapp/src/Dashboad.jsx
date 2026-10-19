
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiTrendingUp,
  FiArrowUpRight,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";

const API = "http://localhost:2002";

const Dashboad = () => {
  const [students, setStudents] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const results = await Promise.allSettled([
        axios.get(`${API}/get-user`, config),
        axios.get(`${API}/get-role`, config),
      ]);

      if (results[0].status === "fulfilled") {
        const response = results[0].value.data;

        if (response.status) {
          setStudents(response.user || []);
        } else {
          setStudents([]);
        }
      } else {
        setStudents([]);
        console.error("Students API:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        const response = results[1].value.data;

        if (response.status) {
          setRoles(response.role || []);
        } else {
          setRoles([]);
        }
      } else {
        setRoles([]);
        console.error("Roles API:", results[1].reason);
      }

      if (
        results.every((result) => result.status === "rejected")
      ) {
        setError("Dashboard data load nahi hua. Backend aur API routes check karo.");
      }
    } catch (err) {
      console.error(err);
      setError("Dashboard data load nahi hua.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const activeStudents = students.filter(
    (student) =>
      String(student.status || "").toLowerCase() === "active"
  ).length;

  const inactiveStudents = students.filter(
    (student) =>
      String(student.status || "").toLowerCase() === "inactive"
  ).length;

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      subtitle: "All registered users",
      icon: <FiUsers size={22} />,
      iconStyle: "bg-blue-50 text-blue-600",
      changeStyle: "text-blue-600",
    },
    {
      title: "Active Students",
      value: activeStudents,
      subtitle: "Currently active",
      icon: <FiUserCheck size={22} />,
      iconStyle: "bg-emerald-50 text-emerald-600",
      changeStyle: "text-emerald-600",
    },
    {
      title: "Inactive Students",
      value: inactiveStudents,
      subtitle: "Currently inactive",
      icon: <FiUserX size={22} />,
      iconStyle: "bg-rose-50 text-rose-600",
      changeStyle: "text-rose-600",
    },
    {
      title: "Total Roles",
      value: roles.length,
      subtitle: "Configured system roles",
      icon: <FiShield size={22} />,
      iconStyle: "bg-violet-50 text-violet-600",
      changeStyle: "text-violet-600",
    },
  ];

  const recentStudents = [...students]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Overview
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here is what's happening in your system.
          </p>
        </div>

        <button
          onClick={getDashboardData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
            size={17}
          />
          Refresh Data
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
                  {loading ? "—" : stat.value}
                </h2>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconStyle}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
              <FiTrendingUp
                size={15}
                className={stat.changeStyle}
              />

              <p className="text-xs text-slate-500">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Recent Registrations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest registered users in your system
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 sm:self-auto">
            <FiCalendar size={15} />
            Latest 5 users
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-14 text-center text-sm text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiRefreshCw className="animate-spin" size={17} />
                      Loading dashboard data...
                    </span>
                  </td>
                </tr>
              ) : recentStudents.length > 0 ? (
                recentStudents.map((student, index) => {
                  const name = student.name || "Unnamed User";
                  const status = String(
                    student.status || "pending"
                  ).toLowerCase();

                  const roleName =
                    typeof student.role === "object"
                      ? student.role?.roleName || "—"
                      : student.role || "—";

                  return (
                    <tr
                      key={student._id || student.email || index}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-600">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <span className="font-semibold text-slate-700">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {student.email || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-slate-600">
                        {roleName}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : status === "inactive"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              status === "active"
                                ? "bg-emerald-500"
                                : status === "inactive"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {status.charAt(0).toUpperCase() +
                            status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(student.createdAt)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                        <FiUsers size={22} />
                      </div>

                      <p className="font-semibold text-slate-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Registered users will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-xs text-slate-500 sm:text-sm">
            Showing {loading ? 0 : recentStudents.length} of{" "}
            {loading ? 0 : students.length} users
          </p>

          <button
            onClick={() => window.location.assign("/admin/student")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View Students
            <FiArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboad;
