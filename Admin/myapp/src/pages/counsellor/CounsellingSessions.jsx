
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiSearch,
  FiEye,
  FiX,
  FiCalendar,
  FiClock,
  FiUser,
  FiVideo,
  FiMapPin,
  FiBookOpen,
} from "react-icons/fi";

const API_URL = "https://doctor-council.onrender.com";

const CounsellingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchSessions = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again. Token not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/get-counselling-sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSessions(response.data.data || []);
      } else {
        setSessions([]);
        setError(
          response.data.message || "Unable to fetch counselling sessions"
        );
      }
    } catch (err) {
      console.error("Fetch Counselling Sessions Error:", err);
      setSessions([]);
      setError(
        err.response?.data?.message ||
          "Something went wrong while fetching sessions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        session.sessionNumber?.toLowerCase().includes(searchText) ||
        session.student?.name?.toLowerCase().includes(searchText) ||
        session.student?.email?.toLowerCase().includes(searchText) ||
        session.counsellor?.name?.toLowerCase().includes(searchText) ||
        session.appointment?.appointmentNumber
          ?.toLowerCase()
          .includes(searchText) ||
        session.counsellingRequest?.requestNumber
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" || session.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const statistics = {
    total: sessions.length,
    scheduled: sessions.filter((s) => s.status === "scheduled").length,
    inProgress: sessions.filter((s) => s.status === "in_progress").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    cancelled: sessions.filter((s) => s.status === "cancelled").length,
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Counselling Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all counselling sessions
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: statistics.total, color: "blue" },
          { label: "Scheduled", value: statistics.scheduled, color: "indigo" },
          {
            label: "In Progress",
            value: statistics.inProgress,
            color: "yellow",
          },
          { label: "Completed", value: statistics.completed, color: "green" },
          { label: "Cancelled", value: statistics.cancelled, color: "red" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search session, student, counsellor or appointment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Session Date</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Loading counselling sessions...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No counselling sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {session.sessionNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.appointment?.appointmentNumber || "N/A"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {session.student?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.student?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {session.counsellor?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.counsellor?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {formatDate(session.sessionDate)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {session.durationMinutes || 0} min
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          session.status
                        )}`}
                      >
                        {formatStatus(session.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedSession(session)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <FiEye />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t text-sm text-gray-500">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Session Details
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedSession.sessionNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedSession(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Status and Duration */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                    selectedSession.status
                  )}`}
                >
                  {formatStatus(selectedSession.status)}
                </span>

                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {selectedSession.durationMinutes || 0} minutes
                </span>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FiUser />
                    <span className="text-sm">Student</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {selectedSession.student?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 break-all">
                    {selectedSession.student?.email || "N/A"}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FiUser />
                    <span className="text-sm">Counsellor</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {selectedSession.counsellor?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 break-all">
                    {selectedSession.counsellor?.email || "N/A"}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FiCalendar />
                    <span className="text-sm">Session Date</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatDate(selectedSession.sessionDate)}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FiClock />
                    <span className="text-sm">Session Timing</span>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {selectedSession.startTime || "N/A"} -{" "}
                    {selectedSession.endTime || "N/A"}
                  </p>
                </div>
              </div>

              {/* Appointment and Request */}
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-800">
                  Related Information
                </h3>
                <p className="text-sm text-gray-600">
                  Appointment:{" "}
                  <span className="font-medium text-gray-800">
                    {selectedSession.appointment?.appointmentNumber || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Counselling Request:{" "}
                  <span className="font-medium text-gray-800">
                    {selectedSession.counsellingRequest?.requestNumber ||
                      "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Request Status:{" "}
                  <span className="font-medium text-gray-800">
                    {formatStatus(selectedSession.counsellingRequest?.status)}
                  </span>
                </p>
              </div>

              {/* Meeting Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">
                  Meeting Details
                </h3>

                <p className="text-sm text-gray-600 flex items-center gap-2">
                  {selectedSession.meetingMode === "online" ? (
                    <FiVideo />
                  ) : (
                    <FiMapPin />
                  )}
                  Mode:{" "}
                  <span className="font-medium text-gray-800 capitalize">
                    {selectedSession.meetingMode || "N/A"}
                  </span>
                </p>

                {selectedSession.meetingMode === "online" &&
                  selectedSession.meetingLink && (
                    <a
                      href={selectedSession.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-blue-600 hover:underline text-sm break-all"
                    >
                      Join Meeting
                    </a>
                  )}

                {selectedSession.meetingMode === "offline" &&
                  selectedSession.location && (
                    <p className="text-sm text-gray-700">
                      Location: {selectedSession.location}
                    </p>
                  )}
              </div>

              {/* Agenda */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                  <FiBookOpen />
                  Agenda
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedSession.agenda || "No agenda added."}
                </p>
              </div>

              {/* Discussion */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Discussion
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedSession.discussion || "No discussion details added."}
                </p>
              </div>

              {/* Outcome */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Outcome
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedSession.outcome || "No outcome added."}
                </p>
              </div>

              {/* Next Steps */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Next Steps
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedSession.nextSteps || "No next steps added."}
                </p>
              </div>

              {/* Audit Details */}
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-800">
                  Session Record
                </h3>
                <p className="text-sm text-gray-600">
                  Created By:{" "}
                  <span className="font-medium text-gray-800">
                    {selectedSession.createdBy?.name || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Started At:{" "}
                  <span className="font-medium text-gray-800">
                    {formatDateTime(selectedSession.startedAt)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Completed At:{" "}
                  <span className="font-medium text-gray-800">
                    {formatDateTime(selectedSession.completedAt)}
                  </span>
                </p>
              </div>
            </div>

            <div className="border-t px-5 py-4 flex justify-end">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellingSessions;
