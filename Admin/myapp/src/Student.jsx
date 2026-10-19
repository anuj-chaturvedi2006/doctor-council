import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiPhone,
  FiMail,
  FiShield,
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API = "http://localhost:2002";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  status: "active",
};

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token nahi mila. Please dobara login karo.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const getRoleNameFromUser = (user, roles = []) => {
  const role = user?.role;

  if (role && typeof role === "object") {
    return role.roleName || role.name || "";
  }

  const roleId = String(role || "");

  const matchedRole = roles.find(
    (item) => String(item._id || item.id || "") === roleId,
  );

  return matchedRole?.roleName || matchedRole?.name || "";
};

const Student = () => {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [addStudent, setAddStudent] = useState(false);

const [deleteModal, setDeleteModal] = useState(false);
const [studentToDelete, setStudentToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);


  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const showMessage = (type, text) => {
    if (type === "success") {
      toast.success(text);
    } else if (type === "error") {
      toast.error(text);
    } else {
      toast.info(text);
    }
  };

  // Logged-in user permissions
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const permissions =
    loggedInUser?.role?.permissions || loggedInUser?.permissions || {};

  const canAdd = permissions?.students?.create === true;
  const canView = permissions?.students?.view === true;
  const canUpdate = permissions?.students?.update === true;
  const canDelete = permissions?.students?.delete === true;
  // Load roles
  const getRoles = useCallback(async () => {
    const res = await axios.get(`${API}/get-role`, getAuthConfig());

    if (!(res.data.status || res.data.success)) {
      throw new Error(res.data.message || "Roles load nahi hue.");
    }

    const roleList = res.data.role || res.data.roles || [];
    const safeRoles = Array.isArray(roleList) ? roleList : [];

    setRoles(safeRoles);
    return safeRoles;
  }, []);

  // Load users
  const getStudents = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/get-user`, getAuthConfig());

      if (res.data.status || res.data.success) {
        const userList = res.data.user || res.data.users || [];
        setData(Array.isArray(userList) ? userList : []);
      } else {
        setData([]);
        showMessage("error", res.data.message || "Students load nahi hue.");
      }
    } catch (error) {
      console.error("Get students error:", error);
      setData([]);
      showMessage(
        "error",
        getErrorMessage(error, "Students fetch nahi ho paaye."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial loading
  useEffect(() => {
    const loadPage = async () => {
      try {
        await getRoles();
      } catch (error) {
        console.error("Get roles error:", error);
        showMessage("error", getErrorMessage(error, "Roles load nahi hue."));
      }

      await getStudents();
    };

    loadPage();
  }, [getRoles, getStudents]);

  // Find Student role
  const studentRole = useMemo(
    () =>
      roles.find(
        (role) =>
          String(role.roleName || role.name || "")
            .trim()
            .toLowerCase() === "student",
      ),
    [roles],
  );

  // Only Student-role users
  const students = useMemo(
    () =>
      data.filter(
        (user) =>
          getRoleNameFromUser(user, roles).trim().toLowerCase() === "student",
      ),
    [data, roles],
  );

  // Search students
  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return students;

    return students.filter((student) => {
      return (
        String(student.name || "")
          .toLowerCase()
          .includes(value) ||
        String(student.email || "")
          .toLowerCase()
          .includes(value) ||
        String(student.phone || "").includes(value)
      );
    });
  }, [students, search]);

  // Statistics
  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => String(student.status || "").toLowerCase() === "active",
  ).length;

  const inactiveStudents = students.filter(
    (student) => String(student.status || "").toLowerCase() === "inactive",
  ).length;

  const blockedStudents = students.filter(
    (student) => String(student.status || "").toLowerCase() === "blocked",
  ).length;

  // Form handler
  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Add modal
  const openAddModal = () => {
    if (!canAdd) {
      showMessage("error", "Aapko student add karne ki permission nahi hai.");
      return;
    }

    if (!studentRole) {
      showMessage(
        "error",
        "Student role nahi mila. Pehle Student role create karo.",
      );
      return;
    }

    setForm({
      ...emptyForm,
      role: String(studentRole._id || studentRole.id || ""),
    });

    setAddStudent(true);
  };

 
// Add Student
const handleAddStudent = async (e) => {
  e.preventDefault();

  if (!canAdd) {
    showMessage("error", "Aapko student add karne ki permission nahi hai.");
    return;
  }

  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();
  const password = form.password;

  // Required fields validation
  if (!name || !email || !phone || !password) {
    showMessage("error", "Saari required fields fill karo.");
    return;
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("error", "Valid email address enter karo.");
    return;
  }

  // Phone validation
  if (!/^\d{10}$/.test(phone)) {
    showMessage("error", "Phone number 10 digits ka hona chahiye.");
    return;
  }

  // Password validation
  if (password.length < 8) {
    showMessage("error", "Password minimum 8 characters ka hona chahiye.");
    return;
  }

  // Student role validation
  if (!studentRole?._id && !studentRole?.id) {
    showMessage("error", "Student role available nahi hai.");
    return;
  }

  setSaving(true);

  try {
    const res = await axios.post(
      `${API}/admin-user`,
      {
        name,
        email,
        phone,
        password,
        role: String(studentRole._id || studentRole.id),
      },
      getAuthConfig()
    );

    if (!(res.data.status || res.data.success)) {
      showMessage("error", res.data.message || "Student add nahi hua.");
      return;
    }

    setAddStudent(false);
    setForm(emptyForm);

    await getStudents();
    showMessage("success", "Student successfully add ho gaya.");
  } catch (error) {
    console.error("Add student error:", error);

    showMessage(
      "error",
      getErrorMessage(error, "Student add nahi ho paaya.")
    );
  } finally {
    setSaving(false);
  }
};

  // Open Edit modal
  const openEditModal = (student) => {
    if (!canUpdate) {
      showMessage(
        "error",
        "Aapko student update karne ki permission nahi hai.",
      );
      return;
    }

    setEditStudent(student);

    setForm({
      name: student.name || "",
      email: student.email || "",
      phone: String(student.phone || ""),
      password: "",
      role: String(studentRole?._id || studentRole?.id || ""),
      status: student.status || "active",
    });
  };

  // Update Student
  const handleEditStudent = async (e) => {
    e.preventDefault();

    if (!canUpdate || !editStudent) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !email || !phone) {
      showMessage("error", "Name, email aur phone required hain.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("error", "Valid email address enter karo.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      showMessage("error", "Phone number 10 digits ka hona chahiye.");
      return;
    }

    setSaving(true);

    try {
      // Existing backend route preserved
      const res = await axios.post(
        `${API}/admin-edit`,
        {
          _id: editStudent._id,
          name,
          email,
          phone,
          role: String(studentRole?._id || studentRole?.id || ""),
          status: form.status,
        },
        getAuthConfig(),
      );

      if (!(res.data.status || res.data.success)) {
        showMessage("error", res.data.message || "Student update nahi hua.");
        return;
      }

      const updatedUser = res.data.user;

      if (updatedUser) {
        setData((prev) =>
          prev.map((user) =>
            String(user._id || user.id) ===
            String(editStudent._id || editStudent.id)
              ? { ...user, ...updatedUser }
              : user,
          ),
        );
      } else {
        await getStudents();
      }

      setEditStudent(null);
      setForm(emptyForm);
      showMessage("success", "Student successfully update ho gaya.");
    } catch (error) {
      console.error("Edit student error:", error);
      showMessage(
        "error",
        getErrorMessage(error, "Student update nahi ho paaya."),
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (student) => {
    if (!canDelete) {
      showMessage(
        "error",
        "Aapko student delete karne ki permission nahi hai.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Kya aap "${student.name}" ko delete karna chahte ho?`,
    );

    if (!confirmed) return;

    const studentId = student._id || student.id;

    setDeletingId(studentId);

    try {
      // Existing backend route preserved
      const res = await axios.post(
        `${API}/admin-delete`,
        { id: studentId },
        getAuthConfig(),
      );

      if (!(res.data.status || res.data.success)) {
        showMessage("error", res.data.message || "Student delete nahi hua.");
        return;
      }

      setData((prev) =>
        prev.filter(
          (user) => String(user._id || user.id) !== String(studentId),
        ),
      );

      if (
        String(selectedStudent?._id || selectedStudent?.id) ===
        String(studentId)
      ) {
        setSelectedStudent(null);
      }

      showMessage("success", "Student successfully delete ho gaya.");
    } catch (error) {
      console.error("Delete student error:", error);
      showMessage(
        "error",
        getErrorMessage(error, "Student delete nahi ho paaya."),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const closeAddModal = () => {
    if (saving) return;
    setAddStudent(false);
    setForm(emptyForm);
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditStudent(null);
    setForm(emptyForm);
  };

  const statusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "inactive":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "blocked":
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
      default:
        return "bg-slate-100 text-slate-600 ring-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Administration / Students
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Student Management
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Manage student accounts, review their details, and maintain student
            status from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={getStudents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={17} />
            Refresh
          </button>

          {canAdd && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <FiPlus size={18} />
              Add Student
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="All student accounts"
          icon={<FiUsers size={22} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active Students"
          value={activeStudents}
          subtitle="Currently active"
          icon={<FiUserCheck size={22} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive Students"
          value={inactiveStudents}
          subtitle="Currently inactive"
          icon={<FiUserX size={22} />}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Blocked Students"
          value={blockedStudents}
          subtitle="Blocked accounts"
          icon={<FiShield size={22} />}
          iconClass="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">All Students</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {!studentRole && !loading && (
          <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Student role nahi mila. Pehle Role Management mein exact{" "}
            <strong>Student</strong> role create karo.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {["#", "Student", "Contact", "Role", "Status", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                        heading === "Actions" ? "text-center" : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                      <FiRefreshCw className="animate-spin" size={19} />
                      Loading students...
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const studentId = student._id || student.id;

                  return (
                    <tr
                      key={studentId || index}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5 text-sm text-slate-400">
                        {index + 1}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold uppercase text-blue-600">
                            {student.name?.trim()?.charAt(0) || "S"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {student.name || "Unnamed Student"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Student account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <span className="flex items-center gap-2 text-sm text-slate-600">
                            <FiMail
                              className="shrink-0 text-slate-400"
                              size={14}
                            />
                            {student.email || "No email"}
                          </span>

                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            <FiPhone
                              className="shrink-0 text-slate-400"
                              size={14}
                            />
                            {student.phone || "No phone"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          <FiShield size={13} />
                          Student
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusStyle(
                            student.status,
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {student.status
                            ? student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          {canView && (
                            <ActionButton
                              title="View student"
                              onClick={() => setSelectedStudent(student)}
                              className="border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <FiEye size={16} />
                            </ActionButton>
                          )}

                          {canUpdate && (
                            <ActionButton
                              title="Edit student"
                              onClick={() => openEditModal(student)}
                              className="border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            >
                              <FiEdit2 size={16} />
                            </ActionButton>
                          )}

                          {canDelete && (
                            <ActionButton
                              title="Delete student"
                              disabled={deletingId === studentId}
                              onClick={() => handleDeleteStudent(student)}
                              className="border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              {deletingId === studentId ? (
                                <FiRefreshCw
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                <FiTrash2 size={16} />
                              )}
                            </ActionButton>
                          )}

                          {!canView && !canUpdate && !canDelete && (
                            <span className="text-xs text-slate-400">
                              No actions allowed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FiUsers size={25} />
                      </div>

                      <h3 className="font-semibold text-slate-700">
                        No students found
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {search
                          ? "Try a different search term."
                          : "There are no Student-role users to display yet."}
                      </p>

                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredStudents.length} of {totalStudents} students
          </span>
          <span>Student Management</span>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selectedStudent && (
        <Modal
          title="Student Details"
          subtitle="Review student account information."
          onClose={() => setSelectedStudent(null)}
        >
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold uppercase text-blue-700">
              {selectedStudent.name?.trim()?.charAt(0) || "S"}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-slate-800">
                {selectedStudent.name || "Unnamed Student"}
              </h3>
              <p className="mt-1 break-all text-sm text-slate-500">
                {selectedStudent.email || "No email"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailItem label="Full Name" value={selectedStudent.name} />
            <DetailItem label="Email" value={selectedStudent.email} />
            <DetailItem label="Phone" value={selectedStudent.phone} />
            <DetailItem label="Role" value="Student" />
            <DetailItem
              label="Status"
              value={selectedStudent.status || "Unknown"}
            />
            <DetailItem
              label="Email Verified"
              value={
                selectedStudent.isEmailVerified ? "Verified" : "Not verified"
              }
            />
            <DetailItem
              label="Phone Verified"
              value={
                selectedStudent.isPhoneVerified ? "Verified" : "Not verified"
              }
            />
            <DetailItem
              label="Last Login"
              value={
                selectedStudent.lastLogin
                  ? new Date(selectedStudent.lastLogin).toLocaleString()
                  : "Not available"
              }
            />
          </div>

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* ADD MODAL */}
      {addStudent && (
        <Modal
          title="Add New Student"
          subtitle="Create an account with the Student role."
          onClose={closeAddModal}
          busy={saving}
        >
          <form onSubmit={handleAddStudent}>
            <StudentFormFields
              form={form}
              changeHandler={changeHandler}
              includePassword
            />

            <ModalActions
              busy={saving}
              onCancel={closeAddModal}
              submitText="Add Student"
              busyText="Adding..."
            />
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editStudent && (
        <Modal
          title="Edit Student"
          subtitle="Update student information and status."
          onClose={closeEditModal}
          busy={saving}
        >
          <form onSubmit={handleEditStudent}>
            <StudentFormFields
              form={form}
              changeHandler={changeHandler}
              includeStatus
            />

            <ModalActions
              busy={saving}
              onCancel={closeEditModal}
              submitText="Update Student"
              busyText="Updating..."
            />
          </form>
        </Modal>
      )}
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, iconClass }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
          {value}
        </h2>
        <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ActionButton = ({
  children,
  onClick,
  title,
  disabled = false,
  className = "",
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Modal = ({ title, subtitle, children, onClose, busy = false }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !busy) onClose();
    }}
  >
    <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Close modal"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">{children}</div>
    </div>
  </div>
);

const StudentFormFields = ({
  form,
  changeHandler,
  includePassword = false,
  includeStatus = false,
}) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
    <FormField label="Full Name" required>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={changeHandler}
        placeholder="Enter student name"
        autoComplete="name"
        required
        className={inputClass}
      />
    </FormField>

    <FormField label="Email Address" required>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={changeHandler}
        placeholder="student@example.com"
        autoComplete="email"
        required
        className={inputClass}
      />
    </FormField>

    <FormField label="Phone Number" required>
      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
          changeHandler({
            target: { name: "phone", value },
          });
        }}
        placeholder="10-digit phone number"
        inputMode="numeric"
        maxLength={10}
        required
        className={inputClass}
      />
    </FormField>

    {includePassword && (
      <FormField label="Password" required>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={changeHandler}
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
          className={inputClass}
        />
      </FormField>
    )}

    {includeStatus && (
      <FormField label="Student Status" required>
        <select
          name="status"
          value={form.status}
          onChange={changeHandler}
          required
          className={inputClass}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </FormField>
    )}

    <div className="sm:col-span-2">
      <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <FiShield className="shrink-0" size={17} />
        <span>
          Role: <strong>Student</strong>. The role is assigned automatically.
        </span>
      </div>
    </div>
  </div>
);

const FormField = ({ label, required = false, children }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const ModalActions = ({ busy, onCancel, submitText, busyText }) => (
  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
    <button
      type="button"
      onClick={onCancel}
      disabled={busy}
      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={busy}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && <FiRefreshCw className="animate-spin" size={16} />}
      {busy ? busyText : submitText}
    </button>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-2 break-words text-sm font-medium text-slate-700">
      {value === undefined || value === null || value === ""
        ? "—"
        : String(value)}
    </p>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50";

export default Student;
