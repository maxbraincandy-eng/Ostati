"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CITIES } from "@/lib/constants";

export default function SearchBar({
  initialQuery = "",
  initialCategory = "",
  initialCity = "",
}: {
  initialQuery?: string;
  initialCategory?: string;
  initialCity?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    router.push(`/masters?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="card flex flex-col gap-3 p-3 md:flex-row md:items-center"
      role="search"
    >
      <input
        className="input md:flex-[2]"
        placeholder="რა მომსახურება გჭირდება? მაგ: ელექტრიკი, რემონტი, სანტექნიკა…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="მომსახურების ძებნა"
      />
      <select
        className="input md:flex-1"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        aria-label="კატეგორია"
      >
        <option value="">ყველა კატეგორია</option>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        className="input md:flex-1"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="ქალაქი"
      >
        <option value="">ყველა ქალაქი</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-gold md:px-8">
        მოძებნა
      </button>
    </form>
  );
}
