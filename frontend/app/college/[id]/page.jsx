"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCopy,
  FiCheck,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";

const API = "http://localhost:2002";

/* ---------- Helpers ---------- */

const isEmpty = (v) => v === null || v === undefined || v === "";

const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

const isIsoDate = (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}(T|$)/.test(v) && !isNaN(Date.parse(v));

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

// Simple text version of any value (email / phone / address ke liye)
const getText = (value) => {
  if (isEmpty(value)) return "";
  if (Array.isArray(value)) return value.map(getText).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.label ||
      value.email ||
      Object.values(value).map(getText).filter(Boolean).join(", ")
    );
  }
  return String(value);
};

const getCollegeName = (item) =>
  item?.name ||
  item?.collegeName ||
  item?.instituteName ||
  item?.title ||
  "College";

// Address ko proper format mein dikhane ke liye
const formatAddress = (college) => {
  const raw = college.address || college.location || college.city;
  if (isEmpty(raw)) return "";

  if (typeof raw === "string") {
    const extra = [college.city, college.state, college.pincode, college.country]
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
    ].filter((p) => !isEmpty(p));

    return parts.length ? parts.join(", ") : getText(raw);
  }

  return getText(raw);
};

// In keys ko "Other Information" mein dobara nahi dikhana
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

/* ---------- Value renderer ---------- */

const ValueView = ({ value }) => {
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

  if (isUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="break-all text-sm font-medium text-blue-600 hover:underline"
      >
        {value}
      </a>
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
    const allPrimitive = value.every((v) => typeof v !== "object" || v === null);
    if (allPrimitive) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((v, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
            <ValueView value={v} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(
      ([k, v]) => !HIDDEN_KEYS.includes(k) && !isEmpty(v)
    );
    if (!entries.length) return <span className="text-sm text-gray-300">N/A</span>;

    return (
      <dl className="space-y-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-wrap gap-x-2 text-sm">
            <dt className="text-gray-500">{formatLabel(k)}:</dt>
            <dd className="min-w-0 break-words font-medium text-gray-800">
              <ValueView value={v} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <span className="break-words text-sm font-medium text-gray-800">
      {String(value)}
    </span>
  );
};

/* ---------- Small components ---------- */

const ContactCard = ({ icon: Icon, label, children, empty, className = "" }) => (
  <div
    className={`flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <Icon size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {empty ? (
        <p className="mt-1 text-sm text-gray-300">N/A</p>
      ) : (
        <div className="mt-1">{children}</div>
      )}
    </div>
  </div>
);

/* ---------- Page ---------- */

export default function CollegeDetails() {
  const params = useParams();
  const id = params.id;

  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
console.log("college detail>>>>>>>>>>>>>>>>",college);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API}/get-college/${id}`);

        if (response.data.status) {
          setCollege(response.data.college);
        } else {
          setCollege(null);
          setError(response.data.message || "College not found.");
        }
      } catch (err) {
        console.error("College details error:", err);
        setCollege(null);
        setError(
          err.response?.data?.message || "College details load nahi hui."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCollege();
  }, [id]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(college._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiRefreshCw size={32} className="mx-auto animate-spin text-blue-600" />
          <p className="mt-3 text-gray-600">Loading college details...</p>
        </div>
      </div>
    );
  }

  /* Error */
  if (error || !college) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <FiAlertCircle size={28} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-gray-800">
            {error || "College not found"}
          </h2>
          <Link
            href="/college"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            <FiArrowLeft />
            Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  /* Data prepare */
  const name = getCollegeName(college);
  const email = getText(college.contact.email || college.contactEmail);
  const phone = getText(college.contact.phone || college.contactNumber);
  const address = formatAddress(college);

  const skipKeys = [
    ...HIDDEN_KEYS,
    ...NAME_KEYS,
    ...CONTACT_KEYS,
    ...(address ? ADDRESS_KEYS : []),
  ];

  const otherDetails = Object.entries(college).filter(
    ([key]) => !skipKeys.includes(key)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Link
          href="/college"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
        >
          <FiArrowLeft />
          Back to Colleges
        </Link>

        {/* Hero */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-md sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-4xl font-bold uppercase backdrop-blur">
              {name.charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                {name}
              </h1>

              <button
                onClick={copyId}
                title="Copy ID"
                className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-xs text-blue-50 transition hover:bg-white/25"
              >
                <span className="truncate">ID: {college._id}</span>
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Contact & Address */}
        <h2 className="mb-4 mt-8 text-lg font-bold text-gray-800">
          Contact & Address
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ContactCard icon={FiMail} label="Email" empty={!email}>
            <a
              href={`mailto:${email}`}
              className="break-all text-sm font-semibold text-gray-800 hover:text-blue-600"
            >
              {email}
            </a>
          </ContactCard>

          <ContactCard icon={FiPhone} label="Phone" empty={!phone}>
            <a
              href={`tel:${phone}`}
              className="text-sm font-semibold text-gray-800 hover:text-blue-600"
            >
              {phone}
            </a>
          </ContactCard>

          <ContactCard
            icon={FiMapPin}
            label="Address"
            empty={!address}
            className="md:col-span-2"
          >
            <p className="break-words text-sm font-semibold leading-relaxed text-gray-800">
              {address}
            </p>
            {address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                <FiMapPin size={13} />
                View on Google Maps
              </a>
            )}
          </ContactCard>
        </div>

        {/* Other info */}
        {otherDetails.length > 0 && (
          <>
            <h2 className="mb-4 mt-8 flex items-center gap-2 text-lg font-bold text-gray-800">
              <FiInfo className="text-blue-600" />
              Other Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherDetails.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {formatLabel(key)}
                  </p>
                  <ValueView value={value} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}