"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiMail,
  FiPhone,
  FiGlobe,
  FiRefreshCw,
  FiAlertCircle,
  FiFilter,
  FiBookOpen,
  FiAward,
  FiShield,
  FiExternalLink,
} from "react-icons/fi";

const API = "http://localhost:2002";

// ================= EMPTY FORM =================

const createEmptyForm = () => ({
  name: "",
  shortName: "",
  slug: "",
  logo: "",
  description: "",
  type: "",
  establishedYear: "",
  recognition: [],
  accreditation: [],
  location: {
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    coordinates: {
      latitude: "",
      longitude: "",
    },
  },
  contact: {
    email: "",
    phone: "",
  },
  website: "",
  status: "pending",
  isVerified: false,
});

// ================= AUTH CONFIG =================

const getAuthConfig = () => {
  if (typeof window === "undefined") {
    return { headers: {} };
  }

  const token = localStorage.getItem("token");

  return {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  };
};

// ================= HELPERS =================

const makeSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50";

const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

const universityTypes = [
  { value: "central", label: "Central University" },
  { value: "state", label: "State University" },
  { value: "private", label: "Private University" },
  { value: "deemed", label: "Deemed University" },
  { value: "international", label: "International University" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// ================= STAT CARD =================

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h2>

        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

// ================= STATUS BADGE =================

const StatusBadge = ({ status }) => {
  const currentStatus = status || "pending";

  const styles = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    inactive: "bg-rose-50 text-rose-700 ring-rose-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
  };

  const icons = {
    active: <FiCheckCircle />,
    inactive: <FiXCircle />,
    pending: <FiClock />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
        styles[currentStatus] || styles.pending
      }`}
    >
      {icons[currentStatus] || icons.pending}
      {currentStatus}
    </span>
  );
};

// ================= FORM FIELD =================

const FormField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  options,
  textarea = false,
  disabled = false,
}) => (
  <div>
    <label className={labelClass}>
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>

    {options ? (
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClass}
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : textarea ? (
      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        disabled={disabled}
        className={`${inputClass} resize-y`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClass}
      />
    )}
  </div>
);

// ================= SECTION HEADING =================

const SectionHeading = ({ title, subtitle }) => (
  <div className="mb-4 border-b border-slate-100 pb-3">
    <h3 className="font-bold text-slate-800">{title}</h3>
    <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
  </div>
);

// ================= UNIVERSITY FORM =================

const UniversityFormFields = ({
  data,
  handler,
  nestedHandler,
  contactHandler,
  coordinateHandler,
  recognitionHandler,
  accreditationHandler,
  addRecognition,
  removeRecognition,
  addAccreditation,
  removeAccreditation,
}) => {
  return (
    <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">

      {/* BASIC DETAILS */}

      <FormField
        label="University Name"
        name="name"
        value={data.name}
        onChange={handler}
        placeholder="Enter university name"
        required
      />

      <FormField
        label="Short Name"
        name="shortName"
        value={data.shortName}
        onChange={handler}
        placeholder="e.g. DU, RTU, IIT"
      />

      <FormField
        label="University Type"
        name="type"
        value={data.type}
        onChange={handler}
        options={universityTypes}
        required
      />

      <FormField
        label="Established Year"
        name="establishedYear"
        value={data.establishedYear}
        onChange={handler}
        type="number"
        placeholder="e.g. 1995"
      />

      <FormField
        label="Slug"
        name="slug"
        value={data.slug}
        onChange={handler}
        placeholder="university-name"
      />

      <FormField
        label="Website"
        name="website"
        value={data.website}
        onChange={handler}
        placeholder="https://example.edu"
      />

      <div className="md:col-span-2">
        <FormField
          label="Logo URL"
          name="logo"
          value={data.logo}
          onChange={handler}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="md:col-span-2">
        <FormField
          label="Description"
          name="description"
          value={data.description}
          onChange={handler}
          placeholder="Enter university description"
          textarea
        />
      </div>

      {/* RECOGNITION */}

      <div className="md:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            title="Recognition Details"
            subtitle="Add university recognition details."
          />

          <button
            type="button"
            onClick={addRecognition}
            className="mb-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            <FiPlus />
            Add Recognition
          </button>
        </div>

        {data.recognition?.length > 0 ? (
          <div className="space-y-3">
            {data.recognition.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_180px_auto]"
              >
                <FormField
                  label="Recognition Name"
                  name="name"
                  value={item.name}
                  onChange={(e) => recognitionHandler(index, e)}
                  placeholder="e.g. UGC"
                />

                <FormField
                  label="Year"
                  name="year"
                  value={item.year}
                  onChange={(e) => recognitionHandler(index, e)}
                  type="number"
                  placeholder="e.g. 2020"
                />

                <button
                  type="button"
                  onClick={() => removeRecognition(index)}
                  title="Remove recognition"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">
            No recognition added. Click Add Recognition.
          </p>
        )}
      </div>

      {/* ACCREDITATION */}

      <div className="md:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            title="Accreditation Details"
            subtitle="Add university accreditation details."
          />

          <button
            type="button"
            onClick={addAccreditation}
            className="mb-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            <FiPlus />
            Add Accreditation
          </button>
        </div>

        {data.accreditation?.length > 0 ? (
          <div className="space-y-3">
            {data.accreditation.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_130px_auto]"
              >
                <FormField
                  label="Accreditation Name"
                  name="name"
                  value={item.name}
                  onChange={(e) => accreditationHandler(index, e)}
                  placeholder="e.g. NAAC"
                />

                <FormField
                  label="Grade"
                  name="grade"
                  value={item.grade}
                  onChange={(e) => accreditationHandler(index, e)}
                  placeholder="e.g. A++"
                />

                <FormField
                  label="Score"
                  name="score"
                  value={item.score}
                  onChange={(e) => accreditationHandler(index, e)}
                  placeholder="e.g. 3.75"
                />

                <FormField
                  label="Year"
                  name="year"
                  value={item.year}
                  onChange={(e) => accreditationHandler(index, e)}
                  type="number"
                  placeholder="2024"
                />

                <button
                  type="button"
                  onClick={() => removeAccreditation(index)}
                  title="Remove accreditation"
                  className="flex h-11 w-11 items-center justify-center self-end rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">
            No accreditation added. Click Add Accreditation.
          </p>
        )}
      </div>

      {/* LOCATION */}

      <div className="md:col-span-2">
        <SectionHeading
          title="Location Details"
          subtitle="Enter the university address and location."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField
              label="Address"
              name="address"
              value={data.location?.address}
              onChange={nestedHandler}
              placeholder="Full street address"
            />
          </div>

          <FormField
            label="City"
            name="city"
            value={data.location?.city}
            onChange={nestedHandler}
            placeholder="Enter city"
          />

          <FormField
            label="State"
            name="state"
            value={data.location?.state}
            onChange={nestedHandler}
            placeholder="Enter state"
          />

          <FormField
            label="Country"
            name="country"
            value={data.location?.country}
            onChange={nestedHandler}
            placeholder="Enter country"
          />

          <FormField
            label="Pincode"
            name="pincode"
            value={data.location?.pincode}
            onChange={nestedHandler}
            placeholder="Enter pincode"
          />
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Coordinates (Optional)
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Latitude"
              name="latitude"
              value={data.location?.coordinates?.latitude}
              onChange={coordinateHandler}
              type="number"
              placeholder="e.g. 26.9124"
            />

            <FormField
              label="Longitude"
              name="longitude"
              value={data.location?.coordinates?.longitude}
              onChange={coordinateHandler}
              type="number"
              placeholder="e.g. 75.7873"
            />
          </div>
        </div>
      </div>

      {/* CONTACT */}

      <div className="md:col-span-2">
        <SectionHeading
          title="Contact Details"
          subtitle="Add the official email and phone number."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Email"
            name="email"
            value={data.contact?.email}
            onChange={contactHandler}
            type="email"
            placeholder="university@example.com"
          />

          <FormField
            label="Phone"
            name="phone"
            value={data.contact?.phone}
            onChange={contactHandler}
            type="tel"
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* STATUS */}

      <FormField
        label="Status"
        name="status"
        value={data.status}
        onChange={handler}
        options={statusOptions}
      />

      <div className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          id="isVerified"
          name="isVerified"
          checked={Boolean(data.isVerified)}
          onChange={handler}
          className="h-4 w-4 accent-indigo-600"
        />

        <label
          htmlFor="isVerified"
          className="cursor-pointer text-sm font-semibold text-slate-700"
        >
          Verified University
        </label>
      </div>
    </div>
  );
};

// ================= MODAL =================

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  saving = false,
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !saving) onClose();
    }}
  >
    <div
      className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
        wide ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close modal"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <FiX size={19} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

// ================= UNIVERSITY COMPONENT =================

const University = () => {
  const [universities, setUniversities] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addUniversity, setAddUniversity] = useState(false);
  const [editUniversity, setEditUniversity] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [form, setForm] = useState(createEmptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // ================= GET UNIVERSITIES =================

  const getUniversities = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API}/get-university`,
        getAuthConfig()
      );

      if (res.data.status === true || res.data.success === true) {
        setUniversities(
          res.data.universities || res.data.university || []
        );
      } else {
        showMessage(
          "error",
          res.data.message || "Universities load nahi hui."
        );
      }
    } catch (error) {
      console.error("Get universities error:", error);

      showMessage(
        "error",
        getErrorMessage(error, "Universities fetch nahi ho paayi.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUniversities();
  }, []);

  // ================= FORM HANDLERS =================

  const changeHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" ? { slug: makeSlug(value) } : {}),
    }));
  };

  const locationHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const coordinateHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          [name]: value,
        },
      },
    }));
  };

  const contactHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value,
      },
    }));
  };

  // ================= EDIT HANDLERS =================

  const editHandler = (e) => {
    const { name, value, type, checked } = e.target;

    setEditUniversity((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" ? { slug: makeSlug(value) } : {}),
    }));
  };

  const editLocationHandler = (e) => {
    const { name, value } = e.target;

    setEditUniversity((prev) => ({
      ...prev,
      location: {
        ...(prev.location || {}),
        [name]: value,
      },
    }));
  };

  const editCoordinateHandler = (e) => {
    const { name, value } = e.target;

    setEditUniversity((prev) => ({
      ...prev,
      location: {
        ...(prev.location || {}),
        coordinates: {
          ...(prev.location?.coordinates || {}),
          [name]: value,
        },
      },
    }));
  };

  const editContactHandler = (e) => {
    const { name, value } = e.target;

    setEditUniversity((prev) => ({
      ...prev,
      contact: {
        ...(prev.contact || {}),
        [name]: value,
      },
    }));
  };

  // ================= RECOGNITION HANDLERS =================

  const recognitionHandler = (index, e, isEdit = false) => {
    const { name, value } = e.target;

    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => {
      const recognition = [...(prev.recognition || [])];

      recognition[index] = {
        ...recognition[index],
        [name]: value,
      };

      return {
        ...prev,
        recognition,
      };
    });
  };

  const addRecognition = (isEdit = false) => {
    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => ({
      ...prev,
      recognition: [
        ...(prev.recognition || []),
        { name: "", year: "" },
      ],
    }));
  };

  const removeRecognition = (index, isEdit = false) => {
    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => ({
      ...prev,
      recognition: prev.recognition.filter((_, i) => i !== index),
    }));
  };

  // ================= ACCREDITATION HANDLERS =================

  const accreditationHandler = (index, e, isEdit = false) => {
    const { name, value } = e.target;

    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => {
      const accreditation = [...(prev.accreditation || [])];

      accreditation[index] = {
        ...accreditation[index],
        [name]: value,
      };

      return {
        ...prev,
        accreditation,
      };
    });
  };

  const addAccreditation = (isEdit = false) => {
    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => ({
      ...prev,
      accreditation: [
        ...(prev.accreditation || []),
        {
          name: "",
          grade: "",
          score: "",
          year: "",
        },
      ],
    }));
  };

  const removeAccreditation = (index, isEdit = false) => {
    const setter = isEdit ? setEditUniversity : setForm;

    setter((prev) => ({
      ...prev,
      accreditation: prev.accreditation.filter((_, i) => i !== index),
    }));
  };

  // ================= OPEN / CLOSE MODALS =================

  const openAddModal = () => {
    setForm(createEmptyForm());
    setMessage({ type: "", text: "" });
    setAddUniversity(true);
  };

  const closeAddModal = () => {
    if (saving) return;

    setAddUniversity(false);
    setForm(createEmptyForm());
  };

  const openEditModal = (university) => {
    setMessage({ type: "", text: "" });

    const emptyForm = createEmptyForm();

    setEditUniversity({
      ...emptyForm,
      ...university,

      recognition: (university.recognition || []).map((item) => ({
        name: item.name || "",
        year: item.year || "",
      })),

      accreditation: (university.accreditation || []).map((item) => ({
        name: item.name || "",
        grade: item.grade || "",
        score: item.score || "",
        year: item.year || "",
      })),

      location: {
        ...emptyForm.location,
        ...(university.location || {}),
        coordinates: {
          ...emptyForm.location.coordinates,
          ...(university.location?.coordinates || {}),
        },
      },

      contact: {
        ...emptyForm.contact,
        ...(university.contact || {}),
      },
    });
  };

  // ================= VALIDATION =================

  const validateUniversity = (university) => {
    if (!university.name?.trim()) {
      showMessage("error", "Please enter university name.");
      return false;
    }

    if (!university.type) {
      showMessage("error", "Please select university type.");
      return false;
    }

    if (
      university.establishedYear &&
      (Number(university.establishedYear) < 1000 ||
        Number(university.establishedYear) > new Date().getFullYear())
    ) {
      showMessage("error", "Please enter a valid established year.");
      return false;
    }

    return true;
  };

  // ================= PREPARE PAYLOAD =================

  const preparePayload = (university, includeId = false) => {
    const name = university.name.trim();

    const payload = {
      name,
      shortName: university.shortName?.trim() || "",
      slug: university.slug?.trim() || makeSlug(name),
      logo: university.logo || "",
      description: university.description || "",
      type: university.type,

      establishedYear: university.establishedYear
        ? Number(university.establishedYear)
        : undefined,

      recognition: (university.recognition || [])
        .filter((item) => item.name?.trim())
        .map((item) => ({
          name: item.name.trim(),
          year: item.year ? Number(item.year) : undefined,
        })),

      accreditation: (university.accreditation || [])
        .filter((item) => item.name?.trim())
        .map((item) => ({
          name: item.name.trim(),
          grade: item.grade || "",
          score: item.score || "",
          year: item.year ? Number(item.year) : undefined,
        })),

      location: {
        address: university.location?.address || "",
        city: university.location?.city || "",
        state: university.location?.state || "",
        country: university.location?.country || "India",
        pincode: university.location?.pincode || "",

        coordinates: {
          latitude: university.location?.coordinates?.latitude
            ? Number(university.location.coordinates.latitude)
            : undefined,

          longitude: university.location?.coordinates?.longitude
            ? Number(university.location.coordinates.longitude)
            : undefined,
        },
      },

      contact: {
        email: university.contact?.email?.trim() || "",
        phone: university.contact?.phone?.trim() || "",
      },

      website: university.website || "",
      status: university.status || "pending",
      isVerified: Boolean(university.isVerified),
    };

    if (includeId) {
      payload._id = university._id;
    }

    return payload;
  };

  // ================= ADD UNIVERSITY =================

  const addUniversitySubmit = async () => {
    if (!validateUniversity(form)) return;

    setSaving(true);

    try {
      const payload = preparePayload(form);

      const res = await axios.post(
        `${API}/add-university`,
        payload,
        getAuthConfig()
      );

      if (res.data.status === true || res.data.success === true) {
        setAddUniversity(false);
        setForm(createEmptyForm());

        showMessage("success", "University successfully added.");

        await getUniversities();
      } else {
        showMessage(
          "error",
          res.data.message || "University add nahi hui."
        );
      }
    } catch (error) {
      console.error(
        "Add university error:",
        error.response?.data || error
      );

      showMessage(
        "error",
        getErrorMessage(error, "University add nahi hui.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= UPDATE UNIVERSITY =================

  const saveEdit = async () => {
    if (!editUniversity || !validateUniversity(editUniversity)) return;

    if (!editUniversity._id) {
      showMessage("error", "University ID missing hai.");
      return;
    }

    setSaving(true);

    try {
      const payload = preparePayload(editUniversity, true);

      const res = await axios.post(
        `${API}/edit-university`,
        payload,
        getAuthConfig()
      );

      if (res.data.status === true || res.data.success === true) {
        const updatedUniversity = res.data.university;

        if (updatedUniversity) {
          setUniversities((prev) =>
            prev.map((university) =>
              university._id === updatedUniversity._id
                ? { ...university, ...updatedUniversity }
                : university
            )
          );
        } else {
          await getUniversities();
        }

        setEditUniversity(null);

        showMessage("success", "University successfully updated.");
      } else {
        showMessage(
          "error",
          res.data.message || "University update nahi hui."
        );
      }
    } catch (error) {
      console.error(
        "Update university error:",
        error.response?.data || error
      );

      showMessage(
        "error",
        getErrorMessage(error, "University update nahi hui.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE UNIVERSITY =================

  const deleteUniversity = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this university?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await axios.post(
        `${API}/delete-university`,
        { id },
        getAuthConfig()
      );

      if (res.data.status === true || res.data.success === true) {
        setUniversities((prev) =>
          prev.filter((university) => university._id !== id)
        );

        showMessage(
          "success",
          res.data.message || "University deleted successfully."
        );
      } else {
        showMessage(
          "error",
          res.data.message || "University delete nahi hui."
        );
      }
    } catch (error) {
      console.error("Delete university error:", error);

      showMessage(
        "error",
        getErrorMessage(error, "University delete nahi hui.")
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ================= SEARCH / FILTER =================

  const filteredUniversities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return universities.filter((university) => {
      const matchesSearch = [
        university.name,
        university.shortName,
        university.slug,
        university.type,
        university.location?.city,
        university.location?.state,
        university.location?.country,
        university.contact?.email,
        university.contact?.phone,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "all" ||
        (university.status || "pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [universities, search, statusFilter]);

  // ================= STATS =================

  const totalUniversities = universities.length;

  const activeUniversities = universities.filter(
    (university) => university.status === "active"
  ).length;

  const inactiveUniversities = universities.filter(
    (university) => university.status === "inactive"
  ).length;

  const pendingUniversities = universities.filter(
    (university) =>
      !university.status || university.status === "pending"
  ).length;

  // ================= MAIN UI =================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Administration / Institutions
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            University Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage university profiles, recognition, accreditation and contact
            information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <FiPlus size={18} />
          Add University
        </button>
      </div>

      {/* FEEDBACK */}

      {message.text && (
        <div
          className={`mb-6 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          <div className="flex items-start gap-2 text-sm font-medium">
            {message.type === "success" ? (
              <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
            ) : (
              <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
            )}

            <span>{message.text}</span>
          </div>

          <button
            onClick={() => setMessage({ type: "", text: "" })}
            aria-label="Dismiss message"
            className="rounded-md p-1 hover:bg-black/5"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* STATS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Universities"
          value={totalUniversities}
          subtitle="All registered universities"
          icon={<FiBookOpen size={22} />}
          color="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Active"
          value={activeUniversities}
          subtitle="Currently active"
          icon={<FiCheckCircle size={22} />}
          color="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive"
          value={inactiveUniversities}
          subtitle="Currently inactive"
          icon={<FiXCircle size={22} />}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Pending"
          value={pendingUniversities}
          subtitle="Awaiting activation"
          icon={<FiClock size={22} />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">All Universities</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredUniversities.length} university(s) found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:min-w-[270px]">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search universities..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="relative sm:min-w-[160px]">
              <FiFilter
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} appearance-none pl-10 pr-9`}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <button
              onClick={getUniversities}
              disabled={loading}
              title="Refresh universities"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
                size={17}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">University</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Verification</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <FiRefreshCw className="animate-spin" size={18} />
                      Loading universities...
                    </div>
                  </td>
                </tr>
              ) : filteredUniversities.length > 0 ? (
                filteredUniversities.map((university) => (
                  <tr
                    key={university._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    {/* UNIVERSITY */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {university.logo ? (
                          <img
                            src={university.logo}
                            alt={`${university.name} logo`}
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                            {university.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate font-semibold text-slate-800">
                            {university.name || "-"}
                          </p>

                          <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                            {university.shortName || university.slug || "University"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span className="text-sm capitalize text-slate-600">
                        {university.type || "-"}
                      </span>

                      <p className="mt-1 text-xs text-slate-400">
                        {university.establishedYear
                          ? `Est. ${university.establishedYear}`
                          : ""}
                      </p>
                    </td>

                    {/* LOCATION */}

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />

                        <div>
                          <p>
                            {university.location?.city || "-"}
                            {university.location?.state
                              ? `, ${university.location.state}`
                              : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {university.location?.country || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}

                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FiMail className="shrink-0 text-slate-400" />

                          <span className="max-w-[190px] truncate">
                            {university.contact?.email || "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FiPhone className="shrink-0 text-slate-400" />

                          <span>{university.contact?.phone || "-"}</span>
                        </div>
                      </div>
                    </td>

                    {/* VERIFICATION */}

                    <td className="px-5 py-4">
                      {university.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <FiShield />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                          Not Verified
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <StatusBadge status={university.status} />
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedUniversity(university)}
                          title="View details"
                          aria-label="View university details"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(university)}
                          title="Edit university"
                          aria-label="Edit university"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          onClick={() => deleteUniversity(university._id)}
                          disabled={deletingId === university._id}
                          title="Delete university"
                          aria-label="Delete university"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === university._id ? (
                            <FiRefreshCw className="animate-spin" size={16} />
                          ) : (
                            <FiTrash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FiSearch size={24} />
                      </div>

                      <h3 className="font-semibold text-slate-700">
                        No universities found
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Try a different search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD UNIVERSITY MODAL */}

      {addUniversity && (
        <Modal
          title="Add University"
          subtitle="Enter the university information below."
          onClose={closeAddModal}
          saving={saving}
          wide
        >
          <div className="overflow-y-auto">
            <UniversityFormFields
              data={form}
              handler={changeHandler}
              nestedHandler={locationHandler}
              contactHandler={contactHandler}
              coordinateHandler={coordinateHandler}
              recognitionHandler={(index, e) =>
                recognitionHandler(index, e, false)
              }
              accreditationHandler={(index, e) =>
                accreditationHandler(index, e, false)
              }
              addRecognition={() => addRecognition(false)}
              removeRecognition={(index) =>
                removeRecognition(index, false)
              }
              addAccreditation={() => addAccreditation(false)}
              removeAccreditation={(index) =>
                removeAccreditation(index, false)
              }
            />
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              onClick={closeAddModal}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={addUniversitySubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <FiRefreshCw className="animate-spin" />}
              {saving ? "Saving..." : "Add University"}
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT UNIVERSITY MODAL */}

      {editUniversity && (
        <Modal
          title="Edit University"
          subtitle="Update university details and contact information."
          onClose={() => !saving && setEditUniversity(null)}
          saving={saving}
          wide
        >
          <div className="overflow-y-auto">
            <UniversityFormFields
              data={editUniversity}
              handler={editHandler}
              nestedHandler={editLocationHandler}
              contactHandler={editContactHandler}
              coordinateHandler={editCoordinateHandler}
              recognitionHandler={(index, e) =>
                recognitionHandler(index, e, true)
              }
              accreditationHandler={(index, e) =>
                accreditationHandler(index, e, true)
              }
              addRecognition={() => addRecognition(true)}
              removeRecognition={(index) =>
                removeRecognition(index, true)
              }
              addAccreditation={() => addAccreditation(true)}
              removeAccreditation={(index) =>
                removeAccreditation(index, true)
              }
            />
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              onClick={() => setEditUniversity(null)}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={saveEdit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <FiRefreshCw className="animate-spin" />}
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW UNIVERSITY MODAL */}

      {selectedUniversity && (
        <Modal
          title="University Details"
          subtitle="Complete university profile and information."
          onClose={() => setSelectedUniversity(null)}
          saving={saving}
          wide
        >
          <div className="overflow-y-auto p-5 sm:p-6">

            {/* UNIVERSITY HEADER */}

            <div className="mb-6 flex flex-wrap items-center gap-4">
              {selectedUniversity.logo ? (
                <img
                  src={selectedUniversity.logo}
                  alt={`${selectedUniversity.name} logo`}
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                  {selectedUniversity.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedUniversity.name}
                </h3>

                <p className="mt-1 text-sm capitalize text-slate-500">
                  {selectedUniversity.type || "University"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={selectedUniversity.status} />

                  {selectedUniversity.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      <FiShield />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BASIC DETAILS */}

            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                <FiBookOpen className="text-indigo-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Short Name", selectedUniversity.shortName],
                  ["University Type", selectedUniversity.type],
                  ["Established Year", selectedUniversity.establishedYear],
                  ["Slug", selectedUniversity.slug],
                  ["Email", selectedUniversity.contact?.email],
                  ["Phone", selectedUniversity.contact?.phone],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-medium text-slate-400">
                      {label}
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold capitalize text-slate-700">
                      {value || "-"}
                    </p>
                  </div>
                ))}

                <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                  <p className="text-xs font-medium text-slate-400">Website</p>

                  {selectedUniversity.website ? (
                    <a
                      href={selectedUniversity.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-2 break-all text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      {selectedUniversity.website}
                      <FiExternalLink />
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700">-</p>
                  )}
                </div>
              </div>
            </div>

            {/* LOCATION */}

            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                <FiMapPin className="text-indigo-500" />
                Location Details
              </h3>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Address</p>

                <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                  {[
                    selectedUniversity.location?.address,
                    selectedUniversity.location?.city,
                    selectedUniversity.location?.state,
                    selectedUniversity.location?.country,
                    selectedUniversity.location?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "No location available"}
                </p>

                {(selectedUniversity.location?.coordinates?.latitude ||
                  selectedUniversity.location?.coordinates?.longitude) && (
                  <p className="mt-3 text-xs text-slate-500">
                    Latitude:{" "}
                    {selectedUniversity.location?.coordinates?.latitude || "-"}
                    {" | "}
                    Longitude:{" "}
                    {selectedUniversity.location?.coordinates?.longitude || "-"}
                  </p>
                )}
              </div>
            </div>

            {/* RECOGNITION */}

            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                <FiAward className="text-indigo-500" />
                Recognition
              </h3>

              {selectedUniversity.recognition?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedUniversity.recognition.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-700">
                        {item.name || "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Year: {item.year || "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                  No recognition details available.
                </p>
              )}
            </div>

            {/* ACCREDITATION */}

            <div className="mb-5">
              <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                <FiShield className="text-indigo-500" />
                Accreditation
              </h3>

              {selectedUniversity.accreditation?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedUniversity.accreditation.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <p className="font-semibold text-slate-700">
                        {item.name || "-"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>Grade: {item.grade || "-"}</span>
                        <span>Score: {item.score || "-"}</span>
                        <span>Year: {item.year || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                  No accreditation details available.
                </p>
              )}
            </div>

            {/* DESCRIPTION */}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {selectedUniversity.description ||
                  "No description available."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              onClick={() => setSelectedUniversity(null)}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default University;