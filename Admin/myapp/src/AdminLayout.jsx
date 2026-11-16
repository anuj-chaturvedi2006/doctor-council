import React, { useState, useEffect, useMemo } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FiHome,
  FiUsers,
  FiUser,
  FiBook,
  FiBookOpen,
  FiLayers,
  FiMail,
  FiMessageSquare,
  FiChevronDown,
  FiChevronRight,
  FiCalendar,
  FiFileText,
  FiClock,
  FiUserCheck,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const [counsellingOpen, setCounsellingOpen] = useState(
    location.pathname.startsWith("/admin/counselling")
  );

  // Sync submenu state when route changes
  useEffect(() => {
    if (location.pathname.startsWith("/admin/counselling")) {
      setCounsellingOpen(true);
    }
  }, [location.pathname]);

  // Safe localStorage parsing
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const roleName = (
  user.role?.roleName || user.role || ""
)
  .toLowerCase()
  .replace(/[\s_-]/g, "");

const isCounsellor = roleName === "counsellor";

  // Main Sidebar Menu
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
    { name: "Student", path: "/admin/student", icon: <FiUsers /> },
    { name: "University", path: "/admin/university", icon: <FiBookOpen /> },
    { name: "College", path: "/admin/college", icon: <FiBook /> },
    { name: "Streams", path: "/admin/streams", icon: <FiLayers /> },
    { name: "Course", path: "/admin/courses", icon: <FiBookOpen /> },
    { name: "Degree", path: "/admin/degrees", icon: <FiBook /> },
    { name: "Specialization", path: "/admin/specializations", icon: <FiLayers /> },
    { name: "Role Management", path: "/admin/role", icon: <FiUser /> },
    { name: "Email Template", path: "/admin/emailtemplate", icon: <FiMail /> },
    { name: "Contact", path: "/admin/contact", icon: <FiMessageSquare /> },
  ];

  const visibleMenuItems = isCounsellor
  ? []
  : menuItems;

  // Counselling Submenu
  const counsellingSubmenu = [
     {name: "Dashboard", path: "/admin/counselling/dashboard",icon: <FiHome />,},
    { name: "My Students", path: "/admin/counselling/my-students", icon: <FiUsers /> },
    { name: "Student Details", path: "/admin/counselling/student-details", icon: <FiUser /> },
    { name: "Counselling Requests", path: "/admin/counselling/requests", icon: <FiFileText /> },
    { name: "Appointments", path: "/admin/counselling/appointments", icon: <FiCalendar /> },
    { name: "Sessions", path: "/admin/counselling/counsellingsessions", icon: <FiClock /> },
    { name: "Follow-ups", path: "/admin/counselling/follow-ups", icon: <FiMessageSquare /> },
    { name: "Counsellor Management", path: "/admin/counselling/management", icon: <FiUserCheck /> },
  ];

  // Dynamic Page Title based on active route
  const currentPageTitle = useMemo(() => {
    const allItems = [...menuItems, ...counsellingSubmenu];
    const activeItem = allItems.find((item) =>
      location.pathname.startsWith(item.path)
    );
    return activeItem ? activeItem.name : "Dashboard";
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Sticky on Desktop, Fixed Drawer on Mobile) */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[270px] shrink-0 flex-col bg-gray-900 text-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 px-5">
          <h1 className="text-xl font-bold tracking-wide text-white">
            Doctor Council
          </h1>

          <button
            type="button"
            aria-label="Close Sidebar"
            className="rounded-lg p-1 text-xl text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Main Menu
          </p>

          <nav className="space-y-1">
            {/* Normal Menu Items */}
           {(isCounsellor ? [] : menuItems).map((item) => (
  <NavLink
    key={item.path}
    to={item.path}
    onClick={() => setSidebarOpen(false)}
    className={linkClass}
  >
    <span className="text-lg">{item.icon}</span>
    <span className="text-sm font-medium">{item.name}</span>
  </NavLink>
))}

            {/* Counselling Parent Menu */}
            <button
              type="button"
              onClick={() => setCounsellingOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 ${
                location.pathname.startsWith("/admin/counselling")
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <FiUsers className="text-lg" />
                <span className="text-sm font-medium">Counselling</span>
              </span>

              {counsellingOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>

            {/* Counselling Submenu */}
            {counsellingOpen && (
              <div className="ml-4 space-y-1 border-l border-gray-700 pl-3 pt-1">
                {counsellingSubmenu.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="shrink-0 border-t border-gray-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition hover:bg-red-600 hover:text-white"
          >
            <FiLogOut className="text-lg" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Navbar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white px-5 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open Sidebar"
              className="rounded-lg p-1.5 text-2xl text-gray-700 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu />
            </button>

            <h2 className="text-lg font-semibold text-gray-800">
              {currentPageTitle}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user.role?.roleName || user.role || "Account"}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-5 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-5 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Doctor Council. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;