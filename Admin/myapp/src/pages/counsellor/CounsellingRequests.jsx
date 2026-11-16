import React, { useEffect, useState } from "react";
import { FiRefreshCw, FiEye, FiSearch, FiX } from "react-icons/fi";

const API_URL = "http://localhost:2002";

const CounsellingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignRequest, setAssignRequest] = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [counsellorLoading, setCounsellorLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [startLoadingId, setStartLoadingId] = useState(null);

  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [recommendationRequest, setRecommendationRequest] = useState(null);

  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  

  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [counsellorNote, setCounsellorNote] = useState("");

  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationSaving, setRecommendationSaving] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const roleName =
    typeof loggedInUser.role === "object"
      ? loggedInUser.role?.roleName
      : loggedInUser.role;

  const normalizedRole = (roleName || "").toLowerCase().replace(/[\s_-]/g, "");

  const toggleCollege = (id) => {
    setSelectedColleges((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleCourse = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found");
      }

      // Counsellor ke liye My Assignments API
      if (normalizedRole === "counsellor") {
        const response = await fetch(`${API_URL}/counsellor/my-assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch my assignments");
        }

        const assignmentData = result.data || [];

        // Assignment se counselling request nikalna
        setAssignments(assignmentData);

        setRequests(
          assignmentData
            .map((assignment) => assignment.counsellingRequest)
            .filter(Boolean),
        );

        return;
      }

      // Admin / SuperAdmin ke liye all requests API
      if (!["admin", "superadmin"].includes(normalizedRole)) {
        throw new Error("You are not authorized to view counselling requests");
      }

      const query = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (status) {
        query.append("status", status);
      }

      const response = await fetch(
        `${API_URL}/counsellingrequests?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch counselling requests",
        );
      }

      setRequests(result.data || []);
    } catch (err) {
      console.error("Counselling Requests Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      setAssignError("");
      setCounsellorLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/get-counsellors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch counsellors");
      }

      setCounsellors(result.data || []);
    } catch (error) {
      setAssignError(error.message);
    } finally {
      setCounsellorLoading(false);
    }
  };
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:2002/get-counselling-assignments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        setAssignments(result.data);
      }
    } catch (error) {
      console.error("Fetch assignments error:", error);
    }
  };
  const openAssignModal = (request) => {
    setAssignRequest(request);
    setSelectedCounsellorId("");
    setAssignError("");
    setShowAssignModal(true);
    fetchCounsellors();
  };

  const handleAssignCounsellor = async () => {
    try {
      if (!assignRequest?._id) {
        setAssignError("Counselling request not found");
        return;
      }

      if (!selectedCounsellorId) {
        setAssignError("Please select a counsellor");
        return;
      }

      setAssignLoading(true);
      setAssignError("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/assign-counsellor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          counsellingRequestId: assignRequest._id,
          counsellorId: selectedCounsellorId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to assign counsellor");
      }

      alert(result.message);

      setShowAssignModal(false);
      setAssignRequest(null);
      setSelectedCounsellorId("");

      await fetchRequests();
      await fetchAssignments();
    } catch (error) {
      console.error("Assign Counsellor Error:", error);
      setAssignError(error.message || "Something went wrong");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleStartCounselling = async (requestId) => {
    try {
      setStartLoadingId(requestId);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/start-counselling/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to start counselling");
      }

      // Update table status
      setRequests((prevRequests) =>
        prevRequests.map((item) =>
          item._id === requestId ? { ...item, status: "in_progress" } : item,
        ),
      );

      // Update View Details modal if open
      setSelectedRequest((prev) =>
        prev?._id === requestId ? { ...prev, status: "in_progress" } : prev,
      );

      alert(result.message);
    } catch (error) {
      console.error("Start Counselling Error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setStartLoadingId(null);
    }
  };

  
const openRecommendationModal = async (request) => {
  try {
    setRecommendationError("");
    setRecommendationRequest(request);
    setSelectedColleges([]);
    setSelectedCourses([]);
    setCounsellorNote("");
    setShowRecommendationModal(true);
    setRecommendationLoading(true);

    const token = localStorage.getItem("token");

    const [collegeResponse, courseResponse] = await Promise.all([
      fetch(`${API_URL}/get-colleges`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),

      fetch(`${API_URL}/get-courses-for-recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const collegeResult = await collegeResponse.json();
    const courseResult = await courseResponse.json();

    // College API uses status: true
    if (!collegeResponse.ok || !collegeResult.status) {
      throw new Error(
        collegeResult.message || "Failed to fetch colleges"
      );
    }

    // Course API uses success: true
    if (!courseResponse.ok || !courseResult.success) {
      throw new Error(
        courseResult.message || "Failed to fetch courses"
      );
    }

    setColleges(collegeResult.colleges || []);
    setCourses(courseResult.courses || []);

  } catch (error) {
    console.error("Recommendation Fetch Error:", error);
    setRecommendationError(error.message);
  } finally {
    setRecommendationLoading(false);
  }
};

  

  const handleShareRecommendations = async () => {
    try {
      if (!recommendationRequest?._id) {
        throw new Error("Counselling request not found");
      }

      if (selectedColleges.length === 0 && selectedCourses.length === 0) {
        throw new Error("Please select at least one college or course");
      }

      setRecommendationSaving(true);
      setRecommendationError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/share-recommendations/${recommendationRequest._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            colleges: selectedColleges,
            courses: selectedCourses,
            counsellorNote,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to share recommendations");
      }

      // Update table
      setRequests((prev) =>
        prev.map((item) =>
          item._id === recommendationRequest._id
            ? {
                ...item,
                ...result.data,
              }
            : item,
        ),
      );

      // Update details modal if open
      setSelectedRequest((prev) =>
        prev?._id === recommendationRequest._id
          ? {
              ...prev,
              ...result.data,
            }
          : prev,
      );

      setShowRecommendationModal(false);
      setRecommendationRequest(null);

      alert(result.message);
    } catch (error) {
      console.error("Share Recommendations Error:", error);
      setRecommendationError(error.message);
    } finally {
      setRecommendationSaving(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAssignments();
  }, [status]);

  const filteredRequests = requests.filter((item) => {
    const studentName = item.student?.name || "";
    const requestNumber = item.requestNumber || "";
    const email = item.student?.email || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      studentName.toLowerCase().includes(searchText) ||
      requestNumber.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText);

    const matchesStatus = !status || item.status === status;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statusColor = (value) => {
    const colors = {
      new: "bg-blue-100 text-blue-700",
      assigned: "bg-purple-100 text-purple-700",
      contact_pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-indigo-100 text-indigo-700",
      recommendations_shared: "bg-cyan-100 text-cyan-700",
      converted: "bg-green-100 text-green-700",
      closed: "bg-gray-200 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return colors[value] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Counselling Requests
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and view all student counselling requests.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search student, email or request number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="contact_pending">Contact Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="recommendations_shared">Recommendations Shared</option>
          <option value="converted">Converted</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Request Number</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Admission Level</th>
                <th className="px-5 py-4">Courses</th>
                <th className="px-5 py-4">Assigned Counsellor</th>
                <th className="px-5 py-4">Budget</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-gray-500">
                    <FiRefreshCw className="mx-auto mb-2 animate-spin text-2xl text-blue-600" />
                    Loading counselling requests...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-gray-500">
                    No counselling requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((item) => {
                  const assignment = assignments.find(
                    (a) => a.counsellingRequest?._id === item._id,
                  );

                  return (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-blue-600">
                        {item.requestNumber}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {item.student?.name || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.student?.email || "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item.admissionLevel || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item.preferredCourses?.length
                          ? item.preferredCourses
                              .map((course) => course.name || "N/A")
                              .join(", ")
                          : "N/A"}
                      </td>

                      {/* Assigned Counsellor */}
                      <td className="px-5 py-4">
                        {assignment?.counsellor ? (
                          <div>
                            <p className="font-semibold text-gray-800">
                              {assignment.counsellor.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {assignment.counsellor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatCurrency(
                          item.budget?.min,
                          item.budget?.currency,
                        )}
                        {" - "}
                        {formatCurrency(
                          item.budget?.max,
                          item.budget?.currency,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="capitalize text-gray-700">
                          {item.priority || "normal"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(item.status)}`}
                        >
                          {(item.status || "N/A").replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedRequest(item)}
                          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          <FiEye />
                          View
                        </button>

                        {normalizedRole === "counsellor" &&
                          item.status === "assigned" && (
                            <button
                              onClick={() => handleStartCounselling(item._id)}
                              disabled={startLoadingId === item._id}
                              className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 hover:bg-green-100 disabled:opacity-50"
                            >
                              {startLoadingId === item._id
                                ? "Starting..."
                                : "Start Counselling"}
                            </button>
                          )}
                        {normalizedRole === "counsellor" &&
                          item.status === "in_progress" && (
                            <button
                              onClick={() => openRecommendationModal(item)}
                              className="mt-2 flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                            >
                              Share Recommendations
                            </button>
                          )}

                        {["admin", "superadmin"].includes(normalizedRole) && (
                          <button
                            onClick={() => openAssignModal(item)}
                            className="mt-2 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 hover:bg-green-100"
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredRequests.length} of {requests.length} requests
      </p>

      {/* VIEW DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Request Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedRequest.requestNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Student Name</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.student?.name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.student?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.student?.phone || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Academic Year</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.academicYear || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Admission Level</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.admissionLevel || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Counselling Mode</p>
                <p className="mt-1 font-semibold capitalize text-gray-800">
                  {selectedRequest.counsellingMode || "N/A"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Preferred Streams</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.preferredStreams
                    ?.map((stream) => stream.name || "N/A")
                    .join(", ") || "N/A"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Preferred Courses</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedRequest.preferredCourses
                    ?.map((course) => course.name || "N/A")
                    .join(", ") || "N/A"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Preferred Locations</p>
                <div className="mt-1 space-y-1">
                  {selectedRequest.preferredLocations?.length ? (
                    selectedRequest.preferredLocations.map(
                      (location, index) => (
                        <p key={index} className="font-semibold text-gray-800">
                          {[location.city, location.state, location.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ),
                    )
                  ) : (
                    <p className="font-semibold text-gray-800">N/A</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400">Minimum Budget</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {formatCurrency(
                    selectedRequest.budget?.min,
                    selectedRequest.budget?.currency,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Maximum Budget</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {formatCurrency(
                    selectedRequest.budget?.max,
                    selectedRequest.budget?.currency,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Priority</p>
                <p className="mt-1 font-semibold capitalize text-gray-800">
                  {selectedRequest.priority || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Status</p>
                <p className="mt-1 font-semibold capitalize text-gray-800">
                  {(selectedRequest.status || "N/A").replaceAll("_", " ")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Created Date</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
            </div>

            <div className="border-t p-5 text-right">
              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN COUNSELLOR MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Assign Counsellor
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Request: {assignRequest?.requestNumber}
                </p>
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Student Name
                </label>

                <input
                  type="text"
                  value={assignRequest?.student?.name || "N/A"}
                  readOnly
                  className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Select Counsellor
                </label>

                <select
                  value={selectedCounsellorId}
                  onChange={(e) => setSelectedCounsellorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Choose Counsellor</option>

                  {counsellorLoading ? (
                    <option disabled>Loading counsellors...</option>
                  ) : (
                    counsellors.map((counsellor) => (
                      <option key={counsellor._id} value={counsellor._id}>
                        {counsellor.name} - {counsellor.email}
                      </option>
                    ))
                  )}
                </select>

                {counsellors.length === 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    No counsellors found.
                  </p>
                )}
              </div>

              {assignError && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {assignError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t p-5">
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignCounsellor}
                disabled={assignLoading || !selectedCounsellorId}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignLoading ? "Assigning..." : "Assign Counsellor"}
              </button>
            </div>
          </div>
        </div>
      )}
 

 {/* SHARE RECOMMENDATIONS MODAL */}
{showRecommendationModal && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Share Recommendations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Request: {recommendationRequest?.requestNumber}
          </p>
        </div>

        <button
          onClick={() => setShowRecommendationModal(false)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-5 p-5">

        {recommendationLoading ? (
          <p className="py-8 text-center text-gray-500">
            Loading colleges and courses...
          </p>
        ) : (
          <>
            {/* Colleges */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Recommended Colleges
              </label>

              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">

                {colleges.length > 0 ? (
                  colleges.map((college) => (
                    <label
                      key={college._id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColleges.includes(college._id)}
                        onChange={() => toggleCollege(college._id)}
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-gray-700">
                        {college.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No colleges found.
                  </p>
                )}

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Selected Colleges: {selectedColleges.length}
              </p>
            </div>

            {/* Courses */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Select Recommended Courses
              </label>

              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">

                {courses.length > 0 ? (
                  courses.map((course) => (
                    <label
                      key={course._id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course._id)}
                        onChange={() => toggleCourse(course._id)}
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-gray-700">
                        {course.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No courses found.
                  </p>
                )}

              </div>

              <p className="mt-1 text-xs text-gray-500">
                Selected Courses: {selectedCourses.length}
              </p>
            </div>

            {/* Counsellor Note */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Counsellor Note
              </label>

              <textarea
                rows="4"
                value={counsellorNote}
                onChange={(e) => setCounsellorNote(e.target.value)}
                placeholder="Write recommendations for the student..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}

        {recommendationError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {recommendationError}
          </p>
        )}

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t p-5">

        <button
          onClick={() => setShowRecommendationModal(false)}
          className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>

        <button
          onClick={handleShareRecommendations}
          disabled={
            recommendationLoading ||
            recommendationSaving ||
            (selectedColleges.length === 0 &&
              selectedCourses.length === 0)
          }
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {recommendationSaving
            ? "Sharing..."
            : "Share Recommendations"}
        </button>

      </div>
    </div>
  </div>
)}
      
    </div>
  );
};

export default CounsellingRequests;
