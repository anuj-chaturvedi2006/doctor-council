  
import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiShield,
  FiLayers, // New icon
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiBookOpen,
  FiAward,

} from "react-icons/fi";
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Logged-in user details
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getUser();

  const adminName = user?.name || "Admin";
  const adminEmail = user?.email || "";
  const adminRole =
    typeof user?.role === "object"
      ? user?.role?.roleName || "Administrator"
      : user?.role || "Administrator";

  const avatarLetter = adminName.charAt(0).toUpperCase() || "A";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FiHome />,
    },
    {
      name: "Student",
      path: "/admin/student",
      icon: <FiUsers />,
    },
    {
      name: "Role Management",
      path: "/admin/role",
      icon: <FiShield />,
    },
    {
      name: "College",
      path: "/admin/college",
      icon: <FiBarChart2 />,
    },
    {
  name: "Streams",
  path: "/admin/streams",
  icon: <FiLayers />,
},
    {
  name: "Course",
  path: "/admin/courses",
  icon: <FiBookOpen />,
},
    {
  name: "Degree",
  path: "/admin/degrees",
  icon: <FiLayers  />,
},
    {
  name: "Specialization",
  path: "/admin/specializations",
  icon: <FiAward  />,
},
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          flex h-screen w-[270px] flex-col
          bg-[#111827] text-white shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="px-5 pt-5">
          <div className="flex h-[70px] items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4">
            <div>
              <h1 className="text-[22px] font-bold">
                Admin<span className="text-blue-400">Panel</span>
              </h1>

              <p className="mt-1 text-[10px] tracking-[1.5px] text-gray-500">
                MANAGEMENT SYSTEM
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-5 pt-9">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-gray-500">
            Main Menu
          </p>

          <div className="space-y-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex h-[52px] items-center gap-4 rounded-xl px-4 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                <span className="text-[20px]">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* SIDEBAR ADMIN PROFILE */}
        <div className="px-5 pb-6">
          <div className="mb-4 h-px bg-white/[0.08]" />

          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {adminName}
              </p>

              <p className="mt-1 truncate text-[11px] text-gray-400">
                {adminRole}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-400/10 hover:text-red-400"
            >
              <FiLogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-h-screen flex-col lg:ml-[270px]">
        {/* NAVBAR */}
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-gray-200 bg-white px-5 sm:px-8 lg:px-10">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
            >
              <FiMenu size={21} />
            </button>

            <div>
              <p className="text-[11px] text-gray-400">
                Welcome back 👋
              </p>

              <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
                Admin Dashboard
              </h2>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notification */}
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
            >
              <FiBell size={20} />

              <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            {/* NAVBAR PROFILE */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 font-semibold text-blue-600">
                {avatarLetter}
              </div>

              <div className="hidden sm:block">
                <p className="max-w-[180px] truncate text-sm font-semibold text-gray-700">
                  {adminName}
                </p>

                <p className="mt-1 max-w-[180px] truncate text-[11px] text-gray-400">
                  {adminEmail || adminRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row sm:px-8 lg:px-10">
            <p className="text-center text-xs text-gray-400 sm:text-left sm:text-sm">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-gray-600">
                AdminPanel
              </span>
              . All rights reserved.
            </p>

            <div className="flex gap-5">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-gray-400 hover:text-blue-600 sm:text-sm"
              >
                Privacy
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-gray-400 hover:text-blue-600 sm:text-sm"
              >
                Terms
              </a>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-gray-400 hover:text-blue-600 sm:text-sm"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
