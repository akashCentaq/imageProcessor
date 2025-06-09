import { useState } from "react";
import { CreditCardIcon, ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { CURRENT_USER_CREDITS } from "@/polymet/data/user-credits";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { useGetProfileQuery } from "@/redux/lib/api";
import { RootState } from "@/redux/store";

interface CreditUsageTrackerProps {
  compact?: boolean;
}

export default function CreditUsageTracker({
  compact = false,
}: CreditUsageTrackerProps) {
  const { credits, plan } = CURRENT_USER_CREDITS;
  const { profile } = useSelector((state: RootState) => state.profile);
  const { data: profileData, refetch } = useGetProfileQuery(undefined, {
    skip: !!profile, // Skip fetching if profile exists in state
  });
  console.log("Profile data:", profileData);

  // Calculate credit usage percentage based on plan
  const [maxCredits] = useState(() => {
    switch (plan) {
      case "free":
        return 25;
      case "basic":
        return 100;
      case "pro":
        return 250;
      case "enterprise":
        return 1000;
      default:
        return 100;
    }
  });

  const usagePercentage = Math.min(100, (profile?.credits / maxCredits) * 100);
  const isLowCredits = profile?.credits < 20;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CreditCardIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Credits</span>
            </div>
            <Link
              to="/credits"
              className="text-xs text-primary hover:underline flex items-center"
            >
              Details
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-sm font-mono ${isLowCredits ? "text-destructive" : ""}`}
            >
              {profile?.credits} credits
            </span>
            <span className="text-xs text-muted-foreground">
              {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            </span>
          </div>
          <Progress value={usagePercentage} className="h-1.5" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Credit Usage
          </div>
          <Link to="/credits">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              Manage Credits
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-2xl font-bold font-mono ${isLowCredits ? "text-destructive" : ""}`}
              >
                {credits}
              </p>
              <p className="text-sm text-muted-foreground">
                Available credits on{" "}
                {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
              </p>
            </div>
            {isLowCredits && (
              <Link to="/credits">
                <Button size="sm" variant="destructive">
                  Buy Credits
                </Button>
              </Link>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Usage</span>
              <span>{Math.round(usagePercentage)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{maxCredits}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
