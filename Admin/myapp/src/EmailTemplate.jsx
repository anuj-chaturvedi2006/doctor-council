import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiMail,
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Heading,
  Link,
  List,
  BlockQuote,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import DOMPurify from "dompurify";

const API_URL = "https://doctor-council.onrender.com";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const emptyForm = {
  email: "",
  title: "",
  message: "",
};

const EmailTemplate = () => {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/get-emailtemps`,
        getAuthConfig()
      );

      setTemplates(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to fetch email templates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditingTemplate(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      email: item.email,
      title: item.title,
      message: item.message,
    });

    setEditingTemplate(item);
    setViewingTemplate(null);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const changeHandler = async (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      email: form.email.trim(),
      title: form.title.trim(),
      message: form.message,
    };

    const plainMessage = payload.message
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!payload.email || !payload.title || !plainMessage) {
      const message = "Please fill in all fields.";
      setError(message);
      toast.error(message);
      return;
    }

    setSaving(true);

    try {
      const response = editingTemplate
        ? await axios.put(
            `${API_URL}/update-emailtemp/${editingTemplate._id}`,
            payload,
            getAuthConfig()
          )
        : await axios.post(
            `${API_URL}/create-emailtemp`,
            payload,
            getAuthConfig()
          );

      toast.success(
        response.data.message ||
          (editingTemplate
            ? "Email template updated successfully."
            : "Email template created successfully.")
      );

      closeForm();
      await fetchTemplates();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to save email template. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete the template "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(
        `${API_URL}/delete-emailtemp/${item._id}`,
        getAuthConfig()
      );

      toast.success(
        response.data.message || "Email template deleted successfully."
      );

      if (viewingTemplate?._id === item._id) {
        setViewingTemplate(null);
      }

      await fetchTemplates();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to delete email template."
      );
    }
  };

  const filteredTemplates = templates.filter((item) => {
    const plainMessage = (item.message || "").replace(/<[^>]*>/g, " ");
    return `${item.email} ${item.title} ${plainMessage}`
      .toLowerCase()
      .includes(search.toLowerCase().trim());
  });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
              <FiMail size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Email Template Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Create and manage your email templates.
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FiPlus size={18} />
            Add Template
          </button>
        </div>

        {/* Total Templates */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Templates</p>

          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900">
              {templates.length}
            </h2>

            <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <FiMail size={22} />
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, title or message..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Template Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">Email Templates</h2>
            <p className="mt-1 text-sm text-slate-500">
              View, edit and delete your templates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">S.No.</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      Loading email templates...
                    </td>
                  </tr>
                )}

                {!loading && filteredTemplates.map((item, index) => (
                  <tr key={item._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500">{index + 1}</td>

                    <td className="px-5 py-4 font-medium text-slate-800">
                      {item.email}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.title}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-slate-600">
                      <div
                        className="line-clamp-2 max-w-xs break-words text-slate-600"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(item.message),
                        }}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          title="View"
                          onClick={() => setViewingTemplate(item)}
                          className="rounded-lg bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"
                        >
                          <FiEye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                        >
                          <FiEdit2 size={17} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                        >
                          <FiTrash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredTemplates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <FiMail className="mx-auto mb-3 text-3xl text-slate-300" />

                      <p className="font-semibold text-slate-700">
                        {search
                          ? "No matching templates found"
                          : "No templates added yet"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Click Add Template to create your first template.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTemplate ? "Edit Template" : "Add New Template"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the email template details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close form"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <FiAlertCircle />
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={changeHandler}
                    placeholder="Enter email address"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={changeHandler}
                    placeholder="Enter template title"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Message *
                  </label>

                  <div className="overflow-hidden rounded-xl border border-slate-200 focus-within:border-indigo-500">
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.message}
                      config={{
                        licenseKey: "GPL",
                        plugins: [
                          Essentials,
                          Paragraph,
                          Bold,
                          Italic,
                          Underline,
                          Heading,
                          Link,
                          List,
                          BlockQuote,
                        ],
                        toolbar: [
                          "undo",
                          "redo",
                          "|",
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "underline",
                          "|",
                          "link",
                          "bulletedList",
                          "numberedList",
                          "blockQuote",
                        ],
                        placeholder: "Write your email message...",
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();

                        setForm((prev) => ({
                          ...prev,
                          message: data,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingTemplate
                      ? "Update Template"
                      : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Template Details
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {viewingTemplate.title}
                </h2>
              </div>

              <button
                onClick={() => setViewingTemplate(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close details"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Email
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                  {viewingTemplate.email}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Title
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                  {viewingTemplate.title}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-400">
                  Message
                </p>

                <div
                  className="prose prose-sm mt-2 max-w-none break-words text-slate-700"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(viewingTemplate.message),
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setViewingTemplate(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => openEdit(viewingTemplate)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <FiEdit2 size={15} />
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default EmailTemplate;
