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
import EmailTemplate from "./EmailTemplate";
import University from "./university";
import Contact from "./Contact";
import Plan from "./Plan"

// Counselling Pages
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard";
import MyStudents from "./pages/counsellor/MyStudents";
import StudentDetails from "./pages/counsellor/StudentDetails";
import CounsellingRequests from "./pages/counsellor/CounsellingRequests";
import Appointments from "./pages/counsellor/Appointments"
import CounsellingSession from "./pages/counsellor/CounsellingSessions"
import FollowUp from "./pages/counsellor/FollowUp"
import CounsellorManagement from "./pages/counsellor/CounsellorManagement"
const App = () => {
  return (
    <Routes>
      {/* Normal Pages */}
      <Route path="/" element={<Login />} />
      <Route path="/user" element={<User />} />
      <Route path="/" element={<Login />} />
      <Route path="/forget" element={<Forget />} />
      <Route path="/reset" element={<Reset />} />

      {/* Admin + Counselling Pages - Same Layout */}
      <Route element={<AdminLayout />}>
        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<Dashboad />} />
        <Route path="/admin/student" element={<Student />} />
        <Route path="/admin/role" element={<Role />} />
        <Route path="/admin/college" element={<College />} />
        <Route path="/admin/streams" element={<Stream />} />
        <Route path="/admin/degrees" element={<Degree />} />
        <Route path="/admin/university" element={<University />} />
        <Route path="/admin/courses" element={<Course />} />
        <Route path="/admin/specializations" element={<Specialization />} />
        <Route path="/admin/emailtemplate" element={<EmailTemplate />} />
        <Route path="/admin/contact" element={<Contact />} />
        <Route path="/admin/plan" element={<Plan />} />
        
        {/* Counselling Pages */}

        <Route
  path="/admin/counselling/dashboard"
  element={<CounsellorDashboard />}
/>
        <Route path="/admin/counselling/my-students" element={<MyStudents />} />

        <Route
          path="/admin/counselling/student-details"
          element={<StudentDetails />}
        />

        <Route
          path="/admin/counselling/student-details/:assignmentId"
          element={<StudentDetails />}
        />
        <Route
          path="/admin/counselling/requests"
          element={<CounsellingRequests />}
        />

        <Route  path="/admin/counselling/appointments"  element={<Appointments />} />

        <Route path="/admin/counselling/counsellingsessions" element={<CounsellingSession />} />
      
         <Route path="/admin/counselling/follow-ups" element={<FollowUp />} />
         <Route path="/admin/counselling/management" element={<CounsellorManagement />} />
      </Route>
    </Routes>
  );
};

export default App;
