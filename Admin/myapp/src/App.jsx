import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Home from "./Home";
import Forget from "./Forget";
import Reset from "./Reset";
import Dashboad from "./Dashboad";
import User from "./User";
import AdminLayout from "./AdminLayout";
import Student from "./Student";
import College from "./College";
import Stream from "./Stream";
import Role from "./Role";
import Degree from "./Degree";
import Course from "./Course";
import Specialization from "./Specialization";

const App = () => {
  return (
    <Routes>
      {/* Normal Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/user" element={<User />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forget" element={<Forget />} />
      <Route path="/reset" element={<Reset />} />

      {/* Admin Pages */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<Dashboad />} />

        <Route path="/admin/student" element={<Student />} />

        <Route path="/admin/role" element={<Role />} />

        <Route path="/admin/college" element={<College />} />

        <Route path="/admin/streams" element={<Stream />} />

        <Route path="/admin/degrees" element={<Degree />} />
        <Route path="/admin/courses" element={<Course />} />
        <Route path="/admin/specializations" element={<Specialization />} />
      </Route>
    </Routes>
  );
};

export default App;
