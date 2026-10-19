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
} from "react-icons/fi";

const API = "http://localhost:2002";

const createEmptyForm = () => ({
  name: "",
  slug: "",
  logo: "",
  description: "",
  collegeType: "",
  ownership: "",
  establishedYear: "",
  location: {
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  },
  website: "",
  contact: {
    email: "",
    phone: "",
  },
  status: "pending",
});

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

const makeSlug = (value) =>
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


const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

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
        className={inputClass}
      />
    )}
  </div>
);

const CollegeFormFields = ({ data, handler, nestedHandler, contactHandler: contactChange }) => (
  <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 md:grid-cols-2">
    <FormField
      label="College Name"
      name="name"
      value={data.name}
      onChange={handler}
      placeholder="Enter college name"
      required
    />

    <FormField
      label="College Type"
      name="collegeType"
      value={data.collegeType}
      onChange={handler}
      required
      options={[
        { value: "government", label: "Government" },
        { value: "private", label: "Private" },
        { value: "deemed", label: "Deemed" },
        { value: "autonomous", label: "Autonomous" },
        { value: "public", label: "Public" },
      ]}
    />

    <FormField
      label="Slug"
      name="slug"
      value={data.slug}
      onChange={handler}
      placeholder="college-name"
    />

    <FormField
      label="Ownership"
      name="ownership"
      value={data.ownership}
      onChange={handler}
      placeholder="Enter ownership"
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
        placeholder="Enter college description"
        textarea
      />
    </div>

    <div className="md:col-span-2">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800">Location Details</h3>
        <p className="mt-1 text-xs text-slate-500">
          Enter the college's address and location.
        </p>
      </div>

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
    </div>

    <div className="md:col-span-2">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800">Contact Details</h3>
        <p className="mt-1 text-xs text-slate-500">
          Add the official email and phone number.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          label="Email"
          name="email"
          value={data.contact?.email}
          onChange={contactChange}
          type="email"
          placeholder="college@example.com"
          required
        />

        <FormField
          label="Phone"
          name="phone"
          value={data.contact?.phone}
          onChange={contactChange}
          type="tel"
          placeholder="Enter phone number"
          required
        />
      </div>
    </div>

    <FormField
      label="Status"
      name="status"
      value={data.status}
      onChange={handler}
      options={[
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ]}
    />
  </div>
);

const Modal = ({ title, subtitle, onClose, children, wide = false, saving = false }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !saving) onClose();
    }}
  >
    <div
      className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
        wide ? "max-w-4xl" : "max-w-2xl"
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

