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
  FiPlus,
  FiPlay,
  FiCheckCircle,
} from "react-icons/fi";

const API_URL = "https://doctor-council.onrender.com";

const initialCreateForm = {
  appointmentId: "",
  sessionDate: "",
  startTime: "",
  endTime: "",
  meetingMode: "online",
  meetingLink: "",
  location: "",
  agenda: "",
};

const initialCompleteForm = {
  discussion: "",
  outcome: "",
  nextSteps: "",
  recommendations: "",
  nextFollowUpDate: "",
};

const CounsellingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [completeForm, setCompleteForm] = useState(initialCompleteForm);

  const getToken = () => localStorage.getItem("token");

  const fetchSessions = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please login again. Token not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_URL}/get-counselling-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSessions(response.data.data || []);
      } else {
        setSessions([]);
        setError(response.data.message || "Unable to fetch counselling sessions");
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

  const fetchAppointments = async () => {
    const token = getToken();
    if (!token) {
      setError("Please login again. Token not found.");
      return;
    }

    try {
      setAppointmentsLoading(true);
      setError("");
      // The API scopes results to the logged-in counsellor automatically.
      const response = await axios.get(`${API_URL}/get-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const available = (response.data.data || []).filter((appointment) =>
          ["scheduled", "rescheduled"].includes(appointment.status)
        );
        setAppointments(available);
      } else {
        setAppointments([]);
        setError(response.data.message || "Unable to fetch appointments");
      }
    } catch (err) {
      console.error("Fetch Appointments Error:", err);
      setAppointments([]);
      setError(
        err.response?.data?.message || "Something went wrong while fetching appointments"
      );
    } finally {
      setAppointmentsLoading(false);
    }
  };

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
        session.appointment?.appointmentNumber?.toLowerCase().includes(searchText) ||
        session.counsellingRequest?.requestNumber?.toLowerCase().includes(searchText);

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

  const toDateInput = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(parsed);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
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

  const openCreateModal = async () => {
    setError("");
    setSuccess("");
    setCreateForm(initialCreateForm);
    setShowCreateModal(true);
    await fetchAppointments();
  };

  const handleAppointmentChange = (appointmentId) => {
    const appointment = appointments.find((item) => item._id === appointmentId);
    if (!appointment) {
      setCreateForm((prev) => ({ ...prev, appointmentId }));
      return;
    }

    setCreateForm({
      appointmentId,
      sessionDate: toDateInput(appointment.appointmentDate),
      startTime: appointment.appointmentTime || "",
      endTime: "",
      meetingMode: appointment.meetingMode || "online",
      meetingLink: appointment.meetingLink || "",
      location: appointment.location || "",
      agenda: appointment.purpose || "",
    });
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError("Please login again. Token not found.");
      return;
    }

    if (!createForm.appointmentId) {
      setError("Please select an appointment.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        appointmentId: createForm.appointmentId,
        sessionDate: createForm.sessionDate,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        meetingMode: createForm.meetingMode,
        meetingLink: createForm.meetingMode === "online" ? createForm.meetingLink : "",
        location: createForm.meetingMode === "offline" ? createForm.location : "",
        agenda: createForm.agenda,
      };

      const response = await axios.post(
        `${API_URL}/create-counselling-session`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message || "Counselling session created successfully.");
        setShowCreateModal(false);
        setCreateForm(initialCreateForm);
        await fetchSessions();
      } else {
        setError(response.data.message || "Unable to create counselling session.");
      }
    } catch (err) {
      console.error("Create Session Error:", err);
      setError(err.response?.data?.message || "Something went wrong while creating session.");
    } finally {
      setSaving(false);
    }
  };

  const handleStartSession = async (session) => {
    const token = getToken();
    if (!token) {
      setError("Please login again. Token not found.");
      return;
    }

    if (!window.confirm(`Start session ${session.sessionNumber}?`)) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await axios.put(
        `${API_URL}/start-counselling-session/${session._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message || "Session started successfully.");
        await fetchSessions();
        setSelectedSession((prev) =>
          prev?._id === session._id
            ? { ...prev, ...(response.data.data || {}), status: "in_progress" }
            : prev
        );
      } else {
        setError(response.data.message || "Unable to start session.");
      }
    } catch (err) {
      console.error("Start Session Error:", err);
      setError(err.response?.data?.message || "Something went wrong while starting session.");
    } finally {
      setSaving(false);
    }
  };

  const openCompleteModal = (session) => {
    setSelectedSession(session);
    setCompleteForm({
      ...initialCompleteForm,
      nextFollowUpDate: toDateInput(session.nextFollowUpDate),
      discussion: session.discussion || "",
      outcome: session.outcome || "",
      nextSteps: session.nextSteps || "",
      recommendations: Array.isArray(session.recommendations)
        ? session.recommendations.join("\n")
        : "",
    });
    setShowCompleteModal(true);
    setError("");
    setSuccess("");
  };

  const handleCompleteSession = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    const token = getToken();
    if (!token) {
      setError("Please login again. Token not found.");
      return;
    }

    const recommendations = completeForm.recommendations
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        discussion: completeForm.discussion.trim(),
        outcome: completeForm.outcome.trim(),
        nextSteps: completeForm.nextSteps.trim(),
        recommendations,
        nextFollowUpDate: completeForm.nextFollowUpDate || null,
      };

      const response = await axios.put(
        `${API_URL}/complete-counselling-session/${selectedSession._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message || "Session completed successfully.");
        setShowCompleteModal(false);
        setSelectedSession(null);
        setCompleteForm(initialCompleteForm);
        await fetchSessions();
      } else {
        setError(response.data.message || "Unable to complete session.");
      }
    } catch (err) {
      console.error("Complete Session Error:", err);
      setError(err.response?.data?.message || "Something went wrong while completing session.");
    } finally {
      setSaving(false);
    }
  };

  const renderSessionDetails = (session) => (
    <div className="p-5 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(session.status)}`}>
          {formatStatus(session.status)}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {session.durationMinutes || 0} minutes
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FiUser /><span className="text-sm">Student</span></div>
          <p className="font-semibold text-gray-800">{session.student?.name || "N/A"}</p>
          <p className="text-sm text-gray-500 break-all">{session.student?.email || "N/A"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FiUser /><span className="text-sm">Counsellor</span></div>
          <p className="font-semibold text-gray-800">{session.counsellor?.name || "N/A"}</p>
          <p className="text-sm text-gray-500 break-all">{session.counsellor?.email || "N/A"}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FiCalendar /><span className="text-sm">Session Date</span></div>
          <p className="font-semibold text-gray-800">{formatDate(session.sessionDate)}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2"><FiClock /><span className="text-sm">Session Timing</span></div>
          <p className="font-semibold text-gray-800">{session.startTime || "N/A"} - {session.endTime || "N/A"}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-800">Related Information</h3>
        <p className="text-sm text-gray-600">Appointment: <span className="font-medium text-gray-800">{session.appointment?.appointmentNumber || "N/A"}</span></p>
        <p className="text-sm text-gray-600">Counselling Request: <span className="font-medium text-gray-800">{session.counsellingRequest?.requestNumber || "N/A"}</span></p>
        <p className="text-sm text-gray-600">Request Status: <span className="font-medium text-gray-800">{formatStatus(session.counsellingRequest?.status)}</span></p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-800">Meeting Details</h3>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          {session.meetingMode === "online" ? <FiVideo /> : <FiMapPin />}
          Mode: <span className="font-medium text-gray-800 capitalize">{session.meetingMode || "N/A"}</span>
        </p>
        {session.meetingMode === "online" && session.meetingLink && (
          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="inline-block text-blue-600 hover:underline text-sm break-all">Join Meeting</a>
        )}
        {session.meetingMode === "offline" && session.location && <p className="text-sm text-gray-700">Location: {session.location}</p>}
      </div>

      {[
        ["Agenda", session.agenda, "No agenda added."],
        ["Discussion", session.discussion, "No discussion details added."],
        ["Outcome", session.outcome, "No outcome added."],
        ["Next Steps", session.nextSteps, "No next steps added."],
      ].map(([heading, value, emptyText]) => (
        <div className="border rounded-lg p-4" key={heading}>
          <h3 className="font-semibold text-gray-800 mb-2">{heading}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{value || emptyText}</p>
        </div>
      ))}

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Recommendations</h3>
        {session.recommendations?.length ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            {session.recommendations.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
          </ul>
        ) : <p className="text-sm text-gray-500">No recommendations added.</p>}
        <p className="text-sm text-gray-600 mt-3">Next Follow-up Date: <span className="font-medium text-gray-800">{formatDate(session.nextFollowUpDate)}</span></p>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-800">Session Record</h3>
        <p className="text-sm text-gray-600">Created By: <span className="font-medium text-gray-800">{session.createdBy?.name || "N/A"}</span></p>
        <p className="text-sm text-gray-600">Started At: <span className="font-medium text-gray-800">{formatDateTime(session.startedAt)}</span></p>
        <p className="text-sm text-gray-600">Completed At: <span className="font-medium text-gray-800">{formatDateTime(session.completedAt)}</span></p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Counselling Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all counselling sessions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={openCreateModal} className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <FiPlus /> Create Session
          </button>
          <button onClick={fetchSessions} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {success && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 mb-4">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 mb-4">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: statistics.total },
          { label: "Scheduled", value: statistics.scheduled },
          { label: "In Progress", value: statistics.inProgress },
          { label: "Completed", value: statistics.completed },
          { label: "Cancelled", value: statistics.cancelled },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{item.label}</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input type="text" placeholder="Search session, student, counsellor or appointment..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

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
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">Loading counselling sessions...</td></tr>
              ) : filteredSessions.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500">No counselling sessions found.</td></tr>
              ) : filteredSessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{session.sessionNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">{session.appointment?.appointmentNumber || "N/A"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{session.student?.name || "N/A"}</p>
                    <p className="text-xs text-gray-500">{session.student?.email || ""}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{session.counsellor?.name || "N/A"}</p>
                    <p className="text-xs text-gray-500">{session.counsellor?.email || ""}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{formatDate(session.sessionDate)}</td>
                  <td className="px-5 py-4 text-gray-700">{session.durationMinutes || 0} min</td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(session.status)}`}>{formatStatus(session.status)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedSession(session)} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><FiEye /> View</button>
                      {session.status === "scheduled" && (
                        <button onClick={() => handleStartSession(session)} disabled={saving} className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 disabled:opacity-50"><FiPlay /> Start</button>
                      )}
                      {session.status === "in_progress" && (
                        <button onClick={() => openCompleteModal(session)} className="inline-flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"><FiCheckCircle /> Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t text-sm text-gray-500">Showing {filteredSessions.length} of {sessions.length} sessions</div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-lg font-bold text-gray-800">Create Counselling Session</h2><p className="text-sm text-gray-500">Select a scheduled appointment</p></div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment *</label>
                <select required value={createForm.appointmentId} onChange={(e) => handleAppointmentChange(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">{appointmentsLoading ? "Loading appointments..." : "Select appointment"}</option>
                  {appointments.map((appointment) => (
                    <option key={appointment._id} value={appointment._id}>
                      {appointment.appointmentNumber} — {appointment.student?.name || "Student"} ({formatDate(appointment.appointmentDate)} {appointment.appointmentTime || ""})
                    </option>
                  ))}
                </select>
                {!appointmentsLoading && appointments.length === 0 && <p className="text-xs text-amber-600 mt-1">No scheduled or rescheduled appointments available.</p>}
              </div>

              {createForm.appointmentId && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                  {(() => {
                    const appointment = appointments.find((item) => item._id === createForm.appointmentId);
                    return appointment ? (
                      <>
                        <p><strong>Student:</strong> {appointment.student?.name || "N/A"}</p>
                        <p><strong>Counselling Request:</strong> {appointment.counsellingRequest?.requestNumber || "N/A"}</p>
                        <p><strong>Appointment Status:</strong> {formatStatus(appointment.status)}</p>
                      </>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Session Date *</label><input type="date" required value={createForm.sessionDate} onChange={(e) => setCreateForm({ ...createForm, sessionDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label><input type="time" value={createForm.startTime} onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Time</label><input type="time" value={createForm.endTime} onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Mode *</label>
                <select value={createForm.meetingMode} onChange={(e) => setCreateForm({ ...createForm, meetingMode: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                  <option value="online">Online</option><option value="offline">Offline</option>
                </select>
              </div>
              {createForm.meetingMode === "online" ? (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label><input type="url" value={createForm.meetingLink} onChange={(e) => setCreateForm({ ...createForm, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." className="w-full border rounded-lg px-3 py-2" /></div>
              ) : (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Location *</label><input required value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} placeholder="Enter meeting location" className="w-full border rounded-lg px-3 py-2" /></div>
              )}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label><textarea rows="3" value={createForm.agenda} onChange={(e) => setCreateForm({ ...createForm, agenda: e.target.value })} placeholder="Enter session agenda" className="w-full border rounded-lg px-3 py-2" /></div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || appointmentsLoading || !appointments.length} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Creating..." : "Create Session"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompleteModal && selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-lg font-bold text-gray-800">Complete Counselling Session</h2><p className="text-sm text-gray-500">{selectedSession.sessionNumber}</p></div>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleCompleteSession} className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Discussion *</label><textarea required rows="3" value={completeForm.discussion} onChange={(e) => setCompleteForm({ ...completeForm, discussion: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="What was discussed during the session?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Outcome *</label><textarea required rows="3" value={completeForm.outcome} onChange={(e) => setCompleteForm({ ...completeForm, outcome: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Enter session outcome" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Next Steps</label><textarea rows="3" value={completeForm.nextSteps} onChange={(e) => setCompleteForm({ ...completeForm, nextSteps: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="What should the student do next?" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label><textarea rows="3" value={completeForm.recommendations} onChange={(e) => setCompleteForm({ ...completeForm, recommendations: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder={"Enter one recommendation per line"} /><p className="text-xs text-gray-500 mt-1">Har recommendation alag line mein likho.</p></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label><input type="date" value={completeForm.nextFollowUpDate} onChange={(e) => setCompleteForm({ ...completeForm, nextFollowUpDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCompleteModal(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{saving ? "Completing..." : "Complete Session"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSession && !showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
              <div><h2 className="text-lg font-bold text-gray-800">Session Details</h2><p className="text-sm text-gray-500">{selectedSession.sessionNumber}</p></div>
              <button onClick={() => setSelectedSession(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><FiX size={20} /></button>
            </div>
            {renderSessionDetails(selectedSession)}
            <div className="border-t px-5 py-4 flex justify-end gap-2">
              {selectedSession.status === "scheduled" && <button onClick={() => handleStartSession(selectedSession)} disabled={saving} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50">Start Session</button>}
              {selectedSession.status === "in_progress" && <button onClick={() => openCompleteModal(selectedSession)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Complete Session</button>}
              <button onClick={() => setSelectedSession(null)} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellingSessions;
