
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
const API = "http://localhost:2002";

const CounsellorDashboard = () => {
   
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const endpoints = [
        "/counsellor/my-assignments",
        "/get-follow-ups",
        "/get-appointments",
        "/get-counselling-sessions",
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(`${API}${endpoint}`, { headers })
        )
      );

      const results = await Promise.all(
        responses.map(async (response) => {
          const result = await response.json();

          if (!response.ok || result.success === false) {
            throw new Error(result.message || "Unable to fetch dashboard data");
          }

          return result;
        })
      );

      setAssignments(results[0].data || []);
      setFollowUps(results[1].data || []);
      setAppointments(results[2].data || []);
      setSessions(results[3].data || []);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Unique assigned students
  const uniqueStudents = new Set(
    assignments
      .map((item) => {
        const student = item.counsellingRequest?.student;
        return student?._id || student?.id;
      })
      .filter(Boolean)
  );

  const totalStudents = uniqueStudents.size;

  // Total assigned counselling requests
  const totalRequests = assignments.filter(
    (item) => item.counsellingRequest
  ).length;

  // Pending follow-ups
  const pendingFollowUps = followUps.filter(
    (item) => item.status === "pending"
  );

  // Today's date in local timezone
  const today = new Date();

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);

    return (
      !isNaN(date.getTime()) &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Today's appointments
  const todaysAppointments = appointments
    .filter((item) => isToday(item.appointmentDate))
    .sort(
      (a, b) =>
        new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );

  // Completed sessions
  const completedSessions = sessions.filter((item) => {
    const status = String(
      item.status || item.sessionStatus || ""
    ).toLowerCase();

    return status === "completed";
  });

  // Recent follow-ups
  const recentFollowUps = [...followUps]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    {
      title: "Assigned Students",
      value: totalStudents,
      icon: "👨‍🎓",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Counselling Requests",
      value: totalRequests,
      icon: "📋",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Pending Follow-ups",
      value: pendingFollowUps.length,
      icon: "⏰",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: "📅",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Completed Sessions",
      value: completedSessions.length,
      icon: "✅",
      color: "bg-teal-100 text-teal-600",
    },
  ];

  const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to Counsellor Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your assigned students and counselling activities.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchDashboardData}
            className="ml-3 font-semibold underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {item.title}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl ${item.color}`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>


{/* Quick Actions */}
<div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
  <h2 className="text-lg font-bold text-gray-800">
    Quick Actions
  </h2>

  <p className="mb-5 mt-1 text-sm text-gray-500">
    Quickly access your counselling activities.
  </p>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

    <button
      onClick={() => navigate("/admin/counselling/my-students")}
      className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-100"
    >
      <span className="text-3xl">👨‍🎓</span>
      <div>
        <h3 className="font-semibold text-gray-800">
          My Students
        </h3>
        <p className="text-xs text-gray-500">
          View assigned students
        </p>
      </div>
    </button>

    <button
      onClick={() => navigate("/admin/counselling/requests")}
      className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4 text-left transition hover:border-purple-300 hover:bg-purple-100"
    >
      <span className="text-3xl">📋</span>
      <div>
        <h3 className="font-semibold text-gray-800">
          Counselling Requests
        </h3>
        <p className="text-xs text-gray-500">
          Manage student requests
        </p>
      </div>
    </button>

    <button
      onClick={() => navigate("/admin/counselling/appointments")}
      className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-left transition hover:border-green-300 hover:bg-green-100"
    >
      <span className="text-3xl">📅</span>
      <div>
        <h3 className="font-semibold text-gray-800">
          Appointments
        </h3>
        <p className="text-xs text-gray-500">
          Manage appointments
        </p>
      </div>
    </button>

    <button
      onClick={() => navigate("/admin/counselling/follow-ups")}
      className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 text-left transition hover:border-orange-300 hover:bg-orange-100"
    >
      <span className="text-3xl">⏰</span>
      <div>
        <h3 className="font-semibold text-gray-800">
          Follow-ups
        </h3>
        <p className="text-xs text-gray-500">
          Manage pending follow-ups
        </p>
      </div>
    </button>

  </div>
</div>


      {/* Today's Appointments */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            Today's Appointments
          </h2>
          <p className="text-sm text-gray-500">
            Your scheduled appointments for today
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Appointment Date</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Request Number</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {item.student?.name || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(item.appointmentDate)}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {item.appointmentTime || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {item.counsellingRequest?.requestNumber || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                      >
                        {item.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No appointments scheduled for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Follow-ups */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            Recent Follow-ups
          </h2>
          <p className="text-sm text-gray-500">
            Latest follow-up activities
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {recentFollowUps.length > 0 ? (
                recentFollowUps.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-800">
                      {item.title}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {item.student?.name || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(item.dueAt)}
                    </td>
                    <td className="px-5 py-4 capitalize text-gray-600">
                      {item.type || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.status)}`}
                      >
                        {item.status || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No follow-ups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboard;
