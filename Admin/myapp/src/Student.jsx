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
  FiUploadCloud,
  FiDownload,

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

  // Pagination: 10 students per page
const [currentPage, setCurrentPage] = useState(1);
const [totalPage, setTotalPage] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);

const studentsPerPage = 10;

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

  // Bulk Excel import state
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

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


  // Logged-in user permissions
  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const permissions =
    loggedInUser?.role?.permissions ||
    loggedInUser?.permissions ||
    {};

  // SuperAdmin detection
  const loggedInRoleName = getRoleNameFromUser(
    loggedInUser,
    roles
  );

  const isSuperAdmin =
    loggedInRoleName.replace(/\s+/g, "").toLowerCase() ===
    "superadmin";

  // Permission checks
  const canAdd = isSuperAdmin || permissions?.students?.create === true;
  const canView = isSuperAdmin || permissions?.students?.view === true;
  const canUpdate = isSuperAdmin || permissions?.students?.update === true;
  const canDelete = isSuperAdmin || permissions?.students?.delete === true;

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

const getStudents = useCallback(async (page = 1) => {
  setLoading(true);

  try {
    const res = await axios.get(
      `${API}/get-user?page=${page}&limit=${studentsPerPage}`,
      getAuthConfig()
    );

    if (res.data.success || res.data.status) {
      const userList = res.data.user || res.data.users || [];

      setData(Array.isArray(userList) ? userList : []);

      setCurrentPage(res.data.pagination?.currentPage || page);

      setTotalPage(res.data.pagination?.totalPages || 1);

      setTotalRecords(res.data.pagination?.totalUsers || 0);
    } else {
      setData([]);
      showMessage("error", res.data.message || "Students load nahi hue.");
    }
  } catch (error) {
    console.error("Get students error:", error);

    setData([]);

    showMessage(
      "error",
      getErrorMessage(error, "Students fetch nahi ho paaye.")
    );
  } finally {
    setLoading(false);
  }
}, []);

  // Download the Excel template from the backend
  const handleDownloadTemplate = async () => {
    if (!canAdd) {
      showMessage("error", "Aapko student add karne ki permission nahi hai.");
      return;
    }

    try {
      const res = await axios.get(`${API}/admin-users/bulk-template`, {
        ...getAuthConfig(),
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "students-template.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
      showMessage("success", "Excel template download ho gaya.");
    } catch (error) {
      console.error("Download template error:", error);
      showMessage("error", getErrorMessage(error, "Excel template download nahi ho paaya."));
    }
  };

  // Upload Excel file and import students
  const handleBulkImport = async (e) => {
    e.preventDefault();

    if (!canAdd) {
      showMessage("error", "Aapko student add karne ki permission nahi hai.");
      return;
    }
    if (!bulkFile) {
      showMessage("error", "Pehle .xlsx file select karo.");
      return;
    }
    if (!bulkFile.name.toLowerCase().endsWith(".xlsx")) {
      showMessage("error", "Sirf .xlsx Excel file upload kar sakte ho.");
      return;
    }

    const formData = new FormData();
    formData.append("file", bulkFile);
    setBulkUploading(true);
    setBulkResult(null);

    try {
      const res = await axios.post(
        `${API}/admin-users/bulk-import`,
        formData,
        getAuthConfig(),
      );
      const result = res.data;
      setBulkResult(result);

      if (result.status) {
        await getStudents();
        const summary = result.summary || {};
        showMessage(
          summary.failed > 0 ? "info" : "success",
          `Import complete: ${summary.added || 0} added, ${summary.failed || 0} failed.`,
        );
      } else {
        showMessage("error", result.message || "Bulk import failed.");
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      showMessage("error", getErrorMessage(error, "Excel import nahi ho paaya."));
    } finally {
      setBulkUploading(false);
    }
  };

  const openBulkModal = () => {
    if (!canAdd) {
      showMessage("error", "Aapko student add karne ki permission nahi hai.");
      return;
    }
    setBulkFile(null);
    setBulkResult(null);
    setBulkModal(true);
  };

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

  // Keep the current page valid when search results change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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

  // Delete Student: open a custom confirmation modal first
  const handleDeleteStudent = (student) => {
    if (!canDelete) {
      showMessage("error", "Aapko student delete karne ki permission nahi hai.");
      return;
    }
    setStudentToDelete(student);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal(false);
    setStudentToDelete(null);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete || deleting) return;

    const studentId = studentToDelete._id || studentToDelete.id;
    setDeleting(true);
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
        prev.filter((user) => String(user._id || user.id) !== String(studentId)),
      );

      if (
        String(selectedStudent?._id || selectedStudent?.id) === String(studentId)
      ) {
        setSelectedStudent(null);
      }

      setDeleteModal(false);
      setStudentToDelete(null);
      showMessage("success", "Student successfully delete ho gaya.");
    } catch (error) {
      console.error("Delete student error:", error);
      showMessage("error", getErrorMessage(error, "Student delete nahi ho paaya."));
    } finally {
      setDeleting(false);
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

            <>
              <button

                type="button"

                onClick={openBulkModal}

                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"

              >

                <FiUploadCloud size={17} />

                Bulk Import

              </button>

              <button

                type="button"

                onClick={openAddModal}

              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
               
            >

              <FiPlus size={18} />

              Add Student
            </button>
            </>
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

                paginatedStudents.map((student, index) => {

                  const studentId = student._id || student.id;

                  return (

                    <tr

                      key={studentId || index}

                      className="transition hover:bg-slate-50/80"

                    >

                      <td className="px-6 py-5 text-sm text-slate-400">

                        {startIndex + index + 1}

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

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">
            Showing {filteredStudents.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + studentsPerPage, filteredStudents.length)} of {filteredStudents.length} matching students ({totalStudents} total)
          </span>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || filteredStudents.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="whitespace-nowrap px-2 text-sm text-slate-600">
              Page {filteredStudents.length === 0 ? 0 : currentPage} of {filteredStudents.length === 0 ? 0 : totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages || filteredStudents.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
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
      {/* BULK IMPORT MODAL */}
      {bulkModal && (
        <Modal
          title="Bulk Import Students"
          subtitle="Upload an Excel .xlsx file to create multiple Student accounts."
          onClose={() => {
            if (!bulkUploading) {
              setBulkModal(false);
              setBulkFile(null);
              setBulkResult(null);
            }
          }}
          busy={bulkUploading}
        >
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Excel file requirements</p>
            <p className="mt-1 leading-6">
              Required columns: <strong>name</strong>, <strong>email</strong>,{" "}
              <strong>phone</strong>, and <strong>password</strong>. Maximum
              500 rows per upload and file size 5 MB.
            </p>
            <p className="mt-2 leading-6">
              Use temporary passwords and share them securely with students.
              Do not upload real student data to a public or test spreadsheet.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"
            >
              <FiDownload size={16} />
              Download Excel Template
            </button>
          </div>
          <form onSubmit={handleBulkImport}>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Select Excel file (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                setBulkFile(e.target.files?.[0] || null);
                setBulkResult(null);
              }}
              disabled={bulkUploading}
              className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
            />
            {bulkFile && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <FiCheckCircle className="shrink-0 text-emerald-600" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">{bulkFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(bulkFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  disabled={bulkUploading}
                  onClick={() => {
                    setBulkFile(null);
                    setBulkResult(null);
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <FiX size={17} />
                </button>
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setBulkModal(false);
                  setBulkFile(null);
                  setBulkResult(null);
                }}
                disabled={bulkUploading}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!bulkFile || bulkUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bulkUploading ? (
                  <FiRefreshCw className="animate-spin" size={16} />
                ) : (
                  <FiUploadCloud size={17} />
                )}
                {bulkUploading ? "Importing..." : "Import Students"}
              </button>
            </div>
          </form>
          {bulkResult?.summary && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="font-bold text-slate-800">Import Summary</h3>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-100 p-3">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="mt-1 text-2xl font-bold text-slate-800">{bulkResult.summary.total ?? 0}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Added</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{bulkResult.summary.added ?? 0}</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3">
                  <p className="text-xs text-rose-700">Failed</p>
                  <p className="mt-1 text-2xl font-bold text-rose-700">{bulkResult.summary.failed ?? 0}</p>
                </div>
              </div>
              {Array.isArray(bulkResult.results) && bulkResult.results.length > 0 && (
                <div className="mt-4 max-h-64 overflow-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 font-semibold text-slate-600">Row</th>
                        <th className="px-3 py-3 font-semibold text-slate-600">Student</th>
                        <th className="px-3 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-3 py-3 font-semibold text-slate-600">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkResult.results.map((item, index) => (
                        <tr key={`${item.row}-${item.email}-${index}`}>
                          <td className="px-3 py-2 text-slate-500">{item.row}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-700">{item.name || "—"}</p>
                            <p className="text-xs text-slate-500">{item.email || "—"}</p>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              item.status === "success"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && studentToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeleteModal();
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={deleting}
              aria-label="Close delete confirmation"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiX size={21} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <FiTrash2 size={28} />
            </div>

            <h2 id="delete-student-title" className="mt-5 text-center text-xl font-bold text-slate-800">
              Delete Student?
            </h2>
            <p className="mt-3 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                {studentToDelete.name || "this student"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <FiRefreshCw size={16} className="animate-spin" />}
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
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

        placeholder="student\@example.com"

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
