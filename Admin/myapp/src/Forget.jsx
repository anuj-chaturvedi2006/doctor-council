import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const Forget = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [otp1, setOtp1] = useState("");
  const [otp2, setOtp2] = useState("");
  const [otp3, setOtp3] = useState("");
  const [otp4, setOtp4] = useState("");

  const [showOtp, setShowOtp] = useState(false);
  const [verify, setVerify] = useState(false);

  const [newpassword, setNewpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Send OTP
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:2002/forget-pass",
        {
          email: email,
        }
      );

      console.log(res.data);

      if (res.data.success) {
        toast.success(
          res?.data?.message || "OTP sent successfully!"
        );

        setShowOtp(true);
      } else {
        toast.error(
          res.data.message || "Email verification failed"
        );
      }

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const otp = otp1 + otp2 + otp3 + otp4;

    if (otp.length !== 4) {
      toast.warning("Please enter complete OTP");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:2002/verifyemail-forget",
        {
          email: email,
          otp: otp,
        }
      );

      console.log("Email:", email);
      console.log("OTP:", otp);
      console.log("Response:", res.data);

      if (res.data.success) {

        toast.success(
          res.data.message || "OTP verified successfully!"
        );

        // OTP popup close
        setShowOtp(false);

        // New password form show
        setVerify(true);

      } else {
        toast.error(
          res.data.message || "Invalid OTP"
        );
      }

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "OTP verification failed"
      );
    }
  };

  // Change Password
  const passwordHandler = async (e) => {
    e.preventDefault();

    if (!newpassword) {
      toast.warning("Please enter new password");
      return;
    }

    if (!confirmPassword) {
      toast.warning("Please confirm your password");
      return;
    }

    if (newpassword !== confirmPassword) {
      toast.error("Password does not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:2002/forget-password",
        {
          email: email,
          password: newpassword,
        }
      );

      console.log(res.data);

      if (res.data.success) {
        toast.success(
          res.data.message ||
          "Password changed successfully!"
        );

        setNewpassword("");
        setConfirmPassword("");

        setTimeout(() => {
          navigate("/login");
        }, 1500);

      } else {
        toast.error(
          res.data.message ||
          "Password change failed"
        );
      }

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Password change failed"
      );
    }
  };

  return (
    <>
      <div className="forget-container">

        <div className="forget-box">

          {/* Header */}
          <div className="forget-header">

            <div className="forget-icon">
              🔑
            </div>

            <h2>Forgot Password?</h2>

            <p>
              Enter your registered email to verify your account
            </p>

          </div>

          {/* Email Form */}
          {!verify && (
            <form onSubmit={submitHandler}>

              <div className="forget-form-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  required
                />

              </div>

              <button
                type="submit"
                className="forget-btn"
              >
                Verify Email
              </button>

            </form>
          )}

          {/* Login */}
          {!verify && (
            <p className="forget-login-text">

              Remember your password?

              <span
                onClick={() => navigate("/login")}
              >
                Login
              </span>

            </p>
          )}

        </div>


        {/* OTP POPUP */}
        {showOtp && (

          <div className="otp-overlay">

            <div className="otp-popup">

              <button
                className="close-otp"
                type="button"
                onClick={() => setShowOtp(false)}
              >
                ×
              </button>

              <div className="otp-popup-icon">
                🔐
              </div>

              <h2>
                Verify OTP
              </h2>

              <p>
                Enter the 4-digit OTP sent to
                <br />
                <strong>{email}</strong>
              </p>


              {/* OTP INPUTS */}
              <div className="otp-box">

                <input
                  type="text"
                  maxLength="1"
                  value={otp1}
                  onChange={(e) =>
                    setOtp1(e.target.value)
                  }
                />

                <input
                  type="text"
                  maxLength="1"
                  value={otp2}
                  onChange={(e) =>
                    setOtp2(e.target.value)
                  }
                />

                <input
                  type="text"
                  maxLength="1"
                  value={otp3}
                  onChange={(e) =>
                    setOtp3(e.target.value)
                  }
                />

                <input
                  type="text"
                  maxLength="1"
                  value={otp4}
                  onChange={(e) =>
                    setOtp4(e.target.value)
                  }
                />

              </div>


              {/* VERIFY OTP BUTTON */}
              <button
                type="button"
                className="confirm-otp-btn"
                onClick={verifyOtp}
              >
                Verify OTP
              </button>

            </div>

          </div>

        )}


        {/* NEW PASSWORD FORM */}
        {verify && (

          <div className="new-password-container">

            <div className="new-password-box">

              <div className="new-password-header">

                <div className="new-password-icon">
                  🔐
                </div>

                <h2>
                  Set New Password
                </h2>

                <p>
                  Create a new password for your account
                </p>

              </div>


              <form onSubmit={passwordHandler}>

                {/* New Password */}
                <div className="new-password-group">

                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newpassword}
                    onChange={(e) =>
                      setNewpassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    className="new-password-input"
                  />

                </div>


                {/* Confirm Password */}
                <div className="new-password-group">

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
                    className="new-password-input"
                  />

                </div>


                {/* Change Password */}
                <button
                  type="submit"
                  className="new-password-btn"
                >
                  Change Password
                </button>

              </form>

            </div>

          </div>

        )}

      </div>


      {/* Toastify */}
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

export default Forget;