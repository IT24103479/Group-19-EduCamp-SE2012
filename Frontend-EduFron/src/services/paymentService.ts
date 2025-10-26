import axios from "axios";
import { type PaymentDTO } from "../types/payment";

const API_URL = "VITE_BACKEND_URL/api/payments";

export const getAllPayments = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};
export const getPaymentById = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

export const createPayment = async (payment: PaymentDTO) => {
  const res = await axios.post(`${API_URL}/create`, payment, { withCredentials: true });
  return res.data;
};

export const updatePayment = async (id: number, payment: PaymentDTO) => {
  const res = await axios.put(`${API_URL}/${id}`, payment, { withCredentials: true });
  return res.data;
};

export const deletePayment = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
  return res.data;
};

/**
 * Capture a PayPal order and attach the authenticated user.
 * - Sends userId as a query param when provided.
 * - Ensures cookies/session are sent by setting withCredentials: true.
 *
 * Usage:
 *  const { user } = useAuth();
 *  await capturePayment(orderId, user?.id);
 */
export const capturePayment = async (orderId: string, userId?: number | string) => {
  const url = `${API_URL}/capture/${encodeURIComponent(orderId)}`;
  const params = userId !== undefined && userId !== null ? { userId } : {};
  const res = await axios.post(url, null, {
    params,
    withCredentials: true, // send cookies/session so backend can also derive user from session if implemented
  });
  return res.data;
};