
"use client";

import { useState } from "react";

export default function PaymentTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const payNow = async () => {
    try {
      setLoading(true);
      setMessage("Creating order...");

      // 1. Load Razorpay Checkout
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Razorpay script loading failed"));

          document.body.appendChild(script);
        });
      }

      // 2. Create Order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 500,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order creation failed");
      }

      // 3. Checkout Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Doctor Council",
        description: "Test Payment",
        order_id: data.order.id,

        config: {
          display: {
            sequence: [
              "block.upi",
              "block.cards",
              "block.netbanking",
              "block.wallets",
            ],
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  { method: "upi" },
                ],
              },
              cards: {
                name: "Credit / Debit Cards",
                instruments: [
                  { method: "card" },
                ],
              },
              netbanking: {
                name: "Net Banking",
                instruments: [
                  { method: "netbanking" },
                ],
              },
              wallets: {
                name: "Wallets",
                instruments: [
                  { method: "wallet" },
                ],
              },
            },
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        // 4. Verify Payment
        handler: async (paymentResponse) => {
          try {
            setMessage("Verifying payment...");

            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok || !result.success) {
              throw new Error(
                result.message || "Payment verification failed"
              );
            }

            setMessage(
              "Payment Successful! Payment ID: " +
              paymentResponse.razorpay_payment_id
            );

          } catch (error) {
            setMessage(error.message);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setMessage("Payment window closed");
            setLoading(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      if (!options.key) {
        throw new Error("Razorpay Key ID missing in .env.local");
      }

      // 5. Open Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (error) => {
        setMessage(
          error.error?.description || "Payment failed"
        );
        setLoading(false);
      });

      razorpay.open();

    } catch (error) {
      setMessage(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">

        <h1 className="text-2xl font-bold text-gray-800">
          Razorpay Test Payment
        </h1>

        <p className="mt-3 text-gray-500">
          Doctor Council Payment Gateway Testing
        </p>

        <div className="my-8">
          <p className="text-gray-500">Total Amount</p>

          <h2 className="text-4xl font-bold text-blue-600 mt-2">
            ₹500
          </h2>
        </div>

        <button
          onClick={payNow}
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && (
          <div className="mt-5 rounded-lg bg-gray-100 p-4 text-sm break-words">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}
