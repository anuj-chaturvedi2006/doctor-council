
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";

const API_URL = "http://localhost:2002";

const StudentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found. Please login again.");
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
        throw new Error(result.message || "Failed to fetch student details");
      }

      const foundAssignment = (result.data || []).find(
        (item) => item._id === assignmentId
      );

      if (!foundAssignment) {
        throw new Error("Student assignment not found.");
      }

      setAssignment(foundAssignment);
    } catch (err) {
      console.error("Student Details Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (assignmentId) {
    fetchStudentDetails();
  } else {
    setLoading(false);
    setError("Please select a student from My Students to view details.");
  }
}, [assignmentId]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "N/A";

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-700">
        {value || "N/A"}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <FiRefreshCw className="animate-spin text-3xl text-blue-600" />
        <p className="mt-3 text-sm text-gray-500">
          Loading student details...
        </p>
      </div>
    );
  }

 if (error || !assignment) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mx-auto max-w-md text-center">
        <FiUser className="mx-auto text-5xl text-gray-400" />

        <h2 className="mt-4 text-xl font-bold text-gray-800">
          Student Details
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error || "Student details not found."}
        </p>

        <button
          onClick={() =>
            navigate("/admin/counselling/my-students")
          }
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to My Students
        </button>
      </div>
    </div>
  );
}

  const request = assignment.counsellingRequest || {};
  const student = request.student || {};

  // Support both object and array location formats
  const locations = Array.isArray(request.preferredLocations)
    ? request.preferredLocations
    : request.preferredLocation
      ? [request.preferredLocation]
      : [];

  const entranceExams = request.entranceExams || [];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            onClick={() => navigate("/admin/counselling/my-students")}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <FiArrowLeft />
            Back to My Students
          </button>

          <h1 className="text-2xl font-bold text-gray-800">
            Student Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complete student profile and counselling request information.
          </p>
        </div>

        <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-semibold capitalize text-green-600">
          {assignment.status || "N/A"}
        </span>
      </div>

      {/* STUDENT PROFILE */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-3xl font-bold text-white">
            {student.name?.charAt(0).toUpperCase() || "S"}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {student.name || "Student"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {student.email || "N/A"}
            </p>

            <p className="mt-2 text-xs font-medium text-blue-600">
              Request ID: {request.requestNumber || "N/A"}
            </p>
          </div>

        </div>
      </div>

      {/* PERSONAL INFORMATION */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FiUser className="text-xl text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Student Name" value={student.name} />
          <InfoItem label="Email Address" value={student.email} />
          <InfoItem label="Phone Number" value={student.phone} />
        </div>
      </div>

      {/* COUNSELLING REQUEST */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FiFileText className="text-xl text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            Counselling Request
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Request Number" value={request.requestNumber} />
          <InfoItem label="Admission Level" value={request.admissionLevel} />
          <InfoItem label="Academic Year" value={request.academicYear} />
          <InfoItem label="Request Status" value={request.status} />
          <InfoItem label="Counselling Mode" value={request.counsellingMode} />
          <InfoItem label="Request Date" value={formatDate(request.createdAt)} />
        </div>
      </div>

      {/* PREFERRED LOCATION */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FiMapPin className="text-xl text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            Preferred Locations
          </h2>
        </div>

        {locations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, index) => (
              <div
                key={location._id || index}
                className="rounded-xl bg-gray-50 p-4"
              >
                <p className="font-semibold text-gray-800">
                  {location.city || "N/A"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {location.state || "N/A"}, {location.country || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            No preferred location available.
          </p>
        )}
      </div>

      {/* ENTRANCE EXAMS */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FiBookOpen className="text-xl text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            Entrance Exam Details
          </h2>
        </div>

        {entranceExams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {entranceExams.map((exam, index) => (
              <div
                key={exam._id || index}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <h3 className="mb-4 font-bold text-gray-800">
                  {exam.examName || "Entrance Exam"}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Score" value={exam.score} />
                  <InfoItem label="Percentile" value={exam.percentile} />
                  <InfoItem label="Rank" value={exam.rank} />
                  <InfoItem label="Year" value={exam.year} />
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

      {/* BUDGET */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-800">
          Budget Information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Minimum Budget"
            value={formatCurrency(request.budget?.min)}
          />
          <InfoItem
            label="Maximum Budget"
            value={formatCurrency(request.budget?.max)}
          />
          <InfoItem
            label="Currency"
            value={request.budget?.currency}
          />
        </div>
      </div>

      {/* ASSIGNMENT INFORMATION */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <FiCalendar className="text-xl text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">
            Assignment Information
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Assignment Type"
            value={assignment.assignmentType}
          />
          <InfoItem
            label="Assignment Status"
            value={assignment.status}
          />
          <InfoItem
            label="Assigned Date"
            value={formatDate(assignment.assignedAt)}
          />
          <InfoItem
            label="Assigned By"
            value={assignment.assignedBy?.name}
          />
        </div>
      </div>

    </div>
  );
};

export default StudentDetails;
