
"use client";

import { useEffect, useState } from "react";
import {
  Package,
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";

const API_URL = "http://localhost:2002";

// Razorpay Checkout script load
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function MyPackagePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  // Fetch student packages
  const fetchMyPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/student/my-package`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to fetch packages");
      }

      setPackages(result.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPackages();
  }, []);

  // Retry Payment
  const handleRetryPayment = async (item) => {
    try {
      setRetryingId(item._id);
      setPaymentMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again");
      }

      // 1. Create new Razorpay order
      const response = await fetch(
        `${API_URL}/student/retry-package-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentPackageId: item._id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create payment order"
        );
      }

      // 2. Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 3. Razorpay Checkout options
      const options = {
        key: result.key,
        amount: result.amount,
        currency: result.currency,
        name: "Doctor Council",
        description: result.packageName,
        order_id: result.orderId,

        handler: async function (paymentResponse) {
          try {
            setPaymentMessage("Verifying payment...");

            // 4. Verify payment on backend
            const verifyResponse = await fetch(
              `${API_URL}/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult.success) {
              throw new Error(
                verifyResult.message || "Payment verification failed"
              );
            }

            setPaymentMessage(
              "Payment successful! Your package is now active."
            );

            // 5. Refresh package list
            await fetchMyPackages();

          } catch (err) {
            console.error("Verification error:", err);

            setPaymentMessage(
              err.message || "Payment verification failed"
            );
          } finally {
            setRetryingId(null);
          }
        },

        modal: {
          ondismiss: function () {
            setRetryingId(null);
            setPaymentMessage("Payment window closed. You can retry anytime.");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      // 6. Open Razorpay Checkout
      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        setPaymentMessage(
          response.error?.description || "Payment failed. Please try again."
        );

        setRetryingId(null);
      });

      razorpayInstance.open();

    } catch (err) {
      console.error("Retry payment error:", err);

      setPaymentMessage(
        err.message || "Something went wrong"
      );

      setRetryingId(null);
    }
  };

  // Remaining days
  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return 0;

    const difference =
      new Date(expiryDate).getTime() - new Date().getTime();

    return Math.max(
      0,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const activePackages = packages.filter(
    (item) => item.packageStatus === "active"
  );

  const pendingPackages = packages.filter(
    (item) => item.paymentStatus === "pending"
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Packages
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your counselling packages and payment history.
            </p>
          </div>

          <button
            onClick={fetchMyPackages}
            disabled={loading || retryingId !== null}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Payment Message */}
        {paymentMessage && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            {paymentMessage}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 text-green-600">
                <CheckCircle size={25} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Active Packages
                </p>

                <h2 className="text-2xl font-bold">
                  {activePackages.length}
                </h2>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-3 text-yellow-600">
                <Clock size={25} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Pending Payments
                </p>

                <h2 className="text-2xl font-bold">
                  {pendingPackages.length}
                </h2>
              </div>
            </div>
          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center text-gray-500">
            Loading your packages...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && packages.length === 0 && (
          <div className="rounded-xl border bg-white p-12 text-center">
            <Package
              className="mx-auto mb-4 text-gray-400"
              size={45}
            />

            <h2 className="text-xl font-semibold">
              No packages purchased yet
            </h2>

            <p className="mt-2 text-gray-500">
              Explore our available packages to get started.
            </p>
          </div>
        )}

        {/* Package List */}
        {!loading && !error && packages.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {packages.map((item) => {
              const remainingDays = getRemainingDays(
                item.expiryDate
              );

              const isPending =
                item.paymentStatus === "pending" &&
                item.packageStatus === "inactive";

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >

                  {/* Title and Status */}
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                        <Package size={25} />
                      </div>

                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {item.packageName}
                        </h2>

                        <p className="text-sm text-gray-500">
                          Counselling Package
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.packageStatus === "active"
                          ? "bg-green-100 text-green-700"
                          : item.packageStatus === "expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.packageStatus.toUpperCase()}
                    </span>

                  </div>

                  {/* Price */}
                  <div className="mb-5 border-b pb-5">
                    <p className="text-sm text-gray-500">
                      Package Amount
                    </p>

                    <h3 className="mt-1 text-3xl font-bold text-blue-600">
                      ₹{(item.amountPaise / 100).toFixed(2)}
                    </h3>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={16} />
                        Start Date
                      </p>

                      <p className="font-semibold">
                        {formatDate(item.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={16} />
                        Expiry Date
                      </p>

                      <p className="font-semibold">
                        {formatDate(item.expiryDate)}
                      </p>
                    </div>

                  </div>

                  {/* Remaining Days */}
                  {item.packageStatus === "active" && (
                    <div className="mt-5 rounded-lg bg-blue-50 p-4">
                      <p className="flex items-center gap-2 text-sm text-blue-700">
                        <Clock size={17} />
                        Remaining Days
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-blue-700">
                        {remainingDays} Days
                      </h3>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="mt-5 flex items-center justify-between border-t pt-4">

                    <span className="text-sm text-gray-500">
                      Payment Status
                    </span>

                    <span
                      className={`flex items-center gap-1 text-sm font-semibold ${
                        item.paymentStatus === "paid"
                          ? "text-green-600"
                          : item.paymentStatus === "failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {item.paymentStatus === "paid" ? (
                        <CheckCircle size={16} />
                      ) : item.paymentStatus === "failed" ? (
                        <XCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}

                      {item.paymentStatus.toUpperCase()}
                    </span>

                  </div>

                  {/* Retry Payment Button */}
                  {isPending && (
                    <div className="mt-5">
                      <button
                        onClick={() => handleRetryPayment(item)}
                        disabled={retryingId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {retryingId === item._id ? (
                          <>
                            <RefreshCw
                              size={18}
                              className="animate-spin"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            Retry Payment
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Package Features */}
                  {item.package?.features?.length > 0 && (
                    <div className="mt-5 border-t pt-4">

                      <h3 className="mb-3 font-semibold text-gray-800">
                        Package Features
                      </h3>

                      <ul className="space-y-2">
                        {item.package.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <CheckCircle
                              size={16}
                              className="text-green-500"
                            />

                            {typeof feature === "string"
                              ? feature
                              : feature.name}
                          </li>
                        ))}
                      </ul>

                    </div>
                  )}

                  {/* Transaction ID */}
                  {item.razorpayPaymentId && (
                    <div className="mt-5 break-all rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Transaction ID
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {item.razorpayPaymentId}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}
