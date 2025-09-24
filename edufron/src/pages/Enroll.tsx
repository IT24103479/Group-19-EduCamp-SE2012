import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Extend Window type for PayPal SDK
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        createOrder: (
          data: Record<string, unknown>,
          actions: { order: { create: (options: unknown) => Promise<string> } }
        ) => Promise<string>;
        onApprove: (
          data: Record<string, unknown>,
          actions: { order: { capture: () => Promise<unknown> } }
        ) => Promise<void>;
        onError: (err: unknown) => void;
      }) => { render: (selector: string) => void };
    };
  }
}

const Enroll: React.FC = () => {
  const [paypalLoaded, setPaypalLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!paypalLoaded) {
      const script = document.createElement("script");
      script.src =
        "https://www.paypal.com/sdk/js?client-id=ATLa8zHvu_b-LEVL90i8pzBnn9Wx5PaeyEa1Pp9xRBLobxbBqcHjYSYV99tf6bK_ncj0RZWCzdgWn7R4&currency=USD";
      script.onload = () => setPaypalLoaded(true);
      document.head.appendChild(script);
    }
  }, [paypalLoaded]);

  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      window.paypal
        .Buttons({
          createOrder: (_data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "10.00",
                    currency_code: "USD",
                  },
                  description: "Enrollment Fee",
                },
              ],
            });
          },
          onApprove: (_data, actions) => {
            return actions.order.capture().then((details) => {
              toast.success("Payment successful! Enrollment complete.");
              console.log("Payment details:", details);
            });
          },
          onError: (err) => {
            toast.error("Payment failed. Please try again.");
            console.error("PayPal error:", err);
          },
        })
        .render("#paypal-button-container");
    }
  }, [paypalLoaded]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Enroll Now</h1>
          <p className="text-xl text-slate-600">
            Complete your enrollment with PayPal payment
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div id="paypal-button-container"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Enroll;
