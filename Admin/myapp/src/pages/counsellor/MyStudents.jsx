
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiX,
  FiUsers,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiBookOpen,
} from "react-icons/fi";

const API_URL = "https://doctor-council.onrender.com";

const MyStudents = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
const navigate = useNavigate();
  // Fetch assigned students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login token not found. Please login again.");
        setAssignments([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/counsellor/my-assignments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch students"
        );
      }

      setAssignments(result.data || []);

    } catch (err) {
      console.error("Fetch Students Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Load data on page open
  useEffect(() => {
    fetchStudents();
  }, []);

  // Search functionality
  const filteredAssignments = assignments.filter((assignment) => {
    const request = assignment.counsellingRequest || {};
    const student = request.student || {};

    const searchText = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(searchText) ||
      student.email?.toLowerCase().includes(searchText) ||
      student.phone?.toLowerCase().includes(searchText) ||
      request.requestNumber?.toLowerCase().includes(searchText)
    );
  });

  // Date format
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Students
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your assigned students and counselling requests.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>

      </div>

      {/* SUMMARY CARD */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Assigned Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-800">
                {assignments.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiUsers size={23} />
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Active Assignments
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {assignments.filter(
                  (item) => item.status === "active"
                ).length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiBookOpen size={23} />
            </div>

          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Search Results
              </p>

              <h2 className="mt-2 text-3xl font-bold text-purple-600">
                {filteredAssignments.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FiSearch size={23} />
            </div>

          </div>
        </div>

      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* STUDENT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* TABLE HEADER */}
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Assigned Students
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              List of students assigned to you
            </p>
          </div>

          {/* SEARCH */}
          <div className="relative w-full sm:max-w-[320px]">

            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />

          </div>

        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead className="bg-gray-50">
              <tr className="text-xs uppercase tracking-wider text-gray-500">

                <th className="px-6 py-4 font-semibold">
                  Student
                </th>

                <th className="px-6 py-4 font-semibold">
                  Contact
                </th>

                <th className="px-6 py-4 font-semibold">
                  Admission
                </th>

                <th className="px-6 py-4 font-semibold">
                  Request Date
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-center font-semibold">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <FiRefreshCw className="mx-auto animate-spin text-2xl text-blue-600" />
                    <p className="mt-3 text-sm text-gray-500">
                      Loading students...
                    </p>
                  </td>
                </tr>

              ) : filteredAssignments.length === 0 ? (

                <tr>
                  <td colSpan="6" className="py-16 text-center">

                    <FiUsers className="mx-auto text-4xl text-gray-300" />

                    <p className="mt-3 font-medium text-gray-600">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Assigned students will appear here.
                    </p>

                  </td>
                </tr>

              ) : (

                filteredAssignments.map((assignment) => {
                  const request = assignment.counsellingRequest || {};
                  const student = request.student || {};

                  return (
                    <tr
                      key={assignment._id}
                      className="transition hover:bg-blue-50/40"
                    >

                      {/* STUDENT */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-600">
                            {student.name?.charAt(0).toUpperCase() || "S"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {student.name || "N/A"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {request.requestNumber || "N/A"}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4">

                        <p className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail className="text-gray-400" />
                          {student.email || "N/A"}
                        </p>

                        <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <FiPhone className="text-gray-400" />
                          {student.phone || "N/A"}
                        </p>

                      </td>

                      {/* ADMISSION */}
                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-gray-700">
                          {request.admissionLevel || "N/A"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {request.academicYear || "N/A"}
                        </p>

                      </td>

                      {/* REQUEST DATE */}
                      <td className="px-6 py-4">

                        <p className="text-sm text-gray-600">
                          {formatDate(request.createdAt)}
                        </p>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-600">
                          {assignment.status || "N/A"}
                        </span>

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-center">

                        <button
  onClick={() =>
   navigate(`/admin/counselling/student-details/${assignment._id}`)
  }
  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
>
  <FiEye size={15} />
  View Details
</button>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}
        <div className="border-t border-gray-100 px-6 py-4">

          <p className="text-xs text-gray-500">
            Showing {filteredAssignments.length} of {assignments.length} assigned students
          </p>

        </div>

      </div>

      {/* STUDENT DETAILS MODAL */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {(() => {
              const request = selectedStudent.counsellingRequest || {};
              const student = request.student || {};

              return (
                <>

                  {/* MODAL HEADER */}
                  <div className="flex items-center justify-between border-b border-gray-100 p-6">

                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Student Details
                      </h2>

                      <p className="mt-1 text-sm text-gray-400">
                        {request.requestNumber || "N/A"}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
                    >
                      <FiX size={19} />
                    </button>

                  </div>

                  {/* STUDENT INFORMATION */}
                  <div className="space-y-6 p-6">

                    <div className="flex items-center gap-4 rounded-xl bg-blue-50 p-4">

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                        {student.name?.charAt(0).toUpperCase() || "S"}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {student.name || "N/A"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {student.email || "N/A"}
                        </p>
                      </div>

                    </div>

                    {/* PERSONAL DETAILS */}
                    <div>
                      <h3 className="mb-4 font-semibold text-gray-800">
                        Personal Information
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {student.phone || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="mt-1 break-all text-sm font-medium text-gray-700">
                            {student.email || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Admission Level</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {request.admissionLevel || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Academic Year</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {request.academicYear || "N/A"}
                          </p>
                        </div>

                      </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* LOCATION */}
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-800">
                        Preferred Location
                      </h3>

                      {request.preferredLocations?.length > 0 ? (
                        request.preferredLocations.map((location) => (
                          <p
                            key={location._id}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <FiMapPin className="text-blue-500" />
                            {location.city}, {location.state}, {location.country}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">N/A</p>
                      )}
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* ENTRANCE EXAMS */}
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-800">
                        Entrance Exams
                      </h3>

                      {request.entranceExams?.length > 0 ? (
                        <div className="space-y-3">

                          {request.entranceExams.map((exam) => (
                            <div
                              key={exam._id}
                              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                            >

                              <p className="font-semibold text-gray-800">
                                {exam.examName}
                              </p>

                              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                <div>
                                  <p className="text-xs text-gray-400">Score</p>
                                  <p className="mt-1 text-sm font-medium">
                                    {exam.score ?? "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Percentile</p>
                                  <p className="mt-1 text-sm font-medium">
                                    {exam.percentile ?? "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Rank</p>
                                  <p className="mt-1 text-sm font-medium">
                                    {exam.rank ?? "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-gray-400">Year</p>
                                  <p className="mt-1 text-sm font-medium">
                                    {exam.year ?? "N/A"}
                                  </p>
                                </div>

                              </div>

                            </div>
                          ))}

                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          No entrance exam details available.
                        </p>
                      )}
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* BUDGET AND COUNSELLING */}
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-800">
                        Counselling Information
                      </h3>

                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <p className="text-xs text-gray-400">Minimum Budget</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {request.budget?.min != null
                              ? `₹${request.budget.min.toLocaleString("en-IN")}`
                              : "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Maximum Budget</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {request.budget?.max != null
                              ? `₹${request.budget.max.toLocaleString("en-IN")}`
                              : "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Counselling Mode</p>
                          <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                            {request.counsellingMode || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Request Status</p>
                          <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                            {request.status || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Assigned Date</p>
                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {new Date(selectedStudent.assignedAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Assignment Type</p>
                          <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                            {selectedStudent.assignmentType || "N/A"}
                          </p>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* MODAL FOOTER */}
                  <div className="flex justify-end border-t border-gray-100 p-5">

                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                    >
                      Close
                    </button>

                  </div>

                </>
              );
            })()}

          </div>

        </div>
      )}

    </div>
  );
};

export default MyStudents;
