
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiLayers,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";

const API = "http://localhost:2002";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  };
};

const emptyForm = {
  name: "",
  slug: "",
  code: "",
  description: "",
  status: "active",
  parentStream: "",
  displayOrder: 0,
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

const Stream = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [viewingStream, setViewingStream] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);
  };

  // GET STREAMS
  const getStreams = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        `${API}/get-streams`,
        getAuthConfig()
      );

      setStreams(
        Array.isArray(res.data?.streams)
          ? res.data.streams
          : []
      );
    } catch (err) {
      showNotice(
        getErrorMessage(err, "Unable to fetch streams."),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStreams();
  }, []);

  // AUTO-GENERATE SLUG FROM NAME
  const makeSlug = (value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  // FORM INPUT HANDLER
  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !editingStream
        ? { slug: makeSlug(value) }
        : {}),
    }));
  };

  // OPEN ADD FORM
  const openAdd = () => {
    setEditingStream(null);
    setForm({ ...emptyForm });
    setError("");
    setNotice("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEdit = (stream) => {
    setEditingStream(stream);

    setForm({
      name: stream.name || "",
      slug: stream.slug || "",
      code: stream.code || "",
      description: stream.description || "",
      status: stream.status || "active",
      parentStream:
        stream.parentStream?._id ||
        stream.parentStream ||
        "",
      displayOrder: stream.displayOrder ?? 0,
    });

    setError("");
    setNotice("");
    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingStream(null);
    setError("");
  };

  // CREATE / UPDATE STREAM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || makeSlug(form.name),
        code: form.code.trim(),
        description: form.description.trim(),
        status: form.status,
        displayOrder: Number(form.displayOrder) || 0,
        parentStream: form.parentStream || null,
      };

      if (!payload.name) {
        setError("Please enter stream name.");
        return;
      }

      if (!payload.slug) {
        setError("Please enter a valid stream name or slug.");
        return;
      }

      if (
        editingStream &&
        (editingStream._id || editingStream.id) ===
          payload.parentStream
      ) {
        setError("A stream cannot be its own parent.");
        return;
      }

      if (editingStream) {
        const id = editingStream._id || editingStream.id;

        await axios.put(
          `${API}/update-stream/${id}`,
          payload,
          getAuthConfig()
        );

        showNotice("Stream updated successfully.");
      } else {
        await axios.post(
          `${API}/create-stream`,
          payload,
          getAuthConfig()
        );

        showNotice("Stream created successfully.");
      }

      setShowForm(false);
      setEditingStream(null);
      setForm({ ...emptyForm });

      await getStreams();
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to save stream.")
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE STREAM
  const handleDelete = async (stream) => {
    const id = stream._id || stream.id;

    if (!id || deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${stream.name}"?\n\nStreams used by degrees or courses may not be deletable.`
    );

    if (!confirmed) return;

    setDeletingId(id);
    setNotice("");

    try {
      await axios.delete(
        `${API}/delete-stream/${id}`,
        getAuthConfig()
      );

      setStreams((prev) =>
        prev.filter((item) => (item._id || item.id) !== id)
      );

      if (
        viewingStream &&
        (viewingStream._id || viewingStream.id) === id
      ) {
        setViewingStream(null);
      }

      showNotice("Stream deleted successfully.");
    } catch (err) {
      showNotice(
        getErrorMessage(err, "Unable to delete stream."),
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH AND FILTER
  const filteredStreams = streams.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        item.name,
        item.slug,
        item.code,
        item.description,
        item.parentStream?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = streams.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveCount = streams.filter(
    (item) => item.status === "inactive"
  ).length;

  // PARENT STREAM OPTIONS
  const parentOptions = streams.filter(
    (item) =>
      (item._id || item.id) !==
      (editingStream?._id || editingStream?.id)
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
              <FiLayers size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Stream Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create, organize and manage academic streams.
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <FiPlus size={18} />
            Add Stream
          </button>
        </div>

        {/* NOTIFICATION */}
        {notice && (
          <div
            className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
              noticeType === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {noticeType === "error" ? (
                <FiAlertCircle className="mt-0.5 shrink-0" />
              ) : (
                <FiCheckCircle className="mt-0.5 shrink-0" />
              )}

              <span>{notice}</span>
            </div>

            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <FiX />
            </button>
          </div>
        )}

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Streams
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-slate-900">
                {streams.length}
              </h2>

              <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <FiLayers size={21} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Active Streams
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-emerald-600">
                {activeCount}
              </h2>

              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <FiCheckCircle size={21} />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Inactive Streams
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-rose-600">
                {inactiveCount}
              </h2>

              <span className="rounded-xl bg-rose-50 p-3 text-rose-600">
                <FiXCircle size={21} />
              </span>
            </div>
          </div>
        </div>

        {/* STREAM TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Streams
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredStreams.length} of {streams.length} streams
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search streams..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:w-64"
                />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-700 outline-none focus:border-indigo-500 sm:w-40"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                onClick={getStreams}
                disabled={loading}
                title="Refresh"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiRefreshCw
                  className={loading ? "animate-spin" : ""}
                  size={17}
                />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Stream</th>
                  <th className="px-5 py-4 font-semibold">Slug</th>
                  <th className="px-5 py-4 font-semibold">Code</th>
                  {/* <th className="px-5 py-4 font-semibold">Parent Stream</th> */}
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      <FiRefreshCw
                        className="mx-auto mb-3 animate-spin"
                        size={24}
                      />
                      Loading streams...
                    </td>
                  </tr>
                ) : filteredStreams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400">
                          <FiLayers size={25} />
                        </div>

                        <p className="font-semibold text-slate-700">
                          No streams found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Try changing your search or add a new stream.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStreams.map((item) => (
                    <tr
                      key={item._id || item.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FiLayers size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {item.name}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                              {item.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.slug || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.code || "—"}
                      </td>

                      {/* <td className="px-5 py-4 text-slate-600">
                        {item.parentStream?.name ||
                          (item.parentStream ? "Parent stream" : "—")}
                      </td> */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === "active"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />

                          {item.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            title="View details"
                            onClick={() => setViewingStream(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <FiEye size={16} />
                          </button>

                          <button
                            title="Edit stream"
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            title="Delete stream"
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

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeForm();
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingStream ? "Edit Stream" : "Add New Stream"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the stream details below.
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

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Stream Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={changeHandler}
                    placeholder="e.g. Science"
                    required
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Slug *
                  </label>

                  <input
                    name="slug"
                    value={form.slug}
                    onChange={changeHandler}
                    placeholder="e.g. science"
                    required
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Stream Code
                  </label>

                  <input
                    name="code"
                    value={form.code}
                    onChange={changeHandler}
                    placeholder="e.g. SCI"
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <div className="relative">
                    <select
                      name="status"
                      value={form.status}
                      onChange={changeHandler}
                      disabled={saving}
                      className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 mt-1 text-slate-400" />
                  </div>
                </div>
{/* 
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Parent Stream
                  </label>

                  <div className="relative">
                    <select
                      name="parentStream"
                      value={form.parentStream}
                      onChange={changeHandler}
                      disabled={saving}
                      className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                    >
                      <option value="">No parent stream</option>

                      {parentOptions.map((item) => (
                        <option
                          key={item._id || item.id}
                          value={item._id || item.id}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 mt-1 text-slate-400" />
                  </div>
                </div> */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="displayOrder"
                    min="0"
                    value={form.displayOrder}
                    onChange={changeHandler}
                    disabled={saving}
                    placeholder="e.g. 1"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={changeHandler}
                    placeholder="Enter stream description..."
                    rows={4}
                    disabled={saving}
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
                  />
                </div>
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <FiRefreshCw className="animate-spin" size={16} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingStream
                      ? "Save Changes"
                      : "Create Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewingStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Stream Details
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {viewingStream.name}
                </h2>
              </div>

              <button
                onClick={() => setViewingStream(null)}
                aria-label="Close details"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              {[
                ["Stream Name", viewingStream.name],
                ["Slug", viewingStream.slug],
                ["Code", viewingStream.code],
                [
                  "Parent Stream",
                  viewingStream.parentStream?.name ||
                    (viewingStream.parentStream ? "Parent stream" : "None"),
                ],
                ["Display Order", viewingStream.displayOrder ?? 0],
                ["Status", viewingStream.status || "active"],
                ["Description", viewingStream.description || "No description"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={`rounded-xl bg-slate-50 p-4 ${
                    label === "Description" ? "sm:col-span-2" : ""
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                    {value === null || value === undefined || value === ""
                      ? "—"
                      : String(value)}
                  </p>
                </div>
              ))}

              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Record ID
                </p>

                <p className="mt-2 break-all text-xs font-semibold text-slate-700">
                  {viewingStream._id || viewingStream.id || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setViewingStream(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const item = viewingStream;
                  setViewingStream(null);
                  openEdit(item);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <FiEdit2 size={15} />
                Edit Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stream;
