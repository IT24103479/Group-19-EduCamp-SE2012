import React, { useState } from "react";
import { createPayment, capturePayment } from "../../services/paymentService";

interface ClassPaymentProps {
  userId: number;
  classId: number;
  amount: number;      // Pass the class fee
  currency?: string;   // Optional, default USD
  className?: string;  // For description
}

const ClassPayment: React.FC<ClassPaymentProps> = ({ userId, classId, 
    amount,
  currency = "USD",
  className = "Selected Class", }) => {
  const [paypalUrl, setPaypalUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const requestPayload = { userId, classId ,
        amount,
        currency,
        description: `Enrollment for ${className}`,
      };
      console.log("ClassPayment request:", requestPayload);
      const response = await createPayment(requestPayload);
      console.log("ClassPayment response:", response);
      setPaypalUrl(response.approvalUrl);
      localStorage.setItem("paypalOrderId", response.paypalOrderId);
      
    } catch (err: any) {
      setError("Failed to get PayPal link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <button
        className="bg-emerald-500 text-white px-4 py-2 rounded"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with PayPal"}
      </button>
      {paypalUrl && (
        <div className="mt-4">
          <a
            href={paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            PayPal
          </a>
        </div>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ClassPayment;
