import React from "react";
import logo from "./assets/logo.jpg";

const Header = () => {
  return (
    <header className="h-[70px] bg-white shadow-md flex items-center justify-between px-6 sticky top-0 z-50">

      {/* Left Side */}
      <div className="flex items-center gap-4">

        <img
          src={logo}
          alt="Logo"
          className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
        />

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Admin Dashboard
          </h1>

          <p className="text-xs text-gray-500">
            Management Panel
          </p>
        </div>

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">
            Anuj
          </p>

          <p className="text-xs text-gray-500">
            admin@example.com
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          A
        </div>

      </div>

    </header>
  );
};

export default Header;