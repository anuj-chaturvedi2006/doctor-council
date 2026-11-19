"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FiSearch,
  FiRefreshCw,
  FiBookOpen,
  FiMapPin,
  FiMail,
  FiPhone,
  FiCheck,
  FiX,
  FiColumns,
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiEye,
} from "react-icons/fi";

const API = "http://localhost:2002";
const MAX_COMPARE = 3;

/* ---------- Helpers ---------- */

const isEmpty = (v) => v === null || v === undefined || v === "";

const isIsoDate = (v) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}(T|$)/.test(v) &&
  !isNaN(Date.parse(v));

const formatDate = (v) =>
  new Date(v).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Generic value -> readable string
const getValue = (value) => {
  if (isEmpty(value)) return "";

  if (Array.isArray(value)) {
    return value.map(getValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.label ||
      value.email ||
      Object.values(value).map(getValue).filter(Boolean).join(", ")
    );
  }

  return String(value);
};

// Address ko proper format mein dikhane ke liye
const formatAddress = (college) => {
  const raw = college.address || college.location || college.city;

  if (isEmpty(raw)) return "";

  if (typeof raw === "string") {
    const extra = [college.city, college.state, college.pincode]
      .filter(
        (x) =>
          !isEmpty(x) && !raw.toLowerCase().includes(String(x).toLowerCase())
      )
      .join(", ");
    return extra ? `${raw}, ${extra}` : raw;
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const parts = [
      raw.line1 || raw.addressLine1 || raw.street,
      raw.line2 || raw.addressLine2,
      raw.area || raw.landmark,
      raw.city || raw.district,
      raw.state,
      raw.country,
      raw.pincode || raw.pinCode || raw.zip || raw.postalCode,
    ];

    const clean = parts.filter((p) => !isEmpty(p));

    return clean.length
      ? clean.join(", ")
      : Object.values(raw).map(getValue).filter(Boolean).join(", ");
  }

  return getValue(raw);
};

const getCollegeName = (college) =>
  college.name ||
  college.collegeName ||
  college.instituteName ||
  college.title ||
  "College";

// Image ka URL nikalo (backend ke alag-alag field names handle karta hai)
const getImage = (college) => {
  let img =
    college.image ||
    college.logo ||
    college.banner ||
    college.photo ||
    college.thumbnail ||
    college.coverImage ||
    (Array.isArray(college.images) ? college.images[0] : "");

  if (img && typeof img === "object") img = img.url || img.secure_url || "";
  if (!img) return "";
  if (/^(https?:)?\/\//.test(img) || img.startsWith("data:")) return img;
  return `${API}/${String(img).replace(/^\/+/, "")}`;
};

const getDescription = (college) =>
  getValue(
    college.description ||
      college.about ||
      college.overview ||
      college.shortDescription ||
      ""
  );

const getCardDate = (college) => {
  const d = college.createdAt || college.established || college.establishedYear;
  if (isEmpty(d)) return "";
  return isIsoDate(d) ? formatDate(d) : String(d);
};

const getTags = (college) =>
  [
    college.city,
    college.state,
    college.type || college.collegeType || college.category,
    college.university || college.affiliation,
  ]
    .map((t) => getValue(t))
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i);

// Compare table mein jo keys alag se dikhti hain unhe "other rows" se hatane ke liye
const HIDDEN_KEYS = ["_id", "__v", "password"];
const NAME_KEYS = ["name", "collegeName", "instituteName", "title"];
const CONTACT_KEYS = ["email", "contactEmail", "phone", "contactNumber"];
const ADDRESS_KEYS = [
  "address",
  "location",
  "city",
  "state",
  "pincode",
  "pinCode",
  "zip",
  "country",
];
const MEDIA_KEYS = [
  "image",
  "logo",
  "banner",
  "photo",
  "thumbnail",
  "coverImage",
  "images",
];
const SKIP_IN_COMPARE = [
  ...HIDDEN_KEYS,
  ...NAME_KEYS,
  ...CONTACT_KEYS,
  ...ADDRESS_KEYS,
  ...MEDIA_KEYS,
];

