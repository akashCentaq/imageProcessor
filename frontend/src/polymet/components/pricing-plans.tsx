import { useState } from "react";
import { CheckIcon, CreditCardIcon } from "lucide-react";
import { useGetAllPlansQuery } from "@/redux/lib/plans";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: plansData, isLoading, error } = useGetAllPlansQuery();

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId);
    setIsDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    // In a real app, this would process the payment
    // and update the user's credits
    setIsDialogOpen(false);
    setSelectedPlan(null);
    alert("Purchase successful! Credits have been added to your account.");
  };

  if (isLoading) {
    return <div>Loading pricing plans...</div>;
  }

  if (error) {
    return <div>Error loading pricing plans: {error.toString()}</div>;
  }

  const plans = plansData?.plans || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Purchase Image Processing Credits
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose the plan that works best for your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.name === "Business" // Assuming "Business" is the popular plan
                ? "border-primary shadow-md dark:shadow-primary/20"
                : ""
            }`}
          >
            {plan.name === "Business" && (
              <Badge
                variant="default"
                className="absolute right-4 top-4 rounded-sm px-2"
              >
                Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">${(plan.price / 100).toFixed(2)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-lg font-semibold mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
                {plan.credits} credits
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.name === "Business" ? "default" : "outline"}
                onClick={() => handlePurchase(plan.id)}
              >
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Enter your payment details to purchase credits.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                className="font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}