
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";

const API = "http://localhost:2002";

// JWT authentication
const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

// Nested object helpers
const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const setValue = (object, path, value) => {
  const keys = path.split(".");
  const result = { ...object };
  let current = result;
  let original = object;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      const next = original?.[key];

      current[key] = Array.isArray(next)
        ? [...next]
        : { ...(next || {}) };

      current = current[key];
      original = next;
    }
  });

  return result;
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return value._id || value.id || "";
  }

  return value ?? "";
};

const getErrorMessage = (error, fallback) => {
  if (error.response?.status === 401) {
    return "Session expired or token missing. Please log in again.";
  }

  if (error.response?.status === 403) {
    return (
      error.response?.data?.message ||
      "You do not have permission to perform this action."
    );
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
  );
};

// Supports different API response structures
const getList = (response, key) => {
  const data = response.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const getRecord = (response, key) =>
  response.data?.[key] ||
  response.data?.data ||
  response.data?.item ||
  response.data;

// Create blank form based on field configuration
const makeBlankForm = (fields) =>
  fields.reduce((form, field) => {
    let value = field.defaultValue ?? "";

    if (field.type === "tags" || field.type === "multiselect") {
      value = [];
    }

    return setValue(form, field.name, value);
  }, {});

// Convert API record to editable form
const normalizeForm = (record, fields) => {
  let form = makeBlankForm(fields);

  fields.forEach((field) => {
    let value = getValue(record, field.name);

    if (field.type === "select") {
      value = getId(value);
    }

    if (field.type === "multiselect") {
      value = Array.isArray(value) ? value.map(getId) : [];
    }

    if (field.type === "tags") {
      value = Array.isArray(value)
        ? value.map((item) =>
            typeof item === "object"
              ? item.name || item.title || item.value || ""
              : item
          )
        : String(value ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (field.type === "number") {
      value = value ?? "";
    }

    if (value !== undefined && value !== null) {
      form = setValue(form, field.name, value);
    }
  });

  return form;
};

// Convert form data into backend payload
const preparePayload = (form, fields) => {
  let payload = {};

  fields.forEach((field) => {
    let value = getValue(form, field.name);

    if (field.type === "tags") {
      value = Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : String(value || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (field.type === "number") {
      value =
        value === "" || value === null || value === undefined
          ? undefined
          : Number(value);
    }

    if (field.type === "select") {
      value = value || undefined;
    }

    if (field.type === "multiselect") {
      value = Array.isArray(value) ? value.filter(Boolean) : [];
    }

    // Empty optional values are omitted from the request.
    // This also avoids overwriting fields with empty strings accidentally.
    if (value !== undefined) {
      payload = setValue(payload, field.name, value);
    }
  });

  return payload;
};

const statusIsActive = (item) => {
  if (typeof item.status === "boolean") return item.status;

  return String(item.status || "active").toLowerCase() === "active";
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    return (
      value
        .map((item) =>
          typeof item === "object"
            ? item.name || item.title || item._id || ""
            : item
        )
        .filter(Boolean)
        .join(", ") || "—"
    );
  }

  if (typeof value === "object") {
    return value.name || value.title || value._id || "—";
  }

  return String(value);
};

const CatalogManager = ({
  title,
  subtitle,
  singular,
  endpoint,
  listKey,
  fields,
  columns,
  lookups = [],
  searchFields = ["name"],
}) => {
  const [items, setItems] = useState([]);
  const [lookupData, setLookupData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [form, setForm] = useState(() => makeBlankForm(fields));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
  };

  // GET ALL RECORDS
  const loadItems = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API}${endpoint.list}`,
        getAuthConfig()
      );

      setItems(getList(response, listKey));
    } catch (err) {
      showNotice(
        getErrorMessage(err, `Unable to load ${title.toLowerCase()}.`),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // GET DROPDOWN DATA
  const loadLookups = async () => {
    const results = await Promise.all(
      lookups.map(async (lookup) => {
        try {
          const response = await axios.get(
            `${API}${lookup.endpoint}`,
            getAuthConfig()
          );

          return [lookup.key, getList(response, lookup.listKey)];
        } catch (err) {
          console.error(`Unable to load ${lookup.label}`, err);

          return [lookup.key, []];
        }
      })
    );

    setLookupData(Object.fromEntries(results));
  };

  useEffect(() => {
    loadItems();
    loadLookups();

    // Configuration stays constant for each catalog page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPEN ADD POPUP
  const openAdd = () => {
    setEditingItem(null);
    setForm(makeBlankForm(fields));
    setError("");
    setNotice("");
    setShowForm(true);
  };

  // OPEN EDIT POPUP
  const openEdit = (item) => {
    setEditingItem(item);
    setForm(normalizeForm(item, fields));
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingItem(null);
    setError("");
  };

  const updateField = (name, value) => {
    setForm((previous) => setValue(previous, name, value));
  };

  // CREATE / UPDATE
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = preparePayload(form, fields);
    console.log("FORM DATA:", form);
console.log("API PAYLOAD:", payload);
console.log("CREATE URL:", `${API}${endpoint.create}`);
      if (editingItem) {
        const id = editingItem._id || editingItem.id;

        if (!id) {
          throw new Error("Record ID is missing.");
        }

        await axios.put(
          `${API}${endpoint.update}/${id}`,
          payload,
          getAuthConfig()
        );

        showNotice(`${singular} updated successfully.`);
      } else {
        await axios.post(
          `${API}${endpoint.create}`,
          payload,
          getAuthConfig()
        );

        showNotice(`${singular} created successfully.`);
      }

      setShowForm(false);
      setEditingItem(null);

      await loadItems();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          err.message || `Unable to save ${singular.toLowerCase()}.`
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (item) => {
    const id = item._id || item.id;

    if (!id) {
      showNotice("This record does not have a valid ID.", "error");
      return;
    }

    if (deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this ${singular}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setNotice("");
    setDeletingId(id);

    try {
      await axios.delete(
        `${API}${endpoint.delete}/${id}`,
        getAuthConfig()
      );

      setItems((previous) =>
        previous.filter((record) => (record._id || record.id) !== id)
      );

      if (viewingItem && (viewingItem._id || viewingItem.id) === id) {
        setViewingItem(null);
      }

      showNotice(`${singular} deleted successfully.`);
    } catch (err) {
      showNotice(
        getErrorMessage(
          err,
          `Unable to delete ${singular.toLowerCase()}.`
        ),
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH AND STATUS FILTER
  const filteredItems = items.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      searchFields.some((field) =>
        displayValue(getValue(item, field))
          .toLowerCase()
          .includes(query)
      );

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && statusIsActive(item)) ||
      (statusFilter === "inactive" && !statusIsActive(item));

    return matchesSearch && matchesStatus;
  });

  // RENDER FORM FIELD
  const renderField = (field) => {
    const value = getValue(form, field.name) ?? "";

    const baseClass =
      "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100";

    const options =
      field.lookup
        ? lookupData[field.lookup] || []
        : field.options || [];

    const getOptionValue = (option) =>
      typeof option === "object"
        ? option.value ?? option._id ?? option.id ?? ""
        : option;

    const getOptionLabel = (option) =>
      typeof option === "object"
        ? option.label ||
          option[field.optionLabel || "name"] ||
          option.title ||
          option.value ||
          option._id ||
          ""
        : option;

    return (
      <div
        key={field.name}
        className={field.fullWidth ? "sm:col-span-2" : ""}
      >
        <label className="text-sm font-semibold text-slate-700">
          {field.label}
          {field.required && (
            <span className="ml-1 text-rose-500">*</span>
          )}
        </label>

        {/* SINGLE SELECT */}
        {field.type === "select" && (
          <div className="relative">
            <select
              value={value}
              required={field.required}
              disabled={saving}
              onChange={(event) =>
                updateField(field.name, event.target.value)
              }
              className={`${baseClass} appearance-none pr-10`}
            >
              <option value="">
                Select {field.label}
              </option>

              {options.map((option, index) => (
                <option
                  key={getOptionValue(option) || index}
                  value={getOptionValue(option)}
                >
                  {getOptionLabel(option)}
                </option>
              ))}
            </select>

            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 mt-1 text-slate-400" />
          </div>
        )}

        {/* MULTI SELECT: useful for Degree streams */}
        {field.type === "multiselect" && (
          <select
            multiple
            value={Array.isArray(value) ? value.map(String) : []}
            required={field.required}
            disabled={saving}
            onChange={(event) => {
              const selectedValues = Array.from(
                event.target.selectedOptions,
                (option) => option.value
              );

              updateField(field.name, selectedValues);
            }}
            className={`${baseClass} min-h-32`}
          >
            {options.map((option, index) => (
              <option
                key={getOptionValue(option) || index}
                value={getOptionValue(option)}
              >
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        )}

        {field.type === "multiselect" && (
          <p className="mt-1 text-xs text-slate-400">
            Hold Ctrl (Windows) or Command (Mac) to select multiple options.
          </p>
        )}

        {/* TAGS: required subjects, career options */}
        {field.type === "tags" && (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(", ") : value}
            required={field.required}
            disabled={saving}
            placeholder={
              field.placeholder ||
              `Enter ${field.label.toLowerCase()}, separated by commas`
            }
            onChange={(event) =>
              updateField(field.name, event.target.value)
            }
            className={baseClass}
          />
        )}

        {/* TEXTAREA */}
        {field.type === "textarea" && (
          <textarea
            rows={3}
            value={value}
            required={field.required}
            disabled={saving}
            placeholder={
              field.placeholder ||
              `Enter ${field.label.toLowerCase()}`
            }
            onChange={(event) =>
              updateField(field.name, event.target.value)
            }
            className={`${baseClass} resize-y`}
          />
        )}

        {/* TEXT / NUMBER / DATE */}
        {!["select", "multiselect", "tags", "textarea"].includes(
          field.type
        ) && (
          <input
            type={
              ["text", "number", "date", "email"].includes(field.type)
                ? field.type
                : "text"
            }
            min={field.type === "number" ? field.min : undefined}
            max={field.type === "number" ? field.max : undefined}
            step={field.type === "number" ? "any" : undefined}
            value={value}
            required={field.required}
            disabled={saving}
            placeholder={
              field.placeholder ||
              `Enter ${field.label.toLowerCase()}`
            }
            onChange={(event) =>
              updateField(field.name, event.target.value)
            }
            className={baseClass}
          />
        )}

        {field.help && (
          <p className="mt-1 text-xs text-slate-400">
            {field.help}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
              <FiLayers size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <FiPlus size={18} />
            Add {singular}
          </button>
        </div>

        {/* FEEDBACK */}
        {notice && (
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
              noticeType === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {noticeType === "error" ? (
                <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
              ) : (
                <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
              )}

              <span>{notice}</span>
            </div>

            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
              className="rounded-md p-1 hover:bg-black/5"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total {title}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-bold text-slate-900">
                {items.length}
              </p>

              <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FiLayers size={20} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-bold text-emerald-600">
                {items.filter(statusIsActive).length}
              </p>

              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FiCheckCircle size={20} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Inactive
            </p>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-3xl font-bold text-rose-600">
                {items.filter((item) => !statusIsActive(item)).length}
              </p>

              <span className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <FiXCircle size={20} />
              </span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-bold text-slate-900">
                All {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredItems.length} of {items.length} records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={() => {
                  loadItems();
                  loadLookups();
                }}
                title="Refresh"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">#</th>

                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-5 py-4 font-semibold"
                    >
                      {column.label}
                    </th>
                  ))}

                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 3}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      <FiRefreshCw
                        className="mx-auto mb-3 animate-spin"
                        size={24}
                      />
                      Loading {title.toLowerCase()}...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 3}
                      className="px-5 py-16 text-center"
                    >
                      <div className="text-base font-semibold text-slate-700">
                        No records found
                      </div>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or add a new{" "}
                        {singular.toLowerCase()}.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr
                      key={item._id || item.id || index}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 text-slate-400">
                        {index + 1}
                      </td>

                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-5 py-4 text-slate-700"
                        >
                          <div className="max-w-xs truncate">
                            {displayValue(
                              getValue(item, column.key)
                            )}
                          </div>
                        </td>
                      ))}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            statusIsActive(item)
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              statusIsActive(item)
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {statusIsActive(item) ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            title="View details"
                            onClick={() => setViewingItem(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <FiEye size={16} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            title="Delete"
                            disabled={deletingId === (item._id || item.id)}
                            onClick={() => handleDelete(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT POPUP */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingItem
                    ? `Edit ${singular}`
                    : `Add ${singular}`}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Fill in the details below.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close form"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid max-h-[65vh] grid-cols-1 gap-5 overflow-y-auto p-6 sm:grid-cols-2">
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:col-span-2">
                    <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
                    <span>{error}</span>
                  </div>
                )}

                {fields.map(renderField)}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingItem
                      ? "Save Changes"
                      : `Create ${singular}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS POPUP */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Record details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {displayValue(
                    getValue(viewingItem, fields[0]?.name) ||
                      viewingItem.name ||
                      viewingItem.title
                  )}
                </h2>
              </div>

              <button
                onClick={() => setViewingItem(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={`rounded-xl bg-slate-50 p-4 ${
                    field.fullWidth ? "sm:col-span-2" : ""
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {field.label}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                    {displayValue(
                      getValue(viewingItem, field.name)
                    )}
                  </p>
                </div>
              ))}

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {statusIsActive(viewingItem) ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Record ID
                </p>

                <p className="mt-2 break-all text-xs font-semibold text-slate-700">
                  {viewingItem._id || viewingItem.id || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setViewingItem(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const item = viewingItem;
                  setViewingItem(null);
                  openEdit(item);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <FiEdit2 size={15} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManager;
