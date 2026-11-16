
import axios from "axios";
import React, { useEffect, useState } from "react";

const User = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(
        "http://localhost:2002/get-roles-dropdown"
      );

      if (res.data.success) {
        setRoles(res.data.data);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Input Change Handler
  const changeHandler = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Submit Handler
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:2002/create-user",
        form
      );

      if (res.data.success) {
        alert(res.data.message);

        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "",
        });
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Create New User
      </h1>

      <form
        onSubmit={submitHandler}
        className="max-w-xl bg-white shadow-lg rounded-lg p-6 space-y-4"
      >

        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            placeholder="Enter your name"
            onChange={changeHandler}
            required
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Enter your email"
            onChange={changeHandler}
            required
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium">
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            value={form.phone}
            placeholder="Enter phone number"
            onChange={changeHandler}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Enter password"
            onChange={changeHandler}
            required
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block mb-1 font-medium">
            Select Role
          </label>

          <select
            name="role"
            value={form.role}
            onChange={changeHandler}
            required
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Select Role
            </option>

            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || roles.length === 0}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating User..." : "Create User"}
        </button>

      </form>
    </div>
  );
};

export default User;
