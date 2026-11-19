
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ================= TYPES =================

interface Package {
  _id: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features: string[];
  status: string;
}

interface PackageOrder {
  key: string;
  orderId: string;
  amount: number;
  currency: string;
  packageName: string;
}




// ================= ERROR HANDLER =================

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

// ================= COMPONENT =================

const Plan = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // Get Login Token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken || "");
  }, []);

  // ================= FETCH PACKAGES =================

  const fetchPackages = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/get-packages`);

      if (res.data.success) {
        setPackages((res.data.data || []) as Package[]);
      }
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Unable to fetch packages"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // ================= LOAD RAZORPAY SCRIPT =================

  const loadRazorpay = (): Promise<boolean> => {
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

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ================= BUY PACKAGE =================

  const handleBuyPackage = async (pkg: Package): Promise<void> => {
    try {
      if (!token) {
        toast.error("Please login first");
        return;
      }

      setSelectedPackage(pkg._id);

      const loaded = await loadRazorpay();

      if (!loaded || !window.Razorpay) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // Create Order
      const orderRes = await axios.post(
        `${API_URL}/student/create-package-order`,
        {
          packageId: pkg._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!orderRes.data.success) {
        toast.error(
          orderRes.data.message || "Order creation failed",
        );
        return;
      }

      const order = orderRes.data.data as PackageOrder;

      console.log("BACKEND ORDER RESPONSE:", order);
      console.log("ORDER ID:", order.orderId);
      console.log("RAZORPAY KEY:", order.key);

      if (!order.key || !order.orderId || !order.amount) {
        throw new Error("Razorpay order details are missing");
      }

      // Razorpay Checkout Options
      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Doctor Council",
        description: order.packageName,
        order_id: order.orderId,

        // Payment Success Handler
        handler: async (response: RazorpayResponse) => {
          console.log("RAZORPAY FULL RESPONSE:", response);

          if (
            !response.razorpay_order_id ||
            !response.razorpay_payment_id ||
            !response.razorpay_signature
          ) {
            console.error(
              "Incomplete payment response:",
              response,
            );

            toast.error(
              "Payment response incomplete. Contact support.",
            );

            return;
          }

          try {
            const verifyRes = await axios.post(
              `${API_URL}/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );

            console.log("VERIFY RESPONSE:", verifyRes.data);

            if (verifyRes.data.success) {
              toast.success(
                "Payment successful! Your package is activated.",
              );

              await fetchPackages();
            } else {
              toast.error(
                verifyRes.data.message ||
                  "Payment verification failed",
              );
            }
          } catch (error: unknown) {
            console.error(
              "VERIFY ERROR:",
              axios.isAxiosError(error)
                ? error.response?.data || error.message
                : error,
            );

            toast.error(
              getErrorMessage(
                error,
                "Payment verification failed",
              ),
            );
          }
        },

        prefill: {},

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment window closed");
          },
        },
      };

      // Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: RazorpayFailedResponse) => {
          toast.error(
            response.error?.description || "Payment failed",
          );
        },
      );

      razorpay.open();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, "Something went wrong"),
      );
    } finally {
      setSelectedPackage(null);
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-8">
      <ToastContainer position="top-right" />

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            MBBS ADMISSION COUNSELLING
          </span>

          <h1 className="mt-5 text-3xl font-bold text-slate-900 sm:text-5xl">
            Choose Your Counselling Plan
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Choose the right counselling package for your MBBS admission
            journey. Get expert guidance at every step.
          </p>
        </div>

        {/* Packages */}
        {loading ? (
          <div className="py-16 text-center text-lg font-semibold text-slate-600">
            Loading packages...
          </div>
        ) : packages.filter((pkg) => pkg.status === "active").length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold text-slate-800">
              No Packages Available
            </h2>

            <p className="mt-2 text-slate-500">
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {packages
              .filter((pkg) => pkg.status === "active")
              .map((pkg, index) => (
                <div
                  key={pkg._id}
                  className={`relative flex flex-col rounded-2xl border bg-white p-7 shadow-lg transition hover:-translate-y-2 hover:shadow-xl ${
                    index === 1
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  {index === 1 && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white">
                      MOST POPULAR
                    </span>
                  )}

                  <h2 className="text-2xl font-bold text-slate-900">
                    {pkg.name}
                  </h2>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                    {pkg.description}
                  </p>

                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ₹{pkg.price}
                    </span>

                    <span className="ml-2 text-sm text-slate-500">
                      / {pkg.durationDays} Days
                    </span>
                  </div>

                  <div className="mb-7 border-t border-slate-100 pt-6">
                    <h3 className="mb-4 font-bold text-slate-800">
                      What's Included
                    </h3>

                    <ul className="space-y-3">
                      {(pkg.features || []).map(
                        (feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm text-slate-600"
                          >
                            <span className="font-bold text-green-600">
                              ✓
                            </span>

                            {feature}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleBuyPackage(pkg)}
                    disabled={selectedPackage === pkg._id}
                    className={`mt-auto w-full rounded-xl px-5 py-3.5 font-bold text-white transition ${
                      selectedPackage === pkg._id
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {selectedPackage === pkg._id
                      ? "Processing..."
                      : "Buy Now"}
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Secure payments powered by Razorpay.</p>

          <p className="mt-2">
            Get expert support throughout your MBBS admission journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plan;
