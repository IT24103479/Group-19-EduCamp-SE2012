import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { capturePayment } from "../../services/paymentService";

const PaymentSuccess: React.FC = () => {
  
  const location = useLocation();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract PayPal order ID from query params
    const params = new URLSearchParams(location.search);
   // const orderId = params.get("token") || params.get("orderId");
   const orderId = localStorage.getItem("paypalOrderId");
    if (!orderId) {
      setStatus("No PayPal order ID found in URL.");
      setLoading(false);
      return;
    }
    capturePayment(orderId)
      .then(() => {
        setStatus("Payment captured successfully!");
      })
      .catch(() => {
        setStatus("Failed to capture payment.");
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Payment Status</h2>
      {loading ? (
        <div className="text-slate-500">Processing payment...</div>
      ) : (
        <div className={status.includes("success") ? "text-green-600" : "text-red-600"}>{status}</div>
      )}
    </div>
  );
};

export default PaymentSuccess;
