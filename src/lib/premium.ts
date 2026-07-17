export const PREMIUM_PLANS = [
  {
    id: "BASIC" as const,
    name: "Basic",
    price: 10,
    months: 1,
    perks: ["ძებნაში მაღლა გამოჩენა", "Premium ბეჯი პროფილზე"],
  },
  {
    id: "STANDARD" as const,
    name: "Standard",
    price: 20,
    months: 1,
    perks: ["ყველაფერი Basic-დან", "გამორჩეული ბარათი Marketplace-ზე", "პრიორიტეტი ღია მოთხოვნებში"],
  },
  {
    id: "PRO" as const,
    name: "Pro",
    price: 30,
    months: 1,
    perks: ["ყველაფერი Standard-დან", "მთავარ გვერდზე გამოჩენა", "პირადი მხარდაჭერა"],
  },
];
