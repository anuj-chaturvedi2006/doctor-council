
import React, { useCallback, useEffect, useState } from "react";
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
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const API_URL = "https://doctor-council.onrender.com";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
 const [rescheduleHistory, setRescheduleHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);
const [historyError, setHistoryError] = useState("");

  // New Appointment modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [createError, setCreateError] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({
    counsellingRequestId: "",
    appointmentDate: "",
    appointmentTime: "",
    meetingMode: "online",
    meetingLink: "",
    location: "",
    purpose: "",
    notes: "",
  });
  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/get-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAppointments(response.data.data || []);
      } else {
        setError(
          response.data.message || "Unable to fetch appointments"
        );
      }
    } catch (err) {
      console.error("Fetch Appointments Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to fetch appointments"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Fetch active assigned students for the New Appointment dropdown
  const fetchAvailableStudents = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCreateError("Please login again.");
      return;
    }

    try {
      setStudentsLoading(true);
      setCreateError("");

      const response = await axios.get(
        `${API_URL}/get-available-appointment-students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAvailableStudents(response.data.data || []);
      } else {
        setCreateError(response.data.message || "Unable to load assigned students.");
      }
    } catch (err) {
      console.error("Available Appointment Students Error:", err);
      setCreateError(
        err.response?.data?.message || "Unable to load assigned students."
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  const openCreateAppointment = () => {
    setAppointmentForm({
      counsellingRequestId: "",
      appointmentDate: "",
      appointmentTime: "",
      meetingMode: "online",
      meetingLink: "",
      location: "",
      purpose: "",
      notes: "",
    });
    setCreateError("");
    setShowCreateModal(true);
    fetchAvailableStudents();
  };

  const handleAppointmentFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setCreateError("Please login again.");
      return;
    }

    if (!appointmentForm.counsellingRequestId) {
      setCreateError("Please select a student and counselling request.");
      return;
    }

    if (appointmentForm.meetingMode === "online" && !appointmentForm.meetingLink.trim()) {
      setCreateError("Please enter the online meeting link.");
      return;
    }

    if (appointmentForm.meetingMode === "offline" && !appointmentForm.location.trim()) {
      setCreateError("Please enter the meeting location.");
      return;
    }

    const payload = {
      counsellingRequestId: appointmentForm.counsellingRequestId,
      appointmentDate: appointmentForm.appointmentDate,
      appointmentTime: appointmentForm.appointmentTime,
      meetingMode: appointmentForm.meetingMode,
      meetingLink: appointmentForm.meetingMode === "online" ? appointmentForm.meetingLink.trim() : "",
      location: appointmentForm.meetingMode === "offline" ? appointmentForm.location.trim() : "",
      purpose: appointmentForm.purpose.trim(),
      notes: appointmentForm.notes.trim(),
    };

    try {
      setCreatingAppointment(true);
      setCreateError("");

      const response = await axios.post(
        `${API_URL}/create-appointment`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(response.data.message || "Appointment created successfully.");
        setShowCreateModal(false);
        await fetchAppointments();
      } else {
        setCreateError(response.data.message || "Unable to create appointment.");
      }
    } catch (err) {
      console.error("Create Appointment Error:", err);
      setCreateError(
        err.response?.data?.message || "Unable to create appointment."
      );
    } finally {
      setCreatingAppointment(false);
    }
  };

  // Update Appointment Status
  const updateAppointmentStatus = async (id, status) => {
    const action = status === "completed" ? "complete" : "cancel";

    if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setUpdatingId(id);

      const response = await axios.put(
        `${API_URL}/update-appointment-status/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        setSelectedAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      console.error("Update Appointment Error:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search and Status Filter
  const filteredAppointments = appointments.filter((appointment) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      appointment.appointmentNumber?.toLowerCase().includes(searchText) ||
      appointment.student?.name?.toLowerCase().includes(searchText) ||
      appointment.student?.email?.toLowerCase().includes(searchText) ||
      appointment.counsellor?.name?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Fetch Reschedule History
const fetchRescheduleHistory = async (appointmentId) => {
  const token = localStorage.getItem("token");

  try {
    setHistoryLoading(true);
    setHistoryError("");
    setRescheduleHistory([]);

    const response = await axios.get(
      `${API_URL}/appointment-reschedule-history/${appointmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setRescheduleHistory(response.data.data || []);
    } else {
      setHistoryError(
        response.data.message || "Unable to fetch history"
      );
    }
  } catch (err) {
    console.error("Reschedule History Error:", err);
    setHistoryError(
      err.response?.data?.message || "Unable to fetch history"
    );
  } finally {
    setHistoryLoading(false);
  }
};

// Open Appointment Details
const openAppointmentDetails = (appointment) => {
  setSelectedAppointment(appointment);
  fetchRescheduleHistory(appointment._id);
};

  // Format Date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  };

  // Status Badge
  const getStatusClass = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "rescheduled":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage student counselling appointments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={openCreateAppointment}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700"
          >
            + New Appointment
          </button>
          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Total Appointments</p>
          <h2 className="text-2xl font-bold mt-2 text-slate-800">
            {appointments.length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Scheduled</p>
          <h2 className="text-2xl font-bold mt-2 text-blue-600">
            {appointments.filter((a) => a.status === "scheduled").length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {appointments.filter((a) => a.status === "completed").length}
          </h2>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-slate-500">Cancelled</p>
          <h2 className="text-2xl font-bold mt-2 text-red-600">
            {appointments.filter((a) => a.status === "cancelled").length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3.5 text-slate-400" />

            <input
              type="text"
              placeholder="Search appointment, student or counsellor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Appointment Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No appointments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-4">Appointment</th>
                  <th className="text-left px-5 py-4">Student</th>
                  <th className="text-left px-5 py-4">Counsellor</th>
                  <th className="text-left px-5 py-4">Date & Time</th>
                  <th className="text-left px-5 py-4">Mode</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-center px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {appointment.appointmentNumber}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {appointment.student?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {appointment.student?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {appointment.counsellor?.name || "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {appointment.counsellor?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p>{formatDate(appointment.appointmentDate)}</p>
                      <p className="text-xs text-slate-500">
                        {appointment.appointmentTime}
                      </p>
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {appointment.meetingMode}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openAppointmentDetails(appointment)}
                          title="View Details"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <FiEye size={17} />
                        </button>

                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "completed"
                                )
                              }
                              disabled={updatingId === appointment._id}
                              title="Mark Completed"
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50"
                            >
                              <FiCheckCircle size={17} />
                            </button>

                            <button
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "cancelled"
                                )
                              }
                              disabled={updatingId === appointment._id}
                              title="Cancel Appointment"
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              <FiXCircle size={17} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Create New Appointment</h2>
                <p className="text-sm text-slate-500 mt-1">Select an assigned student and enter appointment details.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-5 space-y-5">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Student / Counselling Request <span className="text-red-500">*</span>
                </label>
                <select
                  name="counsellingRequestId"
                  value={appointmentForm.counsellingRequestId}
                  onChange={handleAppointmentFormChange}
                  required
                  disabled={studentsLoading}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  <option value="">
                    {studentsLoading ? "Loading assigned students..." : "Select student / request"}
                  </option>
                  {availableStudents.map((item) => (
                    <option key={item.assignmentId} value={item.counsellingRequestId}>
                      {item.student?.name || "Student"} — {item.requestNumber} — {item.admissionLevel} — {item.counsellor?.name || "Counsellor"}
                    </option>
                  ))}
                </select>
                {!studentsLoading && availableStudents.length === 0 && !createError && (
                  <p className="text-xs text-amber-600 mt-2">No active assigned counselling requests found.</p>
                )}
                <p className="text-xs text-slate-500 mt-2">Admin/Superadmin can view all active assignments; counsellors can view their own assignments.</p>
              </div>

              {appointmentForm.counsellingRequestId && (() => {
                const selectedRequest = availableStudents.find(
                  (item) => item.counsellingRequestId === appointmentForm.counsellingRequestId
                );
                if (!selectedRequest) return null;
                return (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><p className="text-slate-500">Student</p><p className="font-semibold text-slate-800">{selectedRequest.student?.name || "N/A"}</p></div>
                    <div><p className="text-slate-500">Email</p><p className="font-semibold text-slate-800 break-all">{selectedRequest.student?.email || "N/A"}</p></div>
                    <div><p className="text-slate-500">Request Number</p><p className="font-semibold text-slate-800">{selectedRequest.requestNumber}</p></div>
                    <div><p className="text-slate-500">Assigned Counsellor</p><p className="font-semibold text-slate-800">{selectedRequest.counsellor?.name || "N/A"}</p></div>
                    <div><p className="text-slate-500">Admission Level</p><p className="font-semibold text-slate-800">{selectedRequest.admissionLevel || "N/A"}</p></div>
                    <div><p className="text-slate-500">Academic Year</p><p className="font-semibold text-slate-800">{selectedRequest.academicYear || "N/A"}</p></div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={appointmentForm.appointmentDate}
                    onChange={handleAppointmentFormChange}
                    min={new Date().toLocaleDateString("en-CA")}
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Appointment Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={appointmentForm.appointmentTime}
                    onChange={handleAppointmentFormChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Mode *</label>
                <select
                  name="meetingMode"
                  value={appointmentForm.meetingMode}
                  onChange={handleAppointmentFormChange}
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {appointmentForm.meetingMode === "online" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Link *</label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={appointmentForm.meetingLink}
                    onChange={handleAppointmentFormChange}
                    placeholder="https://meet.google.com/..."
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={appointmentForm.location}
                    onChange={handleAppointmentFormChange}
                    placeholder="Enter meeting address"
                    required
                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose</label>
                <input
                  type="text"
                  name="purpose"
                  value={appointmentForm.purpose}
                  onChange={handleAppointmentFormChange}
                  placeholder="e.g. Career and college counselling"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={appointmentForm.notes}
                  onChange={handleAppointmentFormChange}
                  rows={3}
                  placeholder="Additional instructions (optional)"
                  className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 border rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAppointment || studentsLoading || availableStudents.length === 0}
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {creatingAppointment ? "Creating..." : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Appointment Details
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedAppointment.appointmentNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <FiX size={22} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Status</span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                    selectedAppointment.status
                  )}`}
                >
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Student Name
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedAppointment.student?.name || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedAppointment.student?.email || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Counsellor
                  </p>
                  <p className="font-semibold text-slate-800">
                    {selectedAppointment.counsellor?.name || "N/A"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedAppointment.counsellor?.email || ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    <FiCalendar className="inline mr-1" />
                    Appointment Date
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedAppointment.appointmentDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    <FiClock className="inline mr-1" />
                    Appointment Time
                  </p>
                  <p className="font-medium">
                    {selectedAppointment.appointmentTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    <FiVideo className="inline mr-1" />
                    Meeting Mode
                  </p>
                  <p className="font-medium capitalize">
                    {selectedAppointment.meetingMode}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Purpose
                  </p>
                  <p className="font-medium">
                    {selectedAppointment.purpose || "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-slate-500 mb-1">
                  Counselling Request
                </p>
                <p className="font-medium">
                  {selectedAppointment.counsellingRequest?.requestNumber || "N/A"}
                </p>
              </div>

              {selectedAppointment.meetingMode === "online" &&
                selectedAppointment.meetingLink && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-blue-800 mb-2">
                      Online Meeting Link
                    </p>
                    <a
                      href={selectedAppointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {selectedAppointment.meetingLink}
                    </a>
                  </div>
                )}

              {selectedAppointment.meetingMode === "offline" && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Meeting Location
                  </p>
                  <p>{selectedAppointment.location || "Not provided"}</p>
                </div>
              )}

              {/* Reschedule History */}
<div className="border-t pt-5">
  <div className="flex items-center gap-2 mb-4">
    <FiClock className="text-blue-600" size={20} />

    <h3 className="text-lg font-bold text-slate-800">
      Reschedule History
    </h3>

    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
      {rescheduleHistory.length}
    </span>
  </div>

  {historyLoading ? (
    <p className="text-sm text-slate-500 py-4">
      Loading reschedule history...
    </p>
  ) : historyError ? (
    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
      {historyError}
    </p>
  ) : rescheduleHistory.length === 0 ? (
    <div className="bg-slate-50 border rounded-lg p-4 text-center">
      <FiCalendar className="mx-auto text-slate-400 mb-2" size={24} />

      <p className="text-sm font-medium text-slate-600">
        No reschedule history found.
      </p>

      <p className="text-xs text-slate-400 mt-1">
        This appointment has not been rescheduled yet.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {rescheduleHistory.map((history, index) => (
        <div
          key={history._id || index}
          className="border border-slate-200 rounded-xl p-4 bg-slate-50"
        >
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-slate-800">
              Previous Schedule #{index + 1}
            </p>

            <span className="text-xs text-slate-500">
              {history.rescheduledAt
                ? new Date(history.rescheduledAt).toLocaleString(
                    "en-IN",
                    { timeZone: "Asia/Kolkata" }
                  )
                : "N/A"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">
                Previous Date
              </p>
              <p className="font-medium text-slate-800">
                {formatDate(history.oldAppointmentDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Previous Time
              </p>
              <p className="font-medium text-slate-800">
                {history.oldAppointmentTime || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Previous Meeting Mode
              </p>
              <p className="font-medium capitalize text-slate-800">
                {history.oldMeetingMode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Rescheduled By
              </p>
              <p className="font-medium text-slate-800">
                {history.rescheduledBy?.name || "N/A"}
              </p>
              {history.rescheduledBy?.email && (
                <p className="text-xs text-slate-500">
                  {history.rescheduledBy.email}
                </p>
              )}
            </div>
          </div>

          {history.oldMeetingMode === "online" &&
            history.oldMeetingLink && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">
                  Previous Meeting Link
                </p>
                <a
                  href={history.oldMeetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline break-all"
                >
                  {history.oldMeetingLink}
                </a>
              </div>
            )}

          {history.oldMeetingMode === "offline" &&
            history.oldLocation && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 mb-1">
                  Previous Location
                </p>
                <p className="text-sm text-slate-800">
                  {history.oldLocation}
                </p>
              </div>
            )}
        </div>
      ))}
    </div>
  )}
</div>

              {selectedAppointment.status === "scheduled" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                  <button
                    onClick={() =>
                      updateAppointmentStatus(
                        selectedAppointment._id,
                        "completed"
                      )
                    }
                    disabled={updatingId === selectedAppointment._id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Mark Completed
                  </button>

                  <button
                    onClick={() =>
                      updateAppointmentStatus(
                        selectedAppointment._id,
                        "cancelled"
                      )
                    }
                    disabled={updatingId === selectedAppointment._id}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
