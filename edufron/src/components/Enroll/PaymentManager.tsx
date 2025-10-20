import React, { useEffect, useState } from "react";
import {
  getAllPayments,
  createPayment,
  capturePayment,
  updatePayment,
  deletePayment,
} from "../../services/paymentService";
import { PaymentDTO } from "../../types/payment";
import { useAuth } from "../../contexts/AuthContext";


const PaymentManager: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const { user } = useAuth(); // assume user.id exists

  const fetchPayments = async () => {
    const data = await getAllPayments();
    setPayments(data);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCreate = async () => {
    const paymentDTO: PaymentDTO = {
      amount: 10,
      currency: "USD",
      classId: 1,
      userId: user.id,
      description: "Class Fee",
    };
    const payment = await createPayment(paymentDTO);
    alert(`Payment created with order ID: ${payment.paypalOrderId}`);
    fetchPayments();
  };

  const handleCapture = async (orderId: string) => {
    const payment = await capturePayment(orderId);
    alert(`Payment captured! Transaction ID: ${payment.paypalTransactionId}`);
    fetchPayments();
  };

  const handleUpdate = async (id: number) => {
    const paymentDTO: PaymentDTO = {
      amount: 15,
      currency: "USD",
      classId: 1,
      userId: user.id,
      description: "Updated fee",
    };
    await updatePayment(id, paymentDTO);
    fetchPayments();
  };

  const handleDelete = async (id: number) => {
    await deletePayment(id);
    fetchPayments();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      <button onClick={handleCreate} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">
        Create Payment
      </button>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t">
              <td>{p.id}</td>
              <td>{p.paypalOrderId}</td>
              <td>{p.paypalTransactionId || "-"}</td>
              <td>{p.amount}</td>
              <td>{p.paymentCompleted ? "Yes" : "No"}</td>
              <td className="flex gap-2">
                <button
                  onClick={() => handleCapture(p.paypalOrderId)}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Capture
                </button>
                <button
                  onClick={() => handleUpdate(p.id)}
                  className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentManager;
