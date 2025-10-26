import React, { useEffect, useState } from "react";
import { createPayment } from "../../services/paymentService";
import { PaymentDTO } from "../../types/payment";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { API_BASE } from "../../lib/api";

interface ClassItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

const ClassList: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const { user } = useAuth(); // currently logged-in user

  // Example: fetch classes from API
useEffect(() => {
  console.log("🔍 Fetching available classes...");
  axios
    .get(`${API_BASE}/classes`)
    .then((res) => {
      console.log("✅ Classes response:", res.data);
      setClasses(res.data);
    })
    .catch((err) => {
      console.error("❌ Failed to fetch classes:", err);
    });
}, []);

  const handleEnroll = async (selectedClass: ClassItem) => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const paymentDTO: PaymentDTO = {
      amount: selectedClass.price,
      currency: "USD",
      classId: selectedClass.id,
      userId: user.id,
      description: `Enrollment for ${selectedClass.name}`,
    };

    try {
      const payment = await createPayment(paymentDTO);
      alert(`Payment created! PayPal order ID: ${payment.paypalOrderId}`);
      // You can redirect to PayPal approval page here if needed
    } catch (err) {
      console.error(err);
      alert("Failed to create payment");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Classes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="border p-4 rounded shadow">
            <h3 className="font-semibold">{cls.name}</h3>
            <p>{cls.description}</p>
            <p className="font-bold">Price: ${cls.price}</p>
            <button
              onClick={() => handleEnroll(cls)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Enroll / Pay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassList;
