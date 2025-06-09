export interface UserCredit {
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: "free" | "basic" | "pro" | "enterprise";
  usageHistory: {
    date: string;
    creditsUsed: number;
    operation: string;
  }[];
}

export const CURRENT_USER_CREDITS: UserCredit = {
  id: "usr_123456789",
  name: "John Doe",
  email: "john.doe@example.com",
  credits: 75,
  plan: "basic",
  usageHistory: [
    {
      date: "2023-06-15T10:30:00Z",
      creditsUsed: 5,
      operation: "Background Replacement",
    },
    {
      date: "2023-06-14T14:45:00Z",
      creditsUsed: 10,
      operation: "Advanced Retouching",
    },
    {
      date: "2023-06-12T09:15:00Z",
      creditsUsed: 3,
      operation: "Skin Smoothing",
    },
    {
      date: "2023-06-10T16:20:00Z",
      creditsUsed: 7,
      operation: "Color Correction",
    },
    {
      date: "2023-06-08T11:05:00Z",
      creditsUsed: 5,
      operation: "Background Replacement",
    },
    {
      date: "2023-06-05T13:40:00Z",
      creditsUsed: 15,
      operation: "Batch Processing (15 images)",
    },
  ],
};

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    price: 9.99,
    credits: 50,
    features: [
      "50 image processing credits",
      "Basic editing features",
      "Email support",
      "Credits valid for 30 days",
    ],
  },
  {
    id: "plan_pro",
    name: "Professional",
    price: 24.99,
    credits: 150,
    features: [
      "150 image processing credits",
      "All editing features",
      "Priority email support",
      "Credits valid for 60 days",
    ],

    popular: true,
  },
  {
    id: "plan_business",
    name: "Business",
    price: 49.99,
    credits: 350,
    features: [
      "350 image processing credits",
      "All editing features",
      "Priority email & chat support",
      "Credits valid for 90 days",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: 99.99,
    credits: 1000,
    features: [
      "1000 image processing credits",
      "All editing features",
      "Dedicated support manager",
      "Credits valid for 1 year",
      "API access",
    ],
  },
];
