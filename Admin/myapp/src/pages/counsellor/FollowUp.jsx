
import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiEdit,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";

const API_URL = "https://doctor-council.onrender.com";

const FollowUp = () => {
  const [followUps, setFollowUps] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    counsellingRequest: "",
    title: "",
    description: "",
    dueAt: "",
    type: "call",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch follow-ups
  const fetchFollowUps = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/get-follow-ups`, {
        headers,
      });

      const result = await response.json();

      if (result.success) {
        setFollowUps(result.data || []);
      } else {
        alert(result.message || "Unable to fetch follow-ups");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while fetching follow-ups");
    } finally {
      setLoading(false);
    }
  };

  // Fetch counsellor's assigned requests
  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/counsellor/my-assignments`,
        { headers }
      );

      const result = await response.json();

      if (result.success) {
        const assignedRequests = (result.data || [])
          .map((item) => item.counsellingRequest)
          .filter(Boolean);

        setRequests(assignedRequests);
      } else {
        alert(result.message || "Unable to fetch assigned requests");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    fetchRequests();
  }, []);

  const resetForm = () => {
    setForm({
      counsellingRequest: "",
      title: "",
      description: "",
      dueAt: "",
      type: "call",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const openCreateModal = () => {
    setForm({
      counsellingRequest: "",
      title: "",
      description: "",
      dueAt: "",
      type: "call",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      counsellingRequest: item.counsellingRequest?._id || "",
      title: item.title || "",
      description: item.description || "",
      dueAt: item.dueAt
        ? new Date(item.dueAt).toISOString().slice(0, 16)
        : "",
      type: item.type || "call",
    });

    setEditingId(item._id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update follow-up
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.dueAt) {
      alert("Please fill all required fields");
      return;
    }

    if (!editingId && !form.counsellingRequest) {
      alert("Please select a counselling request");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description,
        dueAt: new Date(form.dueAt).toISOString(),
        type: form.type,
      };

      if (!editingId) {
        payload.counsellingRequest = form.counsellingRequest;
      }

      const url = editingId
        ? `${API_URL}/update-follow-up/${editingId}`
        : `${API_URL}/create-follow-up`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        resetForm();
        fetchFollowUps();
      } else {
        alert(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  // Complete follow-up
  const handleComplete = async (id) => {
    const outcome = window.prompt(
      "Enter follow-up outcome:"
    );

    if (outcome === null) return;

    try {
      const response = await fetch(
        `${API_URL}/complete-follow-up/${id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ outcome }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        fetchFollowUps();
      } else {
        alert(result.message || "Unable to complete follow-up");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };

    return classes[status] || "bg-gray-100 text-gray-700";
  };

  const filteredFollowUps = followUps.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchText) ||
      item.student?.name?.toLowerCase().includes(searchText) ||
      item.counsellingRequest?.requestNumber
        ?.toLowerCase()
        .includes(searchText);

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Follow-ups
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your assigned student follow-ups
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchFollowUps}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-100"
          >
            <FiRefreshCw /> Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Create Follow-up
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Follow-ups</p>
          <h2 className="text-2xl font-bold mt-1">
            {followUps.length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-600 mt-1">
            {followUps.filter((x) => x.status === "pending").length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Overdue</p>
          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {followUps.filter((x) => x.status === "overdue").length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search title, student or request number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Request Number</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Due Date</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-8">
                  Loading follow-ups...
                </td>
              </tr>
            ) : filteredFollowUps.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-8 text-gray-500">
                  No follow-ups found
                </td>
              </tr>
            ) : (
              filteredFollowUps.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4 font-medium">
                    {item.student?.name || "N/A"}
                  </td>
                  <td className="p-4">
                    {item.counsellingRequest?.requestNumber || "N/A"}
                  </td>
                  <td className="p-4">{item.title}</td>
                  <td className="p-4">
                    {item.dueAt
                      ? new Date(item.dueAt).toLocaleString("en-IN")
                      : "N/A"}
                  </td>
                  <td className="p-4 capitalize">{item.type}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <FiEdit />
                          </button>

                          <button
                            onClick={() => handleComplete(item._id)}
                            title="Complete"
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                          >
                            <FiCheckCircle />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Follow-up" : "Create Follow-up"}
              </h2>

              <button onClick={resetForm}>
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Counselling Request *
                  </label>

                  <select
                    name="counsellingRequest"
                    value={form.counsellingRequest}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Request</option>

                    {requests.map((request) => (
                      <option key={request._id} value={request._id}>
                        {request.requestNumber} -{" "}
                        {request.student?.name || "Student"}
                      </option>
                    ))}
                  </select>

                  {requests.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No active assigned requests found.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Follow-up Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter follow-up title"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter description"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="dueAt"
                  value={form.dueAt}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Follow-up Type
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="document">Document</option>
                  <option value="appointment">Appointment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Follow-up"
                    : "Create Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;