// Difference check karne ke liye text version
const cellText = (value) => {
  if (isEmpty(value)) return "";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (isIsoDate(value)) return formatDate(value).toLowerCase();
  return getValue(value).trim().toLowerCase();
};

/* ---------- College Card ---------- */


/* ---------- College Card ---------- */

const CollegeCard = ({ college, isSelected, onToggle }) => {
  const [imgError, setImgError] = useState(false);

  const name = getCollegeName(college);
  const image = getImage(college);
  const description = getDescription(college);
  const email = getValue(college.email || college.contactEmail);
  const phone = getValue(college.phone || college.contactNumber);
  const address = formatAddress(college);
  const date = getCardDate(college);
  const tags = getTags(college);
  const hasImage = image && !imgError;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isSelected
          ? "border-blue-600 ring-2 ring-blue-600"
          : "border-slate-200 shadow-sm hover:border-blue-200"
      }`}
    >
      {/* College Image */}
      <div className="relative h-48 overflow-hidden border-b border-slate-100 bg-slate-50">
        {hasImage ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-5xl font-bold uppercase text-white">
              {name.charAt(0)}
            </div>
          </div>
        )}

        {/* Compare Button */}
        <button
          onClick={onToggle}
          className={`absolute right-4 top-4 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-md transition ${
            isSelected
              ? "bg-blue-900 text-white"
              : "bg-white text-slate-700 hover:bg-blue-50"
          }`}
        >
          {isSelected ? (
            <FiCheck size={14} />
          ) : (
            <FiColumns size={14} />
          )}
          {isSelected ? "Added" : "Compare"}
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-6">

        {/* College Name */}
        <div className="mb-3">
          {tags[0] && (
            <span className="mb-2 inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {tags[0]}
            </span>
          )}

          <h3
            title={name}
            className="line-clamp-2 min-h-[56px] text-xl font-bold leading-7 text-slate-900 transition-colors group-hover:text-blue-800"
          >
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="mb-5 line-clamp-2 min-h-[44px] text-sm leading-6 text-slate-500">
          {description || "Explore college information, admission details and available facilities."}
        </p>

        {/* College Information */}
        <div className="space-y-3">

          {/* Location */}
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
              <FiMapPin size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-400">College Location</p>
              <p
                title={address}
                className="mt-1 line-clamp-2 break-words text-sm font-semibold text-slate-800"
              >
                {address || "Address not available"}
              </p>
            </div>
          </div>

          {/* Email */}
          {email && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <FiMail size={16} />
              </div>
              <a
                href={`mailto:${email}`}
                title={email}
                className="truncate text-sm text-slate-600 transition hover:text-blue-800"
              >
                {email}
              </a>
            </div>
          )}

          {/* Phone */}
          {phone && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
                <FiPhone size={16} />
              </div>
              <a
                href={`tel:${phone}`}
                className="text-sm font-medium text-slate-600 transition hover:text-blue-800"
              >
                {phone}
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {tags.slice(1, 4).map((tag, index) => (
              <span
                key={index}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* View Details */}
        <div className="mt-auto pt-6">
          <Link
            href={`/college/${college._id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            View College Details
            <FiArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
        <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <FiCalendar size={14} />
          {date || "Date not available"}
        </span>

        <span className="text-xs font-semibold text-blue-900">
          College
        </span>
      </div>
    </article>
  );
};


/* ---------- Compare table cell ---------- */

