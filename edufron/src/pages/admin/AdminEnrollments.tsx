import { useEffect, useState } from "react";
import {getAllPayments,capturePayment,updatePayment,deletePayment } from "../../services/paymentService";
import { useToast } from "../../hooks/use-toast";
import { Payment } from "../../types/payment";
import { useForm } from "react-hook-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form";
import { Input } from "../../components/ui/input";

export default function PaymentManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (!editingPayment) return;

    try {
      await updatePayment(editingPayment.id, data);
      toast({ title: "Payment Updated" });
      setIsDialogOpen(false);
      setEditingPayment(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update payment." });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Class ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.id}</TableCell>
              <TableCell>{payment.userId}</TableCell>
              <TableCell>{payment.classId}</TableCell>
              <TableCell>{payment.amount}</TableCell>
              <TableCell>{payment.currency}</TableCell>
              <TableCell>
                <Badge variant={payment.paymentCompleted ? "default" : "secondary"}>
                  {payment.paymentCompleted ? "Completed" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="flex gap-2">
                {!payment.paymentCompleted && (
                  <Button onClick={() => handleCapture(payment.paypalOrderId)}>Capture</Button>
                )}
                <Button onClick={() => handleEdit(payment)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(payment.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "New Payment"}</DialogTitle>
            <DialogDescription>Edit the payment details below.</DialogDescription>
          </DialogHeader>

          <Form {...form} onSubmit={handleFormSubmit}>
            <FormField
              name="amount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="currency"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
