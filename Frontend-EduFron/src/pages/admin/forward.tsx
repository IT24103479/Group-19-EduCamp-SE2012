  return (
     <div>
          <h1 className="text-2xl font-bold text-foreground">Enrollments Management</h1>
          <p className="text-muted-foreground">Manage student enrollments in classes</p>

      

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
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Enrollment
            </Button>
          </DialogTrigger>
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
