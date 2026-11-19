
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  UserRound,
  LogOut,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

const links = [
  { href: "/home", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/college", label: "Colleges" },
  { href: "/course", label: "Courses" },
  { href: "/contact", label: "Contact Us" },
  { href: "/plan", label: "Plans" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">

      <div className="mx-auto max-w-[1500px] px-5 sm:px-8">

        <div className="flex h-[82px] items-center justify-between gap-5">

          {/* LOGO */}
          <Link href="/home" className="group flex shrink-0 items-center gap-3">

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-950 to-teal-600 text-white shadow-lg shadow-blue-950/20 transition group-hover:-translate-y-1">

              <GraduationCap size={29} strokeWidth={2.2} />

              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-teal-400" />

            </div>

            <div>
              <h1 className="text-lg font-black leading-tight tracking-tight text-blue-950 sm:text-xl">
                DOCTOR <span className="text-teal-600">COUNCIL</span>
              </h1>

              <p className="mt-1 text-[9px] font-bold uppercase tracking-[2px] text-slate-500 sm:text-[10px]">
                Medical Counselling Platform
              </p>
            </div>

          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1">

            {links.map((link) => {
              const active =
                pathname === link.href ||
                pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-teal-700"
                  }`}
                >
                  {link.label}

                  {active && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal-600" />
                  )}
                </Link>
              );
            })}

          </nav>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3">

            {!user ? (
              <>
                <Link
                  href="/student-login"
                  className="rounded-xl border border-blue-950 px-5 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-950 hover:text-white"
                >
                  Student Login
                </Link>

                <Link
                  href="/contact"
                  className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition hover:bg-teal-700"
                >
                  Get Guidance
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <div className="relative">

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300"
                >

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold uppercase text-teal-700">
                    {userName.charAt(0)}
                  </span>

                  <span className="max-w-[110px] truncate">
                    {userName}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`transition ${dropdownOpen ? "rotate-180" : ""}`}
                  />

                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">

                      <p className="font-bold text-blue-950">
                        {userName}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user?.email}
                      </p>

                    </div>

                    <div className="p-2">

                      <button
                        onClick={handleViewProfile}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
                      >
                        <UserRound size={18} />
                        View Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-blue-950 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-100 py-5 lg:hidden">

            <nav className="flex flex-col gap-1">

              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">

              {!user ? (
                <Link
                  href="/student-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white"
                >
                  Student Login
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <div className="space-y-2">

                  <div className="px-4 py-2">
                    <p className="font-bold text-blue-950">{userName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleViewProfile();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-teal-50"
                  >
                    <UserRound size={18} />
                    View Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </header>
  );
}
