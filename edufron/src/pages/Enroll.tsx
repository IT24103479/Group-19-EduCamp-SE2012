import React from "react";
import { createPayment } from "../services/paymentService";
import { PaymentDTO } from "../types/payment";
import { useAuth } from "../contexts/AuthContext";

interface ClassItem {
  id: number;
  name: string;
  description: string;
  fee: number;
}

interface EnrollProps {
  selectedClass: ClassItem | null;
}

const Enroll: React.FC<EnrollProps> = ({ selectedClass }) => {
  const { user } = useAuth(); // ✅ now this will work

  if (!selectedClass) {
    return <p>Loading class details...</p>;
  }

  const handleEnroll = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const paymentDTO: PaymentDTO = {
      amount: selectedClass.fee,
      currency: "USD",
      classId: selectedClass.id,
      userId: user.id,
      description: `Enrollment for ${selectedClass.name}`,
    };

    try {
      const payment = await createPayment(paymentDTO);
      alert(`✅ Payment created! PayPal order ID: ${payment.paypalOrderId}`);
      // Optionally redirect to PayPal approval page
      // window.location.href = payment.approvalUrl;
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create payment");
    }
  };

  return (
    <div className="p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{selectedClass.name}</h2>
      <p>{selectedClass.description}</p>
      <p className="font-bold mb-4">Fee: ${selectedClass.fee}</p>
      <button
        onClick={handleEnroll}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Enroll
      </button>
    </div>
  );
};

export default Enroll;
