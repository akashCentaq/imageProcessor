import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCardIcon,
  DownloadIcon,
  HistoryIcon,
  PlusIcon,
} from "lucide-react";
import{ UsageHistoryChart }from "@/polymet/components/usage-history-chart";
import PricingPlans from "@/polymet/components/pricing-plans";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetProfileQuery, useGetAllServicesQuery } from "@/redux/lib/api";
import { useGetAllTransactionsQuery } from "@/redux/lib/transactionsApi";
import { DateIntervalSelector } from "../components/dateIntervalSelector";

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const servicesInState = useSelector((state: RootState) => state.services.services);

  const { data: servicesData } = useGetAllServicesQuery(undefined, {
    skip: !!servicesInState && servicesInState.length > 0,
  });
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !!useSelector((state: RootState) => state.profile.profile),
  });
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useGetAllTransactionsQuery();

  const profile = useSelector((state: RootState) => state.profile.profile);

  // Process transactions data
  const transactions = transactionsData?.billingRecords
    ? Object.values(transactionsData.billingRecords)
      .flat()
      .map((t) => ({
        operation: t.serviceName,
        creditsUsed: t.creditsUsed,
        date: t.createdAt,
      }))
    : [];

  // Calculate total credits used
  const totalCreditsUsed = transactions.reduce(
    (total, entry) => total + entry.creditsUsed,
    0
  );

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credits & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your image processing credits and billing information
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Credits
                </CardTitle>
                <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.credits}</div>
                <p className="text-xs text-muted-foreground">
                  Current plan: {profile?.plan}
                </p>
                <Button
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => setActiveTab("purchase")}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Usage
                </CardTitle>
                <HistoryIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCreditsUsed}</div>
                <p className="text-xs text-muted-foreground">
                  Credits used across {transactions.length} operations
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => setActiveTab("history")}
                >
                  <HistoryIcon className="mr-2 h-4 w-4" />
                  View Full History
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cost Per Image
                </CardTitle>
                <DownloadIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {servicesInState?.length > 0
                    ? `${Math.min(...servicesInState.map(s => s.cost))}-${Math.max(...servicesInState.map(s => s.cost))} Credits`
                    : "1-3 Credits"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Depends on selected services
                </p>
                <div className="mt-4 space-y-2">
                  {servicesInState?.length > 0 ? (
                    servicesInState.map((service) => (
                      <div
                        key={service.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{service.name}</span>
                        <span className="font-medium">{service.cost} credit{service.cost > 1 ? 's' : ''}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Basic editing</span>
                        <span className="font-medium">1 credit</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Advanced editing</span>
                        <span className="font-medium">2 credits</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Premium features</span>
                        <span className="font-medium">3 credits</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <UsageHistoryChart />

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your last 5 credit usage transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p>Loading transactions...</p>
              ) : transactionsError ? (
                <p>Error loading transactions</p>
              ) : recentTransactions.length === 0 ? (
                <p>No transactions available</p>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{transaction.operation}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} at{" "}
                          {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="font-mono">
                        -{transaction.creditsUsed} credits
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase">
          <PricingPlans />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage History</CardTitle>
              <CardDescription>
                Complete history of your credit usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsageHistoryChart />

              <div className="mt-6 space-y-2">
                <h3 className="font-medium mb-2">All Transactions</h3>
                {transactionsLoading ? (
                  <p>Loading transactions...</p>
                ) : transactionsError ? (
                  <p>Error loading transactions</p>
                ) : transactions.length === 0 ? (
                  <p>No transactions available</p>
                ) : (
                  [...transactions]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{transaction.operation}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()} at{" "}
                            {new Date(transaction.date).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="font-mono">
                          -{transaction.creditsUsed} credits
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}