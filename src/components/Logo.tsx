import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Ostati — მთავარი">
      <span
        className={`grid place-items-center rounded-xl bg-gradient-to-br from-gold-light to-gold-dark font-black text-ink ${
          size === "lg" ? "h-12 w-12 text-2xl" : "h-9 w-9 text-lg"
        }`}
      >
        O
      </span>
      <span className={`font-bold tracking-tight ${size === "lg" ? "text-3xl" : "text-xl"}`}>
        Ostati<span className="gold-text">.</span>
      </span>
    </Link>
  );
}
