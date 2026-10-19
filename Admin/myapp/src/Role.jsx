import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiLock,
  FiUsers,
  FiBookOpen,
  FiLayers,
  FiCheck,
} from "react-icons/fi";

const API = "http://localhost:2002";

const MODULES = [
  { key: "students", label: "Student Permissions", icon: FiUsers },
  { key: "courses", label: "Course Permissions", icon: FiBookOpen },
  { key: "degrees", label: "Degree Permissions", icon: FiLayers },
  { key: "streams", label: "Stream Permissions", icon: FiLayers },
  {
    key: "colleges",
    label: "College Permissions",
    icon: FiBookOpen,
  },
  {
    key: "specializations",
    label: "Specialization Permissions",
    icon: FiBookOpen,
  },
];

const ACTIONS = [
  { key: "create", label: "Create" },
  { key: "view", label: "View" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
];

// Role creation is ALWAYS reserved for SuperAdmin.
// The roles.create checkbox is deliberately disabled.
const createEmptyPermissions = () =>
  Object.fromEntries(
    MODULES.map(({ key }) => [
      key,
      {
        create: false,
        view: false,
        update: false,
        delete: false,
      },
    ]),
  );

const normalizePermissions = (permissions = {}) => {
  const result = createEmptyPermissions();

  MODULES.forEach(({ key }) => {
    ACTIONS.forEach(({ key: action }) => {
      result[key][action] = permissions?.[key]?.[action] === true;
    });
  });

  return result;
};

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const getEnabledCount = (permissions = {}) => {
  return MODULES.reduce((total, module) => {
    return (
      total +
      ACTIONS.filter(
        (action) => permissions?.[module.key]?.[action.key] === true,
      ).length
    );
  }, 0);
};

const Role = () => {
  const [roles, setRoles] = useState([]);
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState("active");
  const [permissions, setPermissions] = useState(createEmptyPermissions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [viewRole, setViewRole] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  // GET ROLES
  const getRoles = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/get-role`, getAuthConfig());

      if (res.data.status) {
        setRoles(res.data.role || []);
      } else {
        showMessage("error", res.data.message || "Roles could not be loaded.");
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Server se roles fetch nahi ho paaye.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  // RESET ADD FORM
  const openAddModal = () => {
    setRoleName("");
    setRoleStatus("active");
    setPermissions(createEmptyPermissions());
    setMessage({ type: "", text: "" });
    setShowAdd(true);
  };

  const closeAddModal = () => {
    if (saving) return;

    setShowAdd(false);
    setRoleName("");
    setPermissions(createEmptyPermissions());
  };

  // CHANGE ADD PERMISSION
  const handlePermissionChange = (moduleName, action, checked) => {
    if (moduleName === "roles" && action === "create") return;

    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: checked,
      },
    }));
  };

  // SELECT / DESELECT ALL PERMISSIONS FOR A MODULE
  const toggleModulePermissions = (moduleName, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        create: moduleName === "roles" ? false : checked,
        view: checked,
        update: checked,
        delete: checked,
      },
    }));
  };

  // SELECT / DESELECT ALL PERMISSIONS
  const toggleAllPermissions = (checked) => {
    setPermissions((prev) => {
      const next = { ...prev };

      MODULES.forEach(({ key }) => {
        next[key] = {
          create: key === "roles" ? false : checked,
          view: checked,
          update: checked,
          delete: checked,
        };
      });

      return next;
    });
  };

  // ADD ROLE
  const addRole = async () => {
    const trimmedName = roleName.trim();

    if (!trimmedName) {
      showMessage("error", "Please enter role name.");
      return;
    }

    if (
      roles.some(
        (role) => role.roleName?.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      showMessage("error", "This role already exists.");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post(
        `${API}/add-role`,
        {
          roleName: trimmedName,
          status: roleStatus,
          permissions: normalizePermissions(permissions),
        },
        getAuthConfig(),
      );

      if (res.data.status || res.data.success) {
        if (res.data.role) {
          setRoles((prev) => [
            res.data.role,
            ...prev.filter((role) => role._id !== res.data.role._id),
          ]);
        } else {
          await getRoles();
        }

        setShowAdd(false);
        setRoleName("");
        setPermissions(createEmptyPermissions());

        showMessage("success", "Role created successfully.");
      } else {
        showMessage("error", res.data.message || "Role could not be created.");
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Role could not be created.",
      );
    } finally {
      setSaving(false);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (role) => {
    setMessage({ type: "", text: "" });

    setEditRole({
      _id: role._id,
      roleName: role.roleName || "",
      status: role.status || "active",
      permissions: normalizePermissions(role.permissions),
    });
  };

  // CHANGE EDIT PERMISSION
  const handleEditPermissionChange = (moduleName, action, checked) => {
    if (moduleName === "roles" && action === "create") return;

    setEditRole((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          ...prev.permissions[moduleName],
          [action]: checked,
        },
      },
    }));
  };

  const toggleEditModulePermissions = (moduleName, checked) => {
    setEditRole((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleName]: {
          create: moduleName === "roles" ? false : checked,
          view: checked,
          update: checked,
          delete: checked,
        },
      },
    }));
  };

  const toggleEditAllPermissions = (checked) => {
    setEditRole((prev) => {
      const next = { ...prev.permissions };

      MODULES.forEach(({ key }) => {
        next[key] = {
          create: key === "roles" ? false : checked,
          view: checked,
          update: checked,
          delete: checked,
        };
      });

      return { ...prev, permissions: next };
    });
  };

  // UPDATE ROLE
  const updateRole = async () => {
    const trimmedName = editRole?.roleName?.trim();

    if (!trimmedName) {
      showMessage("error", "Please enter role name.");
      return;
    }

    if (
      roles.some(
        (role) =>
          role._id !== editRole._id &&
          role.roleName?.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      showMessage("error", "This role already exists.");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post(
        `${API}/edit-role`,
        {
          _id: editRole._id,
          roleName: trimmedName,
          status: editRole.status,
          permissions: normalizePermissions(editRole.permissions),
        },
        getAuthConfig(),
      );

      if (res.data.status || res.data.success) {
        const updatedRole = {
          ...editRole,
          ...(res.data.role || {}),
          roleName: trimmedName,
          status: editRole.status,
          permissions: normalizePermissions(
            res.data.role?.permissions ?? editRole.permissions,
          ),
        };

        setRoles((prev) =>
          prev.map((role) => (role._id === editRole._id ? updatedRole : role)),
        );

        setEditRole(null);
        showMessage("success", "Role updated successfully.");
      } else {
        showMessage("error", res.data.message || "Role could not be updated.");
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Role could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE ROLE
  const deleteRole = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this role?",
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const res = await axios.post(
        `${API}/delete-role`,
        { id },
        getAuthConfig(),
      );

      if (res.data.status || res.data.success) {
        setRoles((prev) => prev.filter((role) => role._id !== id));

        if (viewRole?._id === id) setViewRole(null);

        showMessage("success", "Role deleted successfully.");
      } else {
        showMessage("error", res.data.message || "Role could not be deleted.");
      }
    } catch (error) {
      console.error(error);
      showMessage(
        "error",
        error.response?.data?.message || "Role could not be deleted.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // SEARCH + STATUS FILTER
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // SuperAdmin ko list mein show nahi karna
      const isSuperAdmin =
        role.roleName?.replace(/\s+/g, "").toLowerCase() === "superadmin";

      const matchesSearch = role.roleName
        ?.toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesStatus =
        statusFilter === "all" || role.status === statusFilter;

      return !isSuperAdmin && matchesSearch && matchesStatus;
    });
  }, [roles, search, statusFilter]);

  const totalRoles = roles.length;

  const activeRoles = roles.filter((role) => role.status === "active").length;

  const inactiveRoles = roles.filter(
    (role) => role.status === "inactive",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Administration / Access Control
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Role Management
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Manage system roles and assign module-wise permissions to users.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
        >
          <FiPlus size={18} />
          Add New Role
        </button>
      </div>

      {/* MESSAGE */}
      {message.text && (
        <div
          role="alert"
          className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {message.type === "success" ? (
              <FiCheckCircle size={18} />
            ) : (
              <FiAlertCircle size={18} />
            )}
            {message.text}
          </div>

          <button
            type="button"
            onClick={() => setMessage({ type: "", text: "" })}
            className="rounded-lg p-1 hover:bg-black/5"
            aria-label="Close message"
          >
            <FiX size={17} />
          </button>
        </div>
      )}

      {/* STATS */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Roles"
          value={totalRoles}
          subtitle="All system roles"
          icon={<FiShield size={22} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Active Roles"
          value={activeRoles}
          subtitle="Currently available"
          icon={<FiCheckCircle size={22} />}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Inactive Roles"
          value={inactiveRoles}
          subtitle="Currently disabled"
          icon={<FiXCircle size={22} />}
          iconClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">All Roles</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredRoles.length} role(s) found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              aria-label="Filter roles by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Role Name
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Permissions
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <FiRefreshCw className="animate-spin" size={18} />
                      Loading roles...
                    </div>
                  </td>
                </tr>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((role, index) => {
                  const enabled = getEnabledCount(
                    normalizePermissions(role.permissions),
                  );

                  return (
                    <tr
                      key={role._id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FiShield size={19} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {role.roleName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              System role
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => setViewRole(role)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          <FiLock size={14} />
                          {enabled} permissions
                          <FiEye size={14} />
                        </button>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            role.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              role.status === "active"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {role.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewRole(role)}
                            title="View role"
                            aria-label={`View ${role.roleName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                          >
                            <FiEye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(role)}
                            title="Edit role"
                            aria-label={`Edit ${role.roleName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <FiEdit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteRole(role._id)}
                            disabled={deletingId === role._id}
                            title="Delete role"
                            aria-label={`Delete ${role.roleName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                          >
                            {deletingId === role._id ? (
                              <FiRefreshCw className="animate-spin" size={16} />
                            ) : (
                              <FiTrash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <FiShield size={25} />
                      </div>
                      <h3 className="font-semibold text-slate-700">
                        No roles found
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Try another search or create a new role.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ROLE MODAL */}
      {showAdd && (
        <Modal
          title="Create New Role"
          subtitle="Configure the role and its module permissions."
          onClose={closeAddModal}
          saving={saving}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addRole();
            }}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Manager, Counselor, Staff"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role Status
              </label>
              <select
                value={roleStatus}
                onChange={(e) => setRoleStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <PermissionSelector
              permissions={permissions}
              onChange={handlePermissionChange}
              onToggleModule={toggleModulePermissions}
              onToggleAll={toggleAllPermissions}
            />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <FiRefreshCw className="animate-spin" size={16} />}
                {saving ? "Creating..." : "Create Role"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* EDIT ROLE MODAL */}
      {editRole && (
        <Modal
          title="Edit Role"
          subtitle="Update role details and access permissions."
          onClose={() => !saving && setEditRole(null)}
          saving={saving}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateRole();
            }}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                autoFocus
                required
                value={editRole.roleName}
                onChange={(e) =>
                  setEditRole((prev) => ({
                    ...prev,
                    roleName: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role Status
              </label>
              <select
                value={editRole.status}
                onChange={(e) =>
                  setEditRole((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <PermissionSelector
              permissions={editRole.permissions}
              onChange={handleEditPermissionChange}
              onToggleModule={toggleEditModulePermissions}
              onToggleAll={toggleEditAllPermissions}
            />

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setEditRole(null)}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving && <FiRefreshCw className="animate-spin" size={16} />}
                {saving ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW ROLE MODAL */}
      {viewRole && (
        <Modal
          title={viewRole.roleName}
          subtitle="Role details and assigned module permissions."
          onClose={() => setViewRole(null)}
        >
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                viewRole.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {viewRole.status === "active" ? "Active" : "Inactive"}
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {getEnabledCount(normalizePermissions(viewRole.permissions))}{" "}
              permissions enabled
            </span>
          </div>

          <PermissionSelector
            permissions={normalizePermissions(viewRole.permissions)}
            readOnly
          />

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setViewRole(null)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// REUSABLE MODAL
const Modal = ({ title, subtitle, onClose, saving = false, children }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
};

// MODULE-WISE PERMISSION SELECTOR
const PermissionSelector = ({
  permissions,
  onChange,
  onToggleModule,
  onToggleAll,
  readOnly = false,
}) => {
  const totalEnabled = getEnabledCount(permissions);

  const selectableActions = MODULES.flatMap(({ key }) =>
    ACTIONS.filter(
      (action) => !(key === "roles" && action.key === "create"),
    ).map((action) => ({
      module: key,
      action: action.key,
    })),
  );

  const allSelected =
    selectableActions.length > 0 &&
    selectableActions.every(
      ({ module, action }) => permissions?.[module]?.[action] === true,
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-slate-800">Module Permissions</h3>
          <p className="mt-1 text-xs text-slate-500">
            Choose exactly what this role is allowed to do.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-xs font-semibold text-blue-700">
            {totalEnabled} enabled
          </span>

          {!readOnly && (
            <button
              type="button"
              onClick={() => onToggleAll(!allSelected)}
              className="whitespace-nowrap rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {MODULES.map(({ key, label, icon: Icon }) => {
          const modulePermissions = permissions?.[key] || {};
          const enabledCount = ACTIONS.filter(
            ({ key: action }) => modulePermissions[action] === true,
          ).length;

          const selectableForModule = ACTIONS.filter(
            (action) => !(key === "roles" && action.key === "create"),
          );

          const moduleAllSelected =
            selectableForModule.length > 0 &&
            selectableForModule.every(
              ({ key: action }) => modulePermissions[action] === true,
            );

          return (
            <section
              key={key}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {label}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {enabledCount} of {ACTIONS.length} enabled
                    </p>
                  </div>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onToggleModule(key, !moduleAllSelected)}
                    className="whitespace-nowrap text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {moduleAllSelected ? "Clear" : "Select All"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {ACTIONS.map(({ key: action, label: actionLabel }) => {
                  const checked = modulePermissions[action] === true;

                  const roleCreateDisabled =
                    key === "roles" && action === "create";

                  return (
                    <label
                      key={action}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition ${
                        checked
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600"
                      } ${
                        roleCreateDisabled || readOnly
                          ? "cursor-not-allowed"
                          : "cursor-pointer hover:border-blue-200"
                      }`}
                      title={
                        roleCreateDisabled
                          ? "Only SuperAdmin can create roles."
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={readOnly || roleCreateDisabled}
                        onChange={(e) =>
                          onChange(key, action, e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />

                      <span className="text-xs font-semibold">
                        {actionLabel}
                      </span>

                      {checked && (
                        <FiCheck size={13} className="ml-auto shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>

              {key === "roles" && (
                <p className="border-t border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
                  Only SuperAdmin can create new roles.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

// REUSABLE STATS CARD
const StatCard = ({ title, value, subtitle, icon, iconClass }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-4">
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
};

export default Role;
