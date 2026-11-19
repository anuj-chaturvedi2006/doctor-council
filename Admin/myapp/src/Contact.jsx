import React, { useEffect, useState } from "react";
import axios from "axios";

const Contact = () => {
  const [data, setData] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [deleteLoading, setDeleteLoading] = useState(null);
const [deleteContactData, setDeleteContactData] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
  // Get Contact Data
  const getData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://doctor-council.onrender.com/get-contact"
      );

      setData(res?.data?.data || []);

    } catch (error) {
      console.log("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Contact
const deleteContact = async () => {
  try {
    setDeleteLoading(true);

    const id = deleteContactData._id;

    const res = await axios.delete(
      `https://doctor-council.onrender.com/delete-contact/${id}`
    );

    if (res.data.status) {
      setData((prev) =>
        prev.filter((item) => item._id !== id)
      );

      setDeleteContactData(null);
    } else {
      alert(res.data.message || "Delete failed");
    }

  } catch (error) {
    console.log("Delete Error:", error);
    alert("Something went wrong while deleting contact");
  } finally {
    setDeleteLoading(false);
  }
};

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Contact Enquiries
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage all contact form submissions
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-500">
            Total Enquiries
          </p>

          <h2 className="text-2xl font-bold text-blue-600">
            {data.length}
          </h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">#</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Subject</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Enquiry Type</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600">Message</th>
                <th className="px-5 py-4 text-sm font-semibold text-gray-600 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    Loading enquiries...
                  </td>
                </tr>

              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No contact enquiries found.
                  </td>
                </tr>

              ) : (
                data.map((val, index) => (
                  <tr key={val._id || index} className="hover:bg-blue-50/50 transition">

                    <td className="px-5 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {val.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {val.email || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {val.contact || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {val.subject || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {val.enquiryType || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[180px]">
                      <p className="truncate">
                        {val.message || "-"}
                      </p>
                    </td>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-2">

  <button
    onClick={() => {
      setDeleteContactData(null);
      setSelectedContact(val);
    }}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
  >
    View
  </button>

  <button
    onClick={() => {
      setSelectedContact(null);
      setDeleteContactData(val);
    }}
    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
  >
    Delete
  </button>

</div>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedContact && (
        <div
          onClick={() => setSelectedContact(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >

            {/* Modal Header */}
            <div className="bg-blue-600 px-6 py-5 flex justify-between items-center sticky top-0">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Contact Details
                </h2>

                <p className="text-blue-100 text-sm mt-1">
                  Complete enquiry information
                </p>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="text-white text-3xl hover:text-gray-200"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Full Name
                </label>
                <p className="mt-1 text-gray-800 font-medium">
                  {selectedContact.name || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Email Address
                </label>
                <p className="mt-1 text-gray-800 font-medium break-all">
                  {selectedContact.email || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Contact Number
                </label>
                <p className="mt-1 text-gray-800 font-medium">
                  {selectedContact.contact || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Subject
                </label>
                <p className="mt-1 text-gray-800 font-medium">
                  {selectedContact.subject || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Enquiry Type
                </label>
                <p className="mt-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedContact.enquiryType || "-"}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-500">
                  Message
                </label>
                <div className="mt-2 bg-gray-50 border rounded-lg p-4 text-gray-700 text-sm leading-6 whitespace-pre-wrap break-words">
                  {selectedContact.message || "-"}
                </div>
              </div>

              {selectedContact.createdAt && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">
                    Submitted On
                  </label>
                  <p className="mt-1 text-gray-800">
                    {new Date(selectedContact.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={() => setSelectedContact(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

{/* Delete Confirmation Modal */}
{deleteContactData && (
  <div
    onClick={() => !deleteLoading && setDeleteContactData(null)}
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-in-out]"
    >

      {/* Delete Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800">
          Delete Contact?
        </h2>

        <p className="text-gray-500 text-sm mt-2 leading-6">
          Are you sure you want to delete the contact enquiry of{" "}
          <span className="font-semibold text-gray-800">
            {deleteContactData.name}
          </span>
          ?
        </p>

        <p className="text-red-500 text-sm mt-2">
          This action cannot be undone.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-7">

        <button
          onClick={() => setDeleteContactData(null)}
          disabled={deleteLoading}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={deleteContact}
          disabled={deleteLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {deleteLoading ? "Deleting..." : "Yes, Delete"}
        </button>

      </div>

    </div>
  </div>
)}

    </div>
  );
};

export default Contact;
