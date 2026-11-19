
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ================= TYPES =================

interface Package {
  _id: string;
  name?: string;
}

interface StudentPackage {
  _id: string;
  packageName?: string;
  package?: Package | string | null;
  amountPaise?: number;
  amount?: number;
  paymentStatus?: string;
  packageStatus?: string;
  expiryDate?: string;
  endDate?: string;
  startDate?: string;
  createdAt?: string;
  razorpayPaymentId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface OrderData {
  key: string;
  amount: number;
  currency: string;
  packageName: string;
  orderId: string;
}





// ================= CONFIG =================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://doctor-council.onrender.com";

const getErrorMessage = (
  err: unknown,
  fallback: string
): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
};

// ================= RAZORPAY SCRIPT =================

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(!!window.Razorpay);
    };

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// ================= COMPONENT =================

const MyPackagePage = () => {
  const [packages, setPackages] = useState<StudentPackage[]>([]);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  // Fetch student packages
  const fetchMyPackages = async (authToken: string): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get<
        ApiResponse<StudentPackage | StudentPackage[]>
      >(`${API_URL}/student/my-package`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.data.success) {
        const result = response.data.data;

        setPackages(
          Array.isArray(result) ? result : result ? [result] : []
        );
      } else {
        setPackages([]);
        setError(response.data.message || "Packages not found");
      }
    } catch (err: unknown) {
      console.error("MY PACKAGE ERROR:", err);

      setError(
        getErrorMessage(err, "Unable to fetch your packages")
      );
    } finally {
      setLoading(false);
    }
  };

  // Get token after component mounts
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setError("Please login first to view your packages.");
      setLoading(false);
      return;
    }

    setToken(savedToken);
    void fetchMyPackages(savedToken);
  }, []);

  // Date formatter
  const formatDate = (date?: string): string => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Remaining days
  const getRemainingDays = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);

    if (isNaN(expiry.getTime())) return null;

    const difference = expiry.getTime() - today.getTime();

    return Math.max(
      0,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  };

  // Retry payment
  const handleRetryPayment = async (
    item: StudentPackage
  ): Promise<void> => {
    try {
      setRetryingId(item._id);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const orderResponse = await axios.post<
        ApiResponse<OrderData>
      >(
        `${API_URL}/student/retry-package-order`,
        {
          studentPackageId: item._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!orderResponse.data.success) {
        toast.error(
          orderResponse.data.message || "Unable to create order"
        );
        return;
      }

      const order = orderResponse.data.data;

      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Doctor Council",
        description: order.packageName,
        order_id: order.orderId,

        handler: async function (
          razorpayResponse: RazorpayResponse
        ) {
          try {
            const verifyResponse = await axios.post<
              ApiResponse<unknown>
            >(
              `${API_URL}/verify-payment`,
              {
                razorpay_order_id:
                  razorpayResponse.razorpay_order_id,
                razorpay_payment_id:
                  razorpayResponse.razorpay_payment_id,
                razorpay_signature:
                  razorpayResponse.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (verifyResponse.data.success) {
              toast.success(
                "Payment successful! Package activated."
              );

              await fetchMyPackages(token);
            } else {
              toast.error(
                verifyResponse.data.message ||
                  "Payment verification failed"
              );
            }
          } catch (err: unknown) {
            console.error("VERIFY ERROR:", err);

            toast.error(
              getErrorMessage(
                err,
                "Payment verification failed"
              )
            );
          }
        },

        modal: {
          ondismiss: function () {
            toast.info("Payment window closed");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const Razorpay = window.Razorpay;

      if (!Razorpay) {
        toast.error("Razorpay SDK is not available");
        return;
      }

      const razorpay = new Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: RazorpayFailedResponse) {
          toast.error(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (err: unknown) {
      console.error("RETRY PAYMENT ERROR:", err);

      toast.error(
        getErrorMessage(err, "Unable to retry payment")
      );
    } finally {
      setRetryingId(null);
    }
  };

  // Status styles
  const getStatusStyle = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "active":
        return "bg-green-100 text-green-700";

      case "pending":
      case "created":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
      case "expired":
      case "inactive":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your packages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Packages
          </h1>

          <p className="text-gray-500 mt-2">
            View your purchased counselling packages and payment details.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!error && packages.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <div className="text-5xl mb-4">📦</div>

            <h2 className="text-xl font-semibold text-gray-800">
              No Packages Found
            </h2>

            <p className="text-gray-500 mt-2">
              You have not purchased any counselling package yet.
            </p>

            <a
              href="/plan"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              Explore Packages
            </a>
          </div>
        )}

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((item) => {
            const remainingDays = getRemainingDays(
              item.expiryDate || item.endDate
            );

            const isPaid = item.paymentStatus === "paid";
            const isActive = item.packageStatus === "active";

            const canRetry =
              !isPaid &&
              ["created", "pending", "failed"].includes(
                item.paymentStatus?.toLowerCase() || ""
              );

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Card header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Counselling Package
                    </span>

                    <span className="text-sm">
                      {isActive ? "✓ Active" : item.packageStatus}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold mt-5">
                    {item.packageName ||
                      (typeof item.package === "object"
                        ? item.package?.name
                        : undefined) ||
                      "My Package"}
                  </h2>

                  <p className="text-blue-100 mt-2">
                    Your Doctor Council package
                  </p>

                  <div className="mt-5 text-3xl font-bold">
                    ₹
                    {(
                      item.amountPaise != null
                        ? item.amountPaise / 100
                        : item.amount || 0
                    ).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6">
                  {/* Status */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Payment Status
                      </p>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                          item.paymentStatus
                        )}`}
                      >
                        {item.paymentStatus || "Unknown"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        Package Status
                      </p>

                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusStyle(
                          item.packageStatus
                        )}`}
                      >
                        {item.packageStatus || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5 space-y-4">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500 text-sm">
                        Purchase Date
                      </span>

                      <span className="text-gray-800 text-sm font-medium">
                        {formatDate(item.startDate || item.createdAt)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500 text-sm">
                        Expiry Date
                      </span>

                      <span className="text-gray-800 text-sm font-medium">
                        {formatDate(item.expiryDate || item.endDate)}
                      </span>
                    </div>

                    {isActive && remainingDays !== null && (
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500 text-sm">
                          Remaining Days
                        </span>

                        <span className="text-green-600 text-sm font-bold">
                          {remainingDays} Days
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500 text-sm">
                        Payment ID
                      </span>

                      <span className="text-gray-800 text-xs font-medium break-all text-right">
                        {item.razorpayPaymentId || "Not available"}
                      </span>
                    </div>
                  </div>

                  {/* Retry button */}
                  {canRetry && (
                    <button
                      onClick={() => handleRetryPayment(item)}
                      disabled={retryingId === item._id}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold transition"
                    >
                      {retryingId === item._id
                        ? "Please wait..."
                        : "Retry Payment"}
                    </button>
                  )}

                  {/* Active package */}
                  {isPaid && isActive && (
                    <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-3 text-center text-green-700 font-medium text-sm">
                      ✓ Your package is active
                    </div>
                  )}

                  {/* Expired package */}
                  {isPaid && item.packageStatus === "expired" && (
                    <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-3 text-center text-red-700 font-medium text-sm">
                      Your package has expired.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh */}
        {packages.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchMyPackages(token)}
              className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100"
            >
              ↻ Refresh Packages
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPackagePage;
