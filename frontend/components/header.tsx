"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/course", label: "Courses" },
  { href: "/college", label: "College" },
  { href: "/contact", label: "Contact Us" },
  { href: "/plan", label: "Plan" },

];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setDropdownOpen(false);

    router.replace("/student-login");
  };

  const handleViewProfile = () => {
    setDropdownOpen(false);
    router.push("/user-profile");
  };

  const userName = user?.name || "Student";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 xl:px-8">
        <div className="flex min-h-[82px] items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-lg shadow-teal-500/20 transition duration-300 group-hover:-rotate-3">
              <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
                <path
                  d="M17 7h6v10h10v6H23v10h-6V23H7v-6h10V7Z"
                  fill="white"
                />
              </svg>
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-300" />
            </div>

            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight text-slate-900 sm:text-xl">
                MEDI<span className="text-teal-600">PATH</span>
              </h1>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[2px] text-slate-500 sm:text-[10px]">
                Counselling Platform
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav
            aria-label="Main navigation"
            className="flex flex-1 flex-wrap items-center justify-center gap-1"
          >
            {links.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-xl px-2 py-2 text-xs font-semibold transition sm:px-3 sm:py-3 sm:text-sm ${
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-teal-700"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Login / User Dropdown */}
          <div className="relative shrink-0">
            {!user ? (
              <Link
                href="/student-login"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 sm:px-5 sm:text-sm"
              >
                Log in
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 font-bold uppercase text-teal-700">
                    {userName.charAt(0)}
                  </span>

                  <span className="max-w-[100px] truncate sm:max-w-[140px]">
                    {userName}
                  </span>

                  <svg
                    className={`h-4 w-4 transition ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 9-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-bold text-slate-800">
                        {userName}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={handleViewProfile}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                    >
                      <span>👤</span>
                      View Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <span>↪</span>
                      Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}