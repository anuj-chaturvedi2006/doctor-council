import axios from "axios";
import React from "react";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const Reset = () => {

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const email = JSON.parse(localStorage.getItem("email"));


  const resetPassword = async (e) => {

    e.preventDefault();

    try {

      // Confirm password check
      if (newPassword !== confirmPassword) {

        toast.error("Password does not match!");

        return;
      }


      const form = {
        email: email,
        password: password,
        newPassword: newPassword
      };


      const res = await axios.post(
        "http://localhost:2002/reset-password",
        form
      );


      // Success message
      toast.success(
        res?.data?.message || "Password updated successfully!"
      );


    } catch (err) {

      console.log(err);

      // Backend error message
      toast.error(
        err?.response?.data?.message ||
        "Something went wrong. Please try again."
      );

    }

  };


  return (

    <>

      <div className="reset-container">

        <div className="reset-box">


          {/* Header */}

          <div className="reset-header">

            <div className="reset-icon">
              🔐
            </div>

            <h2>Reset Password</h2>

            <p>
              Create a new password for your account
            </p>

          </div>


          <form onSubmit={resetPassword}>


            {/* Old Password */}

            <div className="reset-form-group">

              <label>
                Old Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter old password"
                required
              />

            </div>


            {/* New Password */}

            <div className="reset-form-group">

              <label>
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                required
              />

            </div>


            {/* Confirm Password */}

            <div className="reset-form-group">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                required
              />

            </div>


            {/* Update Button */}

            <button
              type="submit"
              className="reset-password-btn"
            >
              Update Password
            </button>

          </form>


        </div>

      </div>


      {/* React Toastify */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

    </>

  );
};

export default Reset;
