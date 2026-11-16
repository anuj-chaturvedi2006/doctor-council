
import React, { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FiHome,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiMessageSquare,
  FiClipboard,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiChevronDown,
  FiChevronRight,
  FiBookOpen,
} from "react-icons/fi";

import { SlEarphonesAlt } from "react-icons/sl";

const CounsellorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const [counsellingOpen, setCounsellingOpen] = useState(
    location.pathname.startsWith("/counsellor/counselling")
  );

  // Logged-in user
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getUser();

  const counsellorName = user?.name || "Counsellor";
  const counsellorEmail = user?.email || "";

  const counsellorRole =
    typeof user?.role === "object"
      ? user?.role?.roleName || "Counsellor"
      : user?.role || "Counsellor";

  const avatarLetter =
    counsellorName.charAt(0).toUpperCase() || "C";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    navigate("/login", { replace: true });
  };

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Main menu
  const menuItems = [
    {
      name: "Dashboard",
      path: "/counsellor/dashboard",
      icon: <FiHome />,
    },
    {
      name: "My Students",
      path: "/counsellor/my-students",
      icon: <FiUsers />,
    },
    {
      name: "Appointments",
      path: "/counsellor/appointments",
      icon: <FiCalendar />,
    },
    {
      name: "Counselling Sessions",
      path: "/counsellor/sessions",
      icon: <FiMessageSquare />,
    },
    {
      name: "Follow-ups",
      path: "/counsellor/follow-ups",
      icon: <FiClipboard />,
    },
    {
      name: "My Profile",
      path: "/counsellor/profile",
      icon: <FiUser />,
    },
  ];

  // Counselling submenu
  const counsellingSubmenu = [
    {
      name: "All Requests",
      path: "/counsellor/counselling/requests",
      icon: <FiFileText />,
    },
    {
      name: "Student Details",
      path: "/counsellor/counselling/student-details",
      icon: <FiBookOpen />,
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
          flex h-screen w-[270px] flex-col overflow-hidden
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
                Counsellor <span className="text-blue-400">Panel</span>
              </h1>

              <p className="mt-1 text-[10px] tracking-[1.5px] text-gray-500">
                COUNSELLING MANAGEMENT
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
        <nav className="min-h-0 flex-1 overflow-y-auto px-5 pt-9 pb-5 custom-scrollbar">

          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[2px] text-gray-500">
            Counsellor Menu
          </p>

          <div className="space-y-3">

            {/* NORMAL MENU */}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex h-[52px] shrink-0 items-center gap-4 rounded-xl px-4 transition-all duration-200 ${
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

            {/* COUNSELLING PARENT */}
            <div>

              <button
                type="button"
                onClick={() => setCounsellingOpen(!counsellingOpen)}
                className={`
                  flex h-[52px] w-full items-center justify-between
                  rounded-xl px-4 transition-all duration-200
                  ${
                    location.pathname.startsWith("/counsellor/counselling")
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                  }
                `}
              >

                <span className="flex items-center gap-4">
                  <span className="text-[20px]">
                    <SlEarphonesAlt />
                  </span>

                  <span className="text-sm font-medium">
                    Counselling
                  </span>
                </span>

                <span className="text-lg">
                  {counsellingOpen ? (
                    <FiChevronDown />
                  ) : (
                    <FiChevronRight />
                  )}
                </span>

              </button>

              {/* NESTED MENU */}
              <div
                className={`
                  grid transition-all duration-300 ease-in-out
                  ${
                    counsellingOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }
                `}
              >
                <div className="overflow-hidden">

                  <div className="ml-6 mt-2 space-y-2 border-l border-white/10 pl-4">

                    {counsellingSubmenu.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `
                            flex min-h-[43px] items-center gap-3
                            rounded-lg px-3 text-sm transition-all duration-200
                            ${
                              isActive
                                ? "bg-blue-500/20 text-blue-400 font-semibold"
                                : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                            }
                          `
                        }
                      >

                        <span className="text-[17px]">
                          {item.icon}
                        </span>

                        <span>{item.name}</span>

                      </NavLink>
                    ))}

                  </div>

                </div>
              </div>

            </div>

          </div>
        </nav>

        {/* COUNSELLOR PROFILE */}
        <div className="px-5 pb-6">

          <div className="mb-4 h-px bg-white/[0.08]" />

          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-white">
                {counsellorName}
              </p>

              <p className="mt-1 truncate text-[11px] text-gray-400">
                {counsellorRole}
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
                Counsellor Dashboard
              </h2>
            </div>

          </div>

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

            {/* PROFILE */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 font-semibold text-blue-600">
                {avatarLetter}
              </div>

              <div className="hidden sm:block">

                <p className="max-w-[180px] truncate text-sm font-semibold text-gray-700">
                  {counsellorName}
                </p>

                <p className="mt-1 max-w-[180px] truncate text-[11px] text-gray-400">
                  {counsellorEmail || counsellorRole}
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
                CounsellorPanel
              </span>.
              All rights reserved.
            </p>

            <div className="flex gap-5">

              <span className="text-xs text-gray-400 sm:text-sm">
                Privacy
              </span>

              <span className="text-xs text-gray-400 sm:text-sm">
                Terms
              </span>

              <span className="text-xs text-gray-400 sm:text-sm">
                Support
              </span>

            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};

export default CounsellorLayout;