const College = () => {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addCollege, setAddCollege] = useState(false);
  const [editCollege, setEditCollege] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);

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

  // ================= GET COLLEGES =================

  const getColleges = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API}/get-college`,
        getAuthConfig()
      );

      if (res.data.status || res.data.success) {
        setColleges(
          res.data.colleges ||
          res.data.college ||
          []
        );
      } else {
        showMessage(
          "error",
          res.data.message || "Colleges load nahi hue."
        );
      }
    } catch (error) {
      console.error("Get colleges error:", error);
      showMessage(
        "error",
        getErrorMessage(error, "Colleges fetch nahi ho paaye.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getColleges();
  }, []);

  // ================= FORM HANDLERS =================

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
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

  const editHandler = (e) => {
    const { name, value } = e.target;

    setEditCollege((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name"
        ? { slug: makeSlug(value) }
        : {}),
    }));
  };

  const editLocationHandler = (e) => {
    const { name, value } = e.target;

    setEditCollege((prev) => ({
      ...prev,
      location: {
        ...(prev.location || {}),
        [name]: value,
      },
    }));
  };

  const editContactHandler = (e) => {
    const { name, value } = e.target;

    setEditCollege((prev) => ({
      ...prev,
      contact: {
        ...(prev.contact || {}),
        [name]: value,
      },
    }));
  };

  // ================= OPEN / CLOSE MODALS =================

  const openAddModal = () => {
    setForm(createEmptyForm());
    setMessage({ type: "", text: "" });
    setAddCollege(true);
  };

  const closeAddModal = () => {
    if (saving) return;
    setAddCollege(false);
    setForm(createEmptyForm());
  };

  const openEditModal = (college) => {
    setMessage({ type: "", text: "" });

    setEditCollege({
      ...createEmptyForm(),
      ...college,
      location: {
        ...createEmptyForm().location,
        ...(college.location || {}),
      },
      contact: {
        ...createEmptyForm().contact,
        ...(college.contact || {}),
      },
    });
  };

  // ================= VALIDATION =================

  const validateCollege = (college) => {
    if (!college.name?.trim()) {
      showMessage("error", "Please enter college name.");
      return false;
    }

    if (!college.collegeType) {
      showMessage("error", "Please select college type.");
      return false;
    }

    if (!college.contact?.email?.trim()) {
      showMessage("error", "Please enter college email.");
      return false;
    }

    if (!college.contact?.phone?.trim()) {
      showMessage("error", "Please enter college phone.");
      return false;
    }

    return true;
  };

  // ================= ADD COLLEGE =================


const addCollegeSubmit = async () => {
  if (!validateCollege(form)) return;

  setSaving(true);

  try {
    const collegeName = form.name.trim();

    const payload = {
      ...form,
      name: collegeName,
      slug: form.slug?.trim() || makeSlug(collegeName),
      establishedYear: form.establishedYear
        ? Number(form.establishedYear)
        : undefined,
      location: {
        ...form.location,
      },
      contact: {
        email: form.contact?.email?.trim() || "",
        phone: form.contact?.phone?.trim() || "",
      },
    };

    const res = await axios.post(
      `${API}/add-college`,
      payload,
      getAuthConfig()
    );

    if (res.data.status === true || res.data.success === true) {
      showMessage("success", "College successfully added.");

      setAddCollege(false);
      setForm(createEmptyForm());

      await getColleges();
    } else {
      showMessage(
        "error",
        res.data.message || "College add nahi hua."
      );
    }
  } catch (error) {
    console.error(
      "Add college error:",
      error.response?.data || error
    );

    showMessage(
      "error",
      getErrorMessage(error, "College add nahi hua.")
    );
  } finally {
    setSaving(false);
  }
};

  // ================= UPDATE COLLEGE =================


const saveEdit = async () => {
  if (!editCollege || !validateCollege(editCollege)) return;

  if (!editCollege._id) {
    showMessage("error", "College ID missing hai.");
    return;
  }

  setSaving(true);

  try {
    const collegeName = editCollege.name.trim();

    const payload = {
      _id: editCollege._id,
      name: collegeName,
      slug: editCollege.slug?.trim() || makeSlug(collegeName),
      logo: editCollege.logo || "",
      description: editCollege.description || "",
      collegeType: editCollege.collegeType,
      ownership: editCollege.ownership || "",
      establishedYear: editCollege.establishedYear
        ? Number(editCollege.establishedYear)
        : undefined,
      location: {
        ...createEmptyForm().location,
        ...(editCollege.location || {}),
      },
      website: editCollege.website || "",
      contact: {
        email: editCollege.contact?.email?.trim() || "",
        phone: editCollege.contact?.phone?.trim() || "",
      },
      status: editCollege.status || "pending",
    };

    const res = await axios.post(
      `${API}/edit-college`,
      payload,
      getAuthConfig()
    );

    if (res.data.status === true || res.data.success === true) {
      const updatedCollege = res.data.college;

      if (updatedCollege) {
        setColleges((prev) =>
          prev.map((college) =>
            college._id === updatedCollege._id
              ? { ...college, ...updatedCollege }
              : college
          )
        );
      } else {
        await getColleges();
      }

      setEditCollege(null);

      showMessage("success", "College successfully updated.");
    } else {
      showMessage(
        "error",
        res.data.message || "College update nahi hua."
      );
    }
  } catch (error) {
    console.error(
      "Update college error:",
      error.response?.data || error
    );

    showMessage(
      "error",
      getErrorMessage(error, "College update nahi hua.")
    );
  } finally {
    setSaving(false);
  }
};


  // ================= DELETE COLLEGE =================
const deleteCollege = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this college?"
  );

  if (!confirmed) return;

  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:2002/delete-college",
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.status) {
      setColleges((prev) =>
        prev.filter((college) => college._id !== id)
      );

      alert(res.data.message);
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error("Delete college error:", error);
    alert(
      error.response?.data?.message || "College delete nahi hua."
    );
  }
};

  // ================= SEARCH / FILTER =================

  const filteredColleges = useMemo(() => {
    const query = search.trim().toLowerCase();

    return colleges.filter((college) => {
      const matchesSearch = [
        college.name,
        college.slug,
        college.collegeType,
        college.ownership,
        college.location?.city,
        college.location?.state,
        college.contact?.email,
        college.contact?.phone,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "all" ||
        (college.status || "pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [colleges, search, statusFilter]);

  // ================= STATS =================

  const totalColleges = colleges.length;

  const activeColleges = colleges.filter(
    (college) => college.status === "active"
  ).length;

  const inactiveColleges = colleges.filter(
    (college) => college.status === "inactive"
  ).length;

  const pendingColleges = colleges.filter(
    (college) =>
      !college.status || college.status === "pending"
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
            College Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage college profiles, contact information and status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <FiPlus size={18} />
          Add College
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
          title="Total Colleges"
          value={totalColleges}
          subtitle="All registered colleges"
          icon={<FiBookOpen size={22} />}
          color="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Active"
          value={activeColleges}
          subtitle="Currently active"
          icon={<FiCheckCircle size={22} />}
          color="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive"
          value={inactiveColleges}
          subtitle="Currently inactive"
          icon={<FiXCircle size={22} />}
          color="bg-rose-50 text-rose-600"
        />

        <StatCard
          title="Pending"
          value={pendingColleges}
          subtitle="Awaiting activation"
          icon={<FiClock size={22} />}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-800">All Colleges</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredColleges.length} college(s) found
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
                placeholder="Search colleges..."
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
              onClick={getColleges}
              disabled={loading}
              title="Refresh colleges"
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
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">College</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <FiRefreshCw className="animate-spin" size={18} />
                      Loading colleges...
                    </div>
                  </td>
                </tr>
              ) : filteredColleges.length > 0 ? (
                filteredColleges.map((college) => (
                  <tr
                    key={college._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {college.logo ? (
                          <img
                            src={college.logo}
                            alt={`${college.name} logo`}
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-100 bg-white object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600">
                            {college.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate font-semibold text-slate-800">
                            {college.name || "-"}
                          </p>
                          <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                            {college.slug || "College"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm capitalize text-slate-600">
                        {college.collegeType || "-"}
                      </span>
                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {college.ownership || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <FiMapPin className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                          <p>
                            {college.location?.city || "-"}
                            {college.location?.state
                              ? `, ${college.location.state}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {college.location?.country || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FiMail className="shrink-0 text-slate-400" />
                          <span className="max-w-[190px] truncate">
                            {college.contact?.email || "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FiPhone className="shrink-0 text-slate-400" />
                          <span>{college.contact?.phone || "-"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={college.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedCollege(college)}
                          title="View details"
                          aria-label="View college details"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <FiEye size={16} />
                        </button>

                        <button
                          onClick={() => openEditModal(college)}
                          title="Edit college"
                          aria-label="Edit college"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        <button
                          onClick={() => deleteCollege(college._id)}
                          disabled={deletingId === college._id}
                          title="Delete college"
                          aria-label="Delete college"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === college._id ? (
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
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FiSearch size={24} />
                      </div>
                      <h3 className="font-semibold text-slate-700">
                        No colleges found
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

      {/* ADD COLLEGE MODAL */}
      {addCollege && (
        <Modal
          title="Add College"
          subtitle="Enter the college information below."
          onClose={closeAddModal}
          saving={saving}
          wide
        >
          <div className="overflow-y-auto">
            <CollegeFormFields
              data={form}
              handler={changeHandler}
              nestedHandler={locationHandler}
              contactHandler={contactHandler}
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
              onClick={addCollegeSubmit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <FiRefreshCw className="animate-spin" />}
              {saving ? "Saving..." : "Add College"}
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT COLLEGE MODAL */}
      {editCollege && (
        <Modal
          title="Edit College"
          subtitle="Update college details and contact information."
          onClose={() => !saving && setEditCollege(null)}
          saving={saving}
          wide
        >
          <div className="overflow-y-auto">
            <CollegeFormFields
              data={editCollege}
              handler={editHandler}
              nestedHandler={editLocationHandler}
              contactHandler={editContactHandler}
            />
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              onClick={() => setEditCollege(null)}
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

      {/* VIEW COLLEGE MODAL */}
      {selectedCollege && (
        <Modal
          title="College Details"
          subtitle="Complete college profile and contact information."
          onClose={() => setSelectedCollege(null)}
          saving={saving}
        >
          <div className="overflow-y-auto p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-4">
              {selectedCollege.logo ? (
                <img
                  src={selectedCollege.logo}
                  alt={`${selectedCollege.name} logo`}
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600">
                  {selectedCollege.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedCollege.name}
                </h3>
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {selectedCollege.collegeType || "College"}
                </p>
                <div className="mt-2">
                  <StatusBadge status={selectedCollege.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["Ownership", selectedCollege.ownership],
                ["Established Year", selectedCollege.establishedYear],
                ["Slug", selectedCollege.slug],
                ["Email", selectedCollege.contact?.email],
                ["Phone", selectedCollege.contact?.phone],
                ["Website", selectedCollege.website],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-400">
                    {label}
                  </p>

                  {label === "Website" && value ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block break-all text-sm font-semibold text-indigo-600 hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                      {value || "-"}
                    </p>
                  )}
                </div>
              ))}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                <div className="flex items-start gap-2">
                  <FiMapPin className="mt-0.5 shrink-0 text-indigo-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                      {[
                        selectedCollege.location?.address,
                        selectedCollege.location?.city,
                        selectedCollege.location?.state,
                        selectedCollege.location?.country,
                        selectedCollege.location?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No location available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium text-slate-400">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedCollege.description || "No description available."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <button
              onClick={() => setSelectedCollege(null)}
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

export default College;