export const CATEGORIES = [
  { slug: "electrician", name: "ელექტრიკი", icon: "⚡" },
  { slug: "plumber", name: "სანტექნიკოსი", icon: "🔧" },
  { slug: "hvac", name: "გათბობა / კონდიცირება", icon: "❄️" },
  { slug: "renovation", name: "ბინის რემონტი", icon: "🏠" },
  { slug: "furniture", name: "ავეჯის დამზადება", icon: "🪑" },
  { slug: "doors-windows", name: "კარ-ფანჯრის ხელოსანი", icon: "🚪" },
  { slug: "appliances", name: "ტექნიკის შეკეთება", icon: "🔌" },
  { slug: "construction", name: "მშენებლობა", icon: "🏗️" },
  { slug: "designer", name: "დიზაინერი", icon: "🎨" },
  { slug: "cleaning", name: "დასუფთავება", icon: "🧹" },
  { slug: "other", name: "სხვა მომსახურება", icon: "🛠️" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CITIES = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "გორი",
  "ზუგდიდი",
  "ფოთი",
  "თელავი",
] as const;

export const ROLES = ["CUSTOMER", "MASTER", "ADMIN"] as const;

export const BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "მოლოდინში",
  ACCEPTED: "მიღებული",
  IN_PROGRESS: "მიმდინარე",
  COMPLETED: "დასრულებული",
  CANCELLED: "გაუქმებული",
};

export const PLATFORM_COMMISSION = 0.08; // 8% per completed job

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export function categoryIcon(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.icon ?? "🛠️";
}
