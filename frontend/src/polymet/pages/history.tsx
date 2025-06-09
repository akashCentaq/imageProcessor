import { useState } from "react";
import { DownloadIcon, SearchIcon } from "lucide-react";
import HistoryItem from "@/polymet/components/history-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetAllTransactionsQuery } from "@/redux/lib/transactionsApi";
import { useGetOrderStatusQuery } from "@/redux/lib/statusApi";

interface Transaction {
  id: string;
  serviceName: string;
  creditsUsed: number;
  createdAt: string;
}

interface HistoryItemData {
  id: string; // Using orderId
  name: string; // Derived from first transaction's serviceName
  services: string[]; // List of serviceNames
  creditsUsed: number; // Sum of creditsUsed
  date: string; // Earliest createdAt
  status: string; // From statusApi, mapped to pending/completed/failed
  imageCount: number; // Number of transactions in the order
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch transactions
  const { data: transactionsData, isLoading, isError } = useGetAllTransactionsQuery();

  // Transform transactions data into HistoryItemData format
  const historyItems: HistoryItemData[] = transactionsData?.billingRecords
    ? Object.entries(transactionsData.billingRecords).map(([orderId, transactions]) => {
        // Fetch status for this order
        const { data: statusData } = useGetOrderStatusQuery(orderId);

        const creditsUsed = transactions.reduce((sum, t) => sum + t.creditsUsed, 0);
        const earliestDate = transactions.reduce((earliest, t) => {
          const currentDate = new Date(t.createdAt).getTime();
          return !earliest || currentDate < new Date(earliest).getTime() ? t.createdAt : earliest;
        }, transactions[0].createdAt);

        // Map statusApi's "processing" to "pending" for UI consistency
        const status = statusData?.status === "processing" ? "pending" : statusData?.status || "pending";

        return {
          id: orderId,
          name: transactions[0].serviceName, // Use first service name as item name
          services: transactions.map(t => t.serviceName),
          creditsUsed,
          date: earliestDate,
          status, // Use mapped status
          imageCount: transactions.length, // Number of transactions as image count
        };
      })
    : [];

  // Filter and sort history items
  const filteredHistory = historyItems
    .filter((item) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.services.some((service) =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter by status
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const completedJobs = filteredHistory.filter((item) => item.status === "completed");
  const pendingJobs = filteredHistory.filter((item) => item.status === "pending");
  const failedJobs = filteredHistory.filter((item) => item.status === "failed");

  // Calculate total credits used
  const totalCreditsUsed = historyItems.reduce(
    (total, item) => total + item.creditsUsed,
    0
  );

  // Calculate total images processed
  const totalImagesProcessed = historyItems.reduce(
    (total, item) => item.status === "completed" ? total + item.imageCount : total,
    0
  );

  if (isLoading) {
    return <div className="text-center py-12">Loading transactions...</div>;
  }

  if (isError) {
    return <div className="text-center py-12 text-red-500">Failed to load transactions</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Processing History
        </h1>
        <p className="text-muted-foreground mt-2">
          View and download your previously processed images
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Total Jobs</div>
          <div className="text-2xl font-bold">{historyItems.length}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Images Processed</div>
          <div className="text-2xl font-bold">{totalImagesProcessed}</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-sm text-muted-foreground">Credits Used</div>
          <div className="text-2xl font-bold">{totalCreditsUsed}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or service..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({filteredHistory.length})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingJobs.length})
          </TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedJobs.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No processing jobs found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {completedJobs.length > 0 ? (
            <div className="space-y-4">
              {completedJobs.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed jobs found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          {pendingJobs.length > 0 ? (
            <div className="space-y-4">
              {pendingJobs.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending jobs found</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="failed" className="mt-6">
          {failedJobs.length > 0 ? (
            <div className="space-y-4">
              {failedJobs.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No failed jobs found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {filteredHistory.length > 0 && completedJobs.length > 0 && (
        <div className="flex justify-end">
          <Button>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      )}
    </div>
  );
}