
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiEdit,
  FiX,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const API = "http://localhost:2002";

const CounsellorManagement = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // FETCH COUNSELLORS
  const fetchCounsellors = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/get-counsellors`,
        { headers }
      );

      if (res.data.success) {
        setCounsellors(res.data.data || []);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch counsellors"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCounsellors();
  }, [fetchCounsellors]);

  // INPUT HANDLER
  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditId(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (counsellor) => {
    setEditId(counsellor._id);

    setForm({
      name: counsellor.name || "",
      email: counsellor.email || "",
      phone: counsellor.phone || "",
      password: "",
    });

    setShowModal(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  // CREATE / UPDATE COUNSELLOR
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editId) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
        };

        // Password optional during edit
        if (form.password.trim()) {
          payload.password = form.password;
        }

        const res = await axios.put(
          `${API}/update-counsellor/${editId}`,
          payload,
          { headers }
        );

        if (res.data.success) {
          toast.success(res.data.message);
          closeModal();
          fetchCounsellors();
        }
      } else {
        const res = await axios.post(
          `${API}/create-counsellor`,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone,
            password: form.password,
          },
          { headers }
        );

        if (res.data.success) {
          toast.success(res.data.message);
          closeModal();
          fetchCounsellors();
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // ACTIVE / INACTIVE
  const toggleStatus = async (id, currentStatus) => {
    const action =
      currentStatus === "active" ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this counsellor?`
    );

    if (!confirmed) return;

    try {
      const res = await axios.put(
        `${API}/toggle-counsellor-status/${id}`,
        {},
        { headers }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchCounsellors();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Status update failed"
      );
    }
  };

  // SEARCH FILTER
  const filteredCounsellors = counsellors.filter((item) => {
    const searchValue = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(searchValue) ||
      item.email?.toLowerCase().includes(searchValue) ||
      item.phone?.toLowerCase().includes(searchValue)
    );
  });

  const activeCount = counsellors.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveCount = counsellors.filter(
    (item) => item.status !== "active"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">

      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
      />

      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Counsellor Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all counsellors and their account status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
        >
          <FiUserPlus />
          Add Counsellor
        </button>

      </div>

      {/* STATISTICS */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Counsellors
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {counsellors.length}
              </h2>
            </div>

            <div className="rounded-xl bg-indigo-100 p-3 text-2xl text-indigo-600">
              <FiUsers />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Counsellors
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {activeCount}
              </h2>
            </div>

            <div className="rounded-xl bg-green-100 p-3 text-2xl text-green-600">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Inactive / Blocked
              </p>

              <h2 className="mt-2 text-3xl font-bold text-red-600">
                {inactiveCount}
              </h2>
            </div>

            <div className="rounded-xl bg-red-100 p-3 text-2xl text-red-600">
              <FiXCircle />
            </div>
          </div>
        </div>

      </div>

      {/* TABLE SECTION */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* SEARCH */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">

          <h2 className="text-lg font-bold text-slate-800">
            All Counsellors
          </h2>

          <div className="flex flex-col gap-2 sm:flex-row">

            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search counsellor..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
              />
            </div>

            <button
              onClick={fetchCounsellors}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">S.No.</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Contact Details</th>
                <th className="px-5 py-4">Last Login</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-slate-500"
                  >
                    Loading counsellors...
                  </td>
                </tr>
              ) : filteredCounsellors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-slate-500"
                  >
                    No counsellors found.
                  </td>
                </tr>
              ) : (
                filteredCounsellors.map((item, index) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                          {item.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {item.role?.roleName || "Counsellor"}
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1 text-sm text-slate-600">

                        <p className="flex items-center gap-2">
                          <FiMail className="text-slate-400" />
                          {item.email}
                        </p>

                        <p className="flex items-center gap-2">
                          <FiPhone className="text-slate-400" />
                          {item.phone || "Not available"}
                        </p>

                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.lastLogin
                        ? new Date(item.lastLogin).toLocaleString()
                        : "Never logged in"}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : item.status === "blocked"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Counsellor"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                        >
                          <FiEdit />
                        </button>

                        <button
                          onClick={() =>
                            toggleStatus(item._id, item.status)
                          }
                          title={
                            item.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          className={`rounded-lg p-2 transition ${
                            item.status === "active"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {item.status === "active" ? (
                            <FiXCircle />
                          ) : (
                            <FiCheckCircle />
                          )}
                        </button>

                      </div>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          Showing {filteredCounsellors.length} of {counsellors.length} counsellors
        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editId ? "Edit Counsellor" : "Add Counsellor"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editId
                    ? "Update counsellor details"
                    : "Enter new counsellor information"}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={submitHandler} className="space-y-4 p-6">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={changeHandler}
                  placeholder="Enter counsellor name"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={changeHandler}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password {editId ? "(Leave blank to keep current)" : "*"}
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={changeHandler}
                  placeholder={
                    editId
                      ? "Enter new password (optional)"
                      : "Create password"
                  }
                  required={!editId}
                  minLength={editId ? undefined : 6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Please wait..."
                    : editId
                    ? "Update Counsellor"
                    : "Create Counsellor"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CounsellorManagement;
