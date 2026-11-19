
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiBookOpen,
  FiSearch,
  FiRefreshCw,
  FiClock,
  FiAward,
  FiLayers,
  FiX,
} from "react-icons/fi";

const API = "https://doctor-council.onrender.com";

interface Course {
  _id: string;
  name: string;
  slug?: string;
  code?: string;
  description?: string;
  stream?: string | { name?: string };
  degree?: string | { name?: string };
  duration?: {
    value?: number;
    unit?: string;
  };
  eligibility?: {
    minimumPercentage?: number;
    requiredSubjects?: string[];
    requiredQualification?: string;
  };
  entranceExams?: string[];
  status?: string;
}

export default function Student() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch Courses
 
const fetchCourses = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await axios.get(
      `${API}/get-course`
    );

    if (response.data.success) {
      setCourses(response.data.courses || []);
    } else {
      setCourses([]);
      setError("Courses fetch nahi ho paye.");
    }
  } catch (err: unknown) {
    console.error("Fetch courses error:", err);

    if (axios.isAxiosError(err)) {
      setError(
        err.response?.data?.message ||
          "Server se connect nahi ho pa raha hai."
      );
    } else {
      setError("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle populated or non-populated stream/degree
  const getRelationName = (
    value?: string | { name?: string }
  ): string => {
    if (!value) return "Not specified";

    if (typeof value === "object") {
      return value.name || "Not specified";
    }

    return value;
  };

  // Search Courses
  const filteredCourses = courses.filter((course) => {
    const searchText = search.trim().toLowerCase();

    return (
      course.name?.toLowerCase().includes(searchText) ||
      course.code?.toLowerCase().includes(searchText) ||
      getRelationName(course.stream).toLowerCase().includes(searchText) ||
      getRelationName(course.degree).toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-teal-600">
              Explore Programs
            </p>

            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Explore Our Courses
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Discover the right course for your future. Explore programs,
              eligibility requirements and course details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCourses}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh Courses
          </button>
        </div>

        {/* Search and Count */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course, code, stream or degree..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
            />
          </div>

          <p className="text-sm font-medium text-slate-600">
            Total Courses:{" "}
            <span className="font-bold text-teal-700">
              {filteredCourses.length}
            </span>
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white py-20 text-center shadow-sm">
            <FiRefreshCw
              className="mx-auto mb-4 animate-spin text-teal-600"
              size={35}
            />
            <p className="font-medium text-slate-600">
              Loading courses...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>

            <button
              onClick={fetchCourses}
              className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
            <FiBookOpen size={45} className="mx-auto mb-4 text-slate-300" />

            <h2 className="text-xl font-bold text-slate-800">
              {courses.length === 0
                ? "No Courses Available"
                : "No Matching Courses"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {courses.length === 0
                ? "Courses will appear here when available."
                : "Try searching with another course name or code."}
            </p>
          </div>
        )}

        {/* Course Cards */}
          
  
{/* Course Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredCourses.map((course) => (
    <div
      key={course._id}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <FiBookOpen size={24} />
          </div>

          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              course.status?.toLowerCase() === "active"
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {course.status || "Available"}
          </span>
        </div>

        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
          {course.code || "COURSE"}
        </p>

        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
          {course.name}
        </h3>

        <p className="text-sm text-slate-500 leading-6 line-clamp-2 min-h-[48px]">
          {course.description || "Explore course details and admission information."}
        </p>
      </div>

      {/* Course Information */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <FiLayers size={15} />
              <span className="text-xs">Stream</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {getRelationName(course.stream) || "N/A"}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <FiAward size={15} />
              <span className="text-xs">Degree</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {getRelationName(course.degree) || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 py-3 border-y border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <FiClock size={17} />
            <span className="text-sm">Duration</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">
            {course.duration?.value
              ? `${course.duration.value} ${course.duration.unit || ""}`
              : "N/A"}
          </span>
        </div>

        {/* Eligibility */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Eligibility
          </p>
          <p className="text-sm text-slate-700">
            {course.eligibility?.minimumPercentage
              ? `Minimum ${course.eligibility.minimumPercentage}% marks`
              : "As per admission criteria"}
          </p>
        </div>

        {/* Entrance Exams */}
        {course.entranceExams && course.entranceExams.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Entrance Exams
            </p>
            <div className="flex flex-wrap gap-2">
              {course.entranceExams.slice(0, 3).map((exam, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
                >
                  {exam}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <button
          onClick={() => setSelectedCourse(course)}
          className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold transition-all"
        >
          View Course Details
          <span>→</span>
        </button>
      </div>
    </div>
  ))}
</div>



      </div>

      {/* ================================== */}
      {/* Course Details Popup */}
      {/* ================================== */}

      {selectedCourse && (
        <div
          onClick={() => setSelectedCourse(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Popup Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-teal-600 to-blue-700 px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Course Details
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedCourse.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
                aria-label="Close popup"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Popup Body */}
            <div className="space-y-6 p-6">
              <div>
                <p className="text-sm leading-6 text-slate-600">
                  {selectedCourse.description || "No description available."}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    selectedCourse.status?.toLowerCase() === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {selectedCourse.status || "Available"}
                </span>
              </div>

              {/* Course Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Course Code</p>
                  <p className="mt-1 font-bold text-slate-800">
                    {selectedCourse.code || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Duration</p>
                  <p className="mt-1 font-bold text-slate-800">
                    {selectedCourse.duration?.value
                      ? `${selectedCourse.duration.value} ${selectedCourse.duration.unit || ""}`
                      : "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Stream</p>
                  <p className="mt-1 font-bold text-slate-800">
                    {getRelationName(selectedCourse.stream)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Degree</p>
                  <p className="mt-1 font-bold text-slate-800">
                    {getRelationName(selectedCourse.degree)}
                  </p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="mb-4 text-lg font-bold text-slate-800">
                  Eligibility Requirements
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Required Qualification
                    </p>
                    <p className="font-semibold text-slate-700">
                      {selectedCourse.eligibility?.requiredQualification ||
                        "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Minimum Percentage
                    </p>
                    <p className="font-semibold text-slate-700">
                      {selectedCourse.eligibility?.minimumPercentage !== undefined
                        ? `${selectedCourse.eligibility.minimumPercentage}%`
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Required Subjects
                    </p>
                    <p className="font-semibold text-slate-700">
                      {selectedCourse.eligibility?.requiredSubjects?.join(", ") ||
                        "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Entrance Exams */}
              <div>
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  Entrance Exams
                </h3>

                {selectedCourse.entranceExams &&
                selectedCourse.entranceExams.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.entranceExams.map((exam, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
                      >
                        {exam}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No entrance exam specified.
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
