import { useQuery } from "@tanstack/react-query";
import type { Payment } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";
import { Loader2, DollarSign, FileText, User, Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Nav from "@/components/nav";
import { Badge } from "@/components/ui/badge";

export default function PaymentLogs() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({ 
    queryKey: ["/api/payments"], 
  });

  const summaryStats = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalFees = payments.reduce((sum, p) => sum + p.fee, 0);
    const netRevenue = totalRevenue - totalFees;
    return { totalRevenue, totalFees, netRevenue, transactionCount: payments.length };
  }, [payments]);

  const columns = useMemo(() => [
    {
      header: "Transaction ID",
      accessorKey: "paymentIntentId",
      cell: ({ row }: any) => <div className="font-mono text-xs text-muted-foreground">{row.original.paymentIntentId}</div>,
    },
    {
        header: "Student",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-foreground">{row.original.studentName}</div>
            </div>
          </div>
        ),
    },
    {
      header: "Document",
      accessorKey: "documentType",
       cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span>{row.original.documentType}</span>
          </div>
        ),
    },
    {
      header: "Amount (PHP)",
      accessorKey: "amount",
      cell: ({ row }: any) => <div className="font-medium text-primary">{row.original.amount.toFixed(2)}</div>,
    },
    {
      header: "Stripe Fee",
      accessorKey: "fee",
      cell: ({ row }: any) => <div className="text-sm text-muted-foreground">{row.original.fee.toFixed(2)}</div>,
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: ({ row }: any) => (
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(row.original.createdAt.seconds * 1000), "MMM d, yyyy h:mm a")}</span>
        </div>
      ),
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }: any) => (
            <Badge variant={row.original.status === 'succeeded' ? 'success' : 'outline'}>
                {row.original.status}
            </Badge>
        )
    }
  ], []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
        <Nav />
        <div className="container mx-auto pt-24 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <Nav />
      <motion.main
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto pt-32 px-4 pb-8"
      >
        <div className="flex flex-col gap-8">
          <header>
            <h1 className="text-3xl font-bold text-blue-900">Payment Logs</h1>
            <p className="text-blue-800/90">Track all successful GCash payments via Stripe.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">PHP {summaryStats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-blue-800/80">from {summaryStats.transactionCount} transactions</p>
              </CardContent>
            </Card>
             <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Stripe Fees</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">PHP {summaryStats.totalFees.toFixed(2)}</div>
                 <p className="text-xs text-blue-800/80">~3% of total revenue</p>
              </CardContent>
            </Card>
             <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Net Revenue</CardTitle>
                <Wallet className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">PHP {summaryStats.netRevenue.toFixed(2)}</div>
                <p className="text-xs text-blue-800/80">After all fees</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{summaryStats.transactionCount}</div>
                <p className="text-xs text-blue-800/80">Successful payments</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">All Transactions</CardTitle>
              <CardDescription className="text-blue-800/90">A detailed log of every payment received.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={payments} columns={columns} />
            </CardContent>
          </Card>
        </div>
      </motion.main>
    </div>
  );
}