const CompareCell = ({ value }) => {
  if (isEmpty(value) || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-sm text-gray-300">N/A</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          value ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (isIsoDate(value)) {
    return (
      <span className="text-sm font-medium text-gray-800">
        {formatDate(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span
            key={i}
            className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {getValue(v)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([k, v]) => !HIDDEN_KEYS.includes(k) && !isEmpty(v)
    );
    if (!entries.length) {
      return <span className="text-sm text-gray-300">N/A</span>;
    }
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <p key={k} className="text-sm">
            <span className="text-gray-500">{formatLabel(k)}: </span>
            <span className="break-words font-medium text-gray-800">
              {getValue(v)}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return (
    <span className="break-words text-sm font-medium text-gray-800">
      {String(value)}
    </span>
  );
};

/* ---------- Compare Modal ---------- */

const CompareModal = ({ colleges, onClose, onRemove }) => {
  const [onlyDiff, setOnlyDiff] = useState(false);

  // Escape se band karo + background scroll lock
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Agar 2 se kam college bache to modal band
  useEffect(() => {
    if (colleges.length < 2) onClose();
  }, [colleges.length, onClose]);

  const rows = useMemo(() => {
    const basic = [
      { label: "Email", get: (c) => getValue(c.email || c.contactEmail) },
      { label: "Phone", get: (c) => getValue(c.phone || c.contactNumber) },
      { label: "Address", get: (c) => formatAddress(c) },
    ];

    const keys = [];
    colleges.forEach((c) =>
      Object.keys(c).forEach((k) => {
        if (!SKIP_IN_COMPARE.includes(k) && !keys.includes(k)) keys.push(k);
      })
    );

    const others = keys.map((k) => ({
      label: formatLabel(k),
      get: (c) => c[k],
    }));

    return [...basic, ...others].map((row) => {
      const values = colleges.map((c) => row.get(c));
      const texts = values.map(cellText);
      return { ...row, values, differs: new Set(texts).size > 1 };
    });
  }, [colleges]);

  const diffCount = rows.filter((r) => r.differs).length;
  const visibleRows = onlyDiff ? rows.filter((r) => r.differs) : rows;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1e2f6b] sm:text-xl">
              <FiColumns className="text-blue-600" />
              Compare Colleges
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {colleges.length} colleges &bull; {diffCount} differences found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={onlyDiff}
                onChange={(e) => setOnlyDiff(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Only differences
            </label>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 w-36 min-w-[9rem] border-b border-r border-gray-200 bg-gray-50 p-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Field
                </th>

                {colleges.map((c) => {
                  const name = getCollegeName(c);
                  return (
                    <th
                      key={c._id}
                      className="sticky top-0 z-10 min-w-[220px] border-b border-r border-gray-200 bg-gradient-to-r from-[#1e2f6b] to-blue-700 p-4 text-left align-top last:border-r-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg font-bold uppercase text-white">
                          {name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-bold leading-snug text-white">
                            {name}
                          </p>
                          <Link
                            href={`/college/${c._id}`}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-blue-100 hover:text-white hover:underline"
                          >
                            <FiEye size={12} />
                            Details
                          </Link>
                        </div>

                        <button
                          onClick={() => onRemove(c._id)}
                          title="Remove from comparison"
                          className="rounded-md p-1 text-blue-100 transition hover:bg-white/20 hover:text-white"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={colleges.length + 1}
                    className="p-10 text-center text-sm text-gray-500"
                  >
                    Koi difference nahi mila. Sab fields same hain.
                  </td>
                </tr>
              )}

              {visibleRows.map((row) => (
                <tr
                  key={row.label}
                  className={row.differs ? "bg-amber-50/60" : "bg-white"}
                >
                  <td
                    className={`sticky left-0 z-10 border-b border-r border-gray-200 p-4 align-top text-xs font-semibold uppercase tracking-wide text-gray-500 ${
                      row.differs ? "bg-amber-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {row.differs && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                      )}
                      {row.label}
                    </div>
                  </td>

                  {row.values.map((val, i) => (
                    <td
                      key={colleges[i]._id}
                      className="border-b border-r border-gray-200 p-4 align-top last:border-r-0"
                    >
                      <CompareCell value={val} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

export default function College() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Compare states
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/get-colleges`);

      if (response.data.status) {
        setColleges(response.data.colleges || []);
      } else {
        setColleges([]);
        setError(response.data.message || "College data not found");
      }
    } catch (err) {
      console.error("College fetch error:", err);
      setError(
        err.response?.data?.message ||
          "College data load nahi hua. Login token aur permission check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // Notice 2.5 sec baad hat jaye
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      return;
    }
    if (selectedIds.length >= MAX_COMPARE) {
      setNotice(`Ek saath sirf ${MAX_COMPARE} colleges compare ho sakte hain.`);
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const removeSelected = (id) =>
    setSelectedIds((prev) => prev.filter((x) => x !== id));

  const clearSelected = () => {
    setSelectedIds([]);
    setShowCompare(false);
  };

  // Selected colleges (search se independent)
  const selectedColleges = selectedIds
    .map((id) => colleges.find((c) => c._id === id))
    .filter(Boolean);

  const filteredColleges = colleges.filter((college) => {
    const searchText = search.trim().toLowerCase();
    if (!searchText) return true;

    return Object.entries(college).some(([key, value]) => {
      if (["_id", "__v", "password"].includes(key)) return false;
      return (
        key.toLowerCase().includes(searchText) ||
        getValue(value).toLowerCase().includes(searchText)
      );
    });
  });

  return (
    <div
      className={`min-h-screen bg-slate-50 p-4 sm:p-6 ${
        selectedColleges.length > 0 ? "pb-32" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1e2f6b] sm:text-3xl">
            Colleges
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View all registered colleges and compare them side by side
          </p>
        </div>

        <button
          onClick={fetchColleges}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#1e2f6b] px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search college name, email, city..."
            className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {filteredColleges.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">{colleges.length}</span>{" "}
          colleges
          <span className="ml-2 text-gray-400">
            &bull; Compare ke liye {MAX_COMPARE} tak colleges select karo
          </span>
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm">
          <FiRefreshCw className="mx-auto animate-spin text-3xl text-blue-600" />
          <p className="mt-3 text-gray-500">Loading colleges...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="font-medium text-red-600">{error}</p>
          <button
            onClick={fetchColleges}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* College Cards */}
      {!loading && !error && filteredColleges.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredColleges.map((college) => (
            <CollegeCard
              key={college._id}
              college={college}
              isSelected={selectedIds.includes(college._id)}
              onToggle={() => toggleSelect(college._id)}
            />
          ))}
        </div>
      )}

      {/* No Data */}
      {!loading && !error && filteredColleges.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
          <FiBookOpen className="mx-auto text-4xl text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-700">
            No colleges found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {search
              ? "Try a different search term."
              : "No college records are available."}
          </p>
        </div>
      )}

      {/* Max limit notice */}
      {notice && (
        <div className="fixed left-1/2 top-5 z-40 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <FiAlertCircle className="text-amber-400" />
          {notice}
        </div>
      )}

      {/* Floating compare bar */}
      {selectedColleges.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur sm:p-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Compare ({selectedColleges.length}/{MAX_COMPARE}):
              </span>

              {selectedColleges.map((c) => (
                <span
                  key={c._id}
                  className="flex max-w-[200px] items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-blue-700"
                >
                  <span className="truncate">{getCollegeName(c)}</span>
                  <button
                    onClick={() => removeSelected(c._id)}
                    className="rounded-full p-0.5 transition hover:bg-blue-200"
                    aria-label="Remove"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearSelected}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Clear
              </button>

              <button
                onClick={() => setShowCompare(true)}
                disabled={selectedColleges.length < 2}
                className="flex items-center gap-2 rounded-lg bg-[#1e2f6b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <FiColumns size={16} />
                {selectedColleges.length < 2 ? "Select 1 more" : "Compare Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && selectedColleges.length >= 2 && (
        <CompareModal
          colleges={selectedColleges}
          onClose={() => setShowCompare(false)}
          onRemove={removeSelected}
        />
      )}
    </div>
  );
}