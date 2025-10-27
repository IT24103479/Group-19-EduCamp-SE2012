import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { capturePayment } from "../../services/paymentService";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // 1) Prefer token from PayPal redirect: ?token=<orderId>
    const params = new URLSearchParams(location.search);
    const tokenFromQuery = params.get("token");

    

    // 2) Fallback to previously-stored order id (created before redirect)
    const storedOrderId = localStorage.getItem("paypalOrderId");

    const finalOrderId = tokenFromQuery || storedOrderId;
    setOrderId(finalOrderId);

    if (!finalOrderId) {
      setStatus("No PayPal order ID found.");
      setLoading(false);
      return;
    }

    // 3) Call backend capture (backend will use session cookie or X-Session-Id)
    capturePayment(finalOrderId)
      .then((res) => {
        setStatus("Payment captured successfully!");
        // cleanup fallback storage
        localStorage.removeItem("paypalOrderId");
      })
      .catch((err) => {
        // Surface useful error info for debugging and UX
        const backendMsg = err?.response?.data;
        const message =
          backendMsg?.message ||
          backendMsg?.details ||
          (err?.response ? JSON.stringify(err.response.data) : err.message);
        console.error("capturePayment error:", err);
        setStatus(`Failed to capture payment: ${message}`);
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  // display the pathname without leading/trailing slashes (e.g. "/payment-success" -> "payment-success")
  const pathDisplay = (location.pathname || "")
    .replace(/^\/+|\/+$/g, "")
    .trim() || "redirect";

  return (
    <>
      <Header />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - text box (half page) with emerald background */}
        <div className="flex items-center justify-center">
          <div className="w-full p-6 rounded shadow bg-emerald-500/10">
            <h2 className="text-2xl font-bold mb-4">Payment Status</h2>

            {loading ? (
              <div className="text-slate-500">Processing payment...</div>
            ) : (
              <div className={status.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"}>
                {status}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  // navigate back to class payment or wherever appropriate
                  window.location.href = "/classes";
                }}
                // "stale gray" styling for Back button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Right column - additional info box with blue background */}
        <div className="flex items-center justify-center">
          <div className="w-full p-6 rounded shadow bg-blue-600/10">
            <h3 className="text-lg font-medium mb-3">Payment Details</h3>
            <div className="text-sm text-gray-700 mb-2">
              <strong>Order ID:</strong>{" "}
              <span className="font-mono text-gray-800">{orderId ?? "Not available"}</span>
            </div>

            <div className="text-sm text-gray-700">
              <strong>Status:</strong> <span>{pathDisplay}</span>
            </div>

            {/* Additional details can be added here */}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default PaymentSuccess;