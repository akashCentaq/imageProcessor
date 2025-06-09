"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateIntervalSelector } from "./dateIntervalSelector";
import { useGetAllTransactionsQuery } from "@/redux/lib/transactionsApi";
import { useState } from "react";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfDay,
} from "date-fns";

export const description = "An area chart showing transaction history with gradient fill";

const chartConfig = {
  creditsUsed: {
    label: "Credits Used",
    color: "var(--chart-1)", // Blue for credits used
  },
  servicesPerformed: {
    label: "Services Performed",
    color: "var(--chart-2)", // Green for services performed
  },
} satisfies ChartConfig;

export function UsageHistoryChart() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { data: transactionsData, isLoading } = useGetAllTransactionsQuery({
    startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  });

  const chartData = (() => {
    if (!transactionsData?.billingRecords) return [];

    const allTransactions = Object.values(transactionsData.billingRecords).flat();

    const dates = allTransactions.map((t) => parseISO(t.createdAt));
    const minDate = dates.length ? new Date(Math.min(...dates)) : new Date();
    const maxDate = dates.length ? new Date(Math.max(...dates)) : new Date();

    const intervalStart = dateRange.from || minDate;
    const intervalEnd = dateRange.to || maxDate;

    const days = eachDayOfInterval({ start: intervalStart, end: intervalEnd });

    const data = days.map((day) => {
      const dayTransactions = allTransactions.filter((t) => {
        const createdAt = parseISO(t.createdAt);
        return (
          createdAt >= startOfDay(day) &&
          createdAt < startOfDay(new Date(day.getTime() + 86400000))
        );
      });

      const creditsUsed = dayTransactions.reduce(
        (sum, t) => sum + Math.max(t.creditsUsed, 0),
        0
      );
      const servicesPerformed = dayTransactions.length;

      return {
        date: format(day, "yyyy-MM-dd"),
        creditsUsed,
        servicesPerformed,
      };
    });

    // Sort data chronologically
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  const trendPercentage = (() => {
    if (chartData.length < 2) return { creditsUsed: 0, servicesPerformed: 0 };
    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const creditsTrend =
      previous.creditsUsed === 0
        ? 0
        : ((latest.creditsUsed - previous.creditsUsed) / previous.creditsUsed * 100).toFixed(1);
    const servicesTrend =
      previous.servicesPerformed === 0
        ? 0
        : ((latest.servicesPerformed - previous.servicesPerformed) / previous.servicesPerformed * 100).toFixed(1);
    return { creditsUsed: Number(creditsTrend), servicesPerformed: Number(servicesTrend) };
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage History Chart</CardTitle>
            <CardDescription>
              Showing total credits used and services performed per day
            </CardDescription>
          </div>
          <DateIntervalSelector onDateRangeChange={setDateRange} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          {isLoading ? (
            <div>Loading...</div>
          ) : chartData.length === 0 ? (
            <div>No data available for the selected range.</div>
          ) : (
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(parseISO(value), "MMM dd")}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillCreditsUsed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-creditsUsed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-creditsUsed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillServicesPerformed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-servicesPerformed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-servicesPerformed)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="servicesPerformed"
                type="monotone"
                fill="url(#fillServicesPerformed)"
                fillOpacity={0.4}
                stroke="var(--color-servicesPerformed)"
                stackId="a"
              />
              <Area
                dataKey="creditsUsed"
                type="monotone"
                fill="url(#fillCreditsUsed)"
                fillOpacity={0.4}
                stroke="var(--color-creditsUsed)"
                stackId="a"
              />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {isLoading ? (
                "Loading trend..."
              ) : (
                <>
                  Credits trending {trendPercentage.creditsUsed >= 0 ? "up" : "down"} by{" "}
                  {Math.abs(trendPercentage.creditsUsed)}% today{" "}
                  <TrendingUp className="h-4 w-4" />
                  <br />
                  Services trending {trendPercentage.servicesPerformed >= 0 ? "up" : "down"} by{" "}
                  {Math.abs(trendPercentage.servicesPerformed)}% today
                </>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "LLL dd, y")} - ${format(
                    dateRange.to,
                    "LLL dd, y"
                  )}`
                : "All time"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}