
"use client";

import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function InquiryForm() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    subject: "",
    enquiryType: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:2002/contact",
        formData
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setFormData({
          name: "",
          email: "",
          contact: "",
          subject: "",
          enquiryType: "",
          message: "",
        });
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Inquiry Form
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Please fill out the form below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>

            <input
              type="tel"
              name="contact"
              placeholder="Enter your contact number"
              value={formData.contact}
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength={10}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              placeholder="Enter inquiry subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Enquiry Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enquiry Type
            </label>

            <select
              name="enquiryType"
              value={formData.enquiryType}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select Enquiry Type</option>
              <option value="Admission">Admission</option>
              <option value="Course">Course Related</option>
              <option value="Fees">Fees Related</option>
              <option value="General">General Enquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>

            <textarea
              name="message"
              placeholder="Write your inquiry here..."
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>

        </form>
      </div>
    </div>
  );
}
