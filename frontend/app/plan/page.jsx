
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:2002";

export default function PackagePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [message, setMessage] = useState("");

  // Load Razorpay Checkout script
  const loadRazorpay = () => {
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

  // Get all active packages
  const fetchPackages = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/get-packages`);
      const result = await response.json();

      const packageList =
        result.data?.packages ||
        result.packages ||
        result.data ||
        [];

      setPackages(Array.isArray(packageList) ? packageList : []);
    } catch (error) {
      console.error("Get packages error:", error);
      setMessage("Unable to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Buy package
  const handleBuyPackage = async (packageId) => {
    try {
      setPayingId(packageId);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first");
        setPayingId(null);
        return;
      }

      // 1. Load Razorpay
      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 2. Create order from backend
      const orderResponse = await fetch(
        `${API_URL}/student/create-package-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packageId }),
        }
      );

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(
          orderResult.message || "Unable to create order"
        );
      }

      const orderData = orderResult.data;

      // 3. Razorpay Checkout options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Doctor Council",
        description: orderData.packageName,
        order_id: orderData.orderId,

        handler: async function (paymentResponse) {
          try {
            setMessage("Verifying payment...");

            // 4. Verify payment from backend
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

            setMessage(
              "Payment successful! Your package is now active."
            );
          } catch (error) {
            console.error("Payment verification error:", error);
            setMessage(
              error.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setPayingId(null);
          }
        },

        modal: {
          ondismiss: function () {
            setPayingId(null);
            setMessage("Payment window closed.");
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      // 5. Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setMessage(
          response.error.description || "Payment failed"
        );
        setPayingId(null);
      });

      razorpay.open();
    } catch (error) {
      console.error("Buy package error:", error);
      setMessage(error.message || "Something went wrong");
      setPayingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Choose Your Package
          </h1>

          <p className="mt-3 text-gray-600">
            Select the best counselling package for your needs.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-blue-700">
            {message}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center text-lg text-gray-500">
            Loading packages...
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              No packages available
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Package Name */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {pkg.name}
                </h2>

                {/* Price */}
                <div className="my-5">
                  <span className="text-4xl font-bold text-blue-600">
                    ₹{pkg.price}
                  </span>
                </div>

                {/* Duration */}
                <p className="mb-4 text-sm text-gray-500">
                  Validity: {pkg.durationDays} days
                </p>

                {/* Description */}
                <p className="mb-5 text-gray-600">
                  {pkg.description || "Counselling package"}
                </p>

                {/* Features */}
                {Array.isArray(pkg.features) &&
                  pkg.features.length > 0 && (
                    <ul className="mb-6 space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="font-bold text-green-600">
                            ✓
                          </span>
                          {typeof feature === "string"
                            ? feature
                            : feature.name}
                        </li>
                      ))}
                    </ul>
                  )}

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyPackage(pkg._id)}
                  disabled={payingId !== null}
                  className="mt-auto w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payingId === pkg._id
                    ? "Processing..."
                    : "Buy Now"}
                </button>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
