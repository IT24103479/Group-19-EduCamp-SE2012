import axios from "axios";
import { PaymentDTO } from "../types/payment";

const API_URL = "http://localhost:8081/api/payments";

export const getAllPayments = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};
export const getPaymentById = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const createPayment = async (payment: PaymentDTO) => {
  const res = await axios.post(`${API_URL}/create`, payment);
  return res.data;
};

export const updatePayment = async (id: number, payment: PaymentDTO) => {
  const res = await axios.put(`${API_URL}/${id}`, payment);
  return res.data;
};

export const deletePayment = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export const capturePayment = async (orderId: string) => {
  const res = await axios.post(`${API_URL}/capture/${orderId}`);
  return res.data;
};
