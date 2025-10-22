import { useEffect, useState } from "react";
import {getAllPayments,capturePayment,updatePayment,deletePayment } from "../../services/paymentService";
import { useToast } from "../../hooks/use-toast";
import { payment } from "../../types/payment";
import { useForm } from "react-hook-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,DialogTrigger } from "../../components/ui/dialog";
import { Plus, Search, Edit, Trash2, Mail, Phone, GraduationCap, Star } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";


export default function PaymentManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { toast } = useToast();
   

  const form = useForm({
    defaultValues: {
      amount: 0,
      currency: "USD",

    },
  });

  // Fetch payments on load
  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      setPayments(data);
      console.log(data);
      const formattedData = data.map(p => ({
  ...p,
  status: p.paymentCompleted ? "Completed" : "Pending"
}));
      setPayments(formattedData);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch payments." });
    }
  };


  useEffect(() => {
    fetchPayments();
  }, []);

  
  // Capture PayPal payment
  const handleCapture = async (orderId: string) => {
    try {
      const updated = await capturePayment(orderId);
      toast({ title: "Payment Captured", description: `Transaction ID: ${updated.paypalTransactionId}` });
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to capture payment." });
    }
  };

  // Delete payment
  const handleDelete = async (id: number) => {
    try {
      await deletePayment(id);
      toast({ title: "Payment Deleted" });
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete payment." });
    }
  };
  // Edit payment
  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    form.reset({
      amount: payment.amount,
      currency: payment.currency,
    });
    setIsCreateDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (!editingPayment) return;

    try {
      await updatePayment(editingPayment.id, data);
      toast({ title: "Payment Updated" });
      setIsCreateDialogOpen(false);
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update payment." });
    }
  };

const filteredPayments = payments.filter((p) =>
 // p.classId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.userId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.amount.toString().includes(searchTerm) ||
  p.currency.toLowerCase().includes(searchTerm.toLowerCase()) 
 // p.status?.toLowerCase().includes(searchTerm.toLowerCase())
);

// ...existing code...
// ...existing code...
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-700">Payments Management</h1>
          <p className="text-slate-500">Manage student payments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-600 text-white hover:bg-sky-700 rounded-md px-4 py-2 flex items-center gap-2 shadow">
              <Plus className="w-4 h-4" />
              {editingPayment ? "Edit Payment" : "Edit Payment"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-sky-700">
                {editingPayment ? "Edit Payment" : "Create Payment"}
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                {editingPayment
                  ? "Update the payment information below."
                  : "Fill in the details to create a new payment."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-700">Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="border-sky-300 focus:border-sky-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-700">Currency</FormLabel>
                      <FormControl>
                        <Input {...field} className="border-sky-300 focus:border-sky-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Add userId, classId, status fields if needed in the form */}
                <DialogFooter>
                  <Button
                    type="button"
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md px-4 py-2"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingPayment(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-sky-600 text-white hover:bg-sky-700 rounded-md px-4 py-2"
                  >
                    {editingPayment ? "Update Payment" : "Create Payment"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

 {/* 🔍 Search Bar */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>
      {/* Payments Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sky-700">All Payments</CardTitle>
          <CardDescription className="text-slate-500">Manage student payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">User ID</TableHead>
                <TableHead className="text-slate-600">Class ID</TableHead>
                <TableHead className="text-slate-600">Amount</TableHead>
                <TableHead className="text-slate-600">Currency</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
<TableBody>
  {filteredPayments.map((payment) => (
    <TableRow key={payment.id}>
      <TableCell>{payment.id}</TableCell>
      <TableCell>
        <Badge className="bg-sky-100 text-sky-700 border-sky-200">{payment.userId}</Badge>
      </TableCell>
      <TableCell>
        <Badge className="bg-sky-100 text-sky-700 border-sky-200">{payment.classId}</Badge>
      </TableCell>
      <TableCell>{payment.amount}</TableCell>
      <TableCell>{payment.currency}</TableCell>
      <TableCell>
        <Badge
          className={
            payment.status === "completed"
              ? "bg-sky-100 text-sky-700 border-sky-200"
              : payment.status === "pending"
              ? "bg-slate-100 text-slate-700 border-slate-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }
        >
          {payment.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sky-700 hover:bg-sky-100"
            onClick={() => handleEdit(payment)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-700 hover:bg-slate-100"
            onClick={() => handleDelete(payment.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  );
// ...existing code...
}