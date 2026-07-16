import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";

export type AiAnalysis = {
  category: CategorySlug;
  estimateMin: number;
  estimateMax: number;
  advice: string;
  source: "claude" | "builtin";
};

// Georgian keyword map + typical price ranges (GEL) per category.
const RULES: { slug: CategorySlug; keywords: string[]; min: number; max: number }[] = [
  { slug: "plumber", keywords: ["წყალ", "ჟონავ", "მილ", "ონკან", "სანტექნიკ", "კანალიზაც", "უნიტაზ", "ნიჟარ", "შხაპ", "ბოილერ"], min: 40, max: 200 },
  { slug: "electrician", keywords: ["დენ", "ელექტრო", "ელექტრიკ", "როზეტ", "ნათურ", "სადენ", "გამანაწილებ", "ჩამრთველ", "მოკლე ჩართვ"], min: 30, max: 180 },
  { slug: "hvac", keywords: ["გათბობ", "კონდიციონერ", "კონდიცირებ", "ცივა", "ცხელა", "რადიატორ", "ვენტილაც", "ქვაბ"], min: 60, max: 350 },
  { slug: "appliances", keywords: ["სარეცხი მანქან", "მაცივ", "ჭურჭლის სარეცხ", "ღუმელ", "ტექნიკ", "მიკროტალღ", "ტელევიზორ"], min: 40, max: 250 },
  { slug: "doors-windows", keywords: ["კარ", "ფანჯ", "საკეტ", "სახელურ", "მინ"], min: 30, max: 300 },
  { slug: "furniture", keywords: ["ავეჯ", "კარად", "მაგიდ", "სკამ", "თარო", "აწყობ"], min: 50, max: 600 },
  { slug: "renovation", keywords: ["რემონტ", "კედ", "ჭერ", "იატაკ", "ღებვ", "შპალერ", "პლიტკ", "ლამინატ", "ბათქაშ"], min: 200, max: 5000 },
  { slug: "construction", keywords: ["მშენებ", "აშენებ", "ბეტონ", "ფუნდამენტ", "სახურავ"], min: 500, max: 20000 },
  { slug: "designer", keywords: ["დიზაინ", "ინტერიერ", "პროექტ", "ესკიზ"], min: 150, max: 2000 },
  { slug: "cleaning", keywords: ["დასუფთავებ", "დალაგებ", "წმენდ", "სუფთა"], min: 50, max: 250 },
];

export function builtinAnalyze(problem: string): AiAnalysis {
  const text = problem.toLowerCase();
  let best: (typeof RULES)[number] | null = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  const rule = best ?? { slug: "other" as CategorySlug, keywords: [], min: 50, max: 300 };
  const name = CATEGORIES.find((c) => c.slug === rule.slug)?.name ?? "სპეციალისტი";
  return {
    category: rule.slug,
    estimateMin: rule.min,
    estimateMax: rule.max,
    advice: best
      ? `აღწერიდან ჩანს, რომ გჭირდება: ${name}. სავარაუდო ღირებულება ${rule.min}–${rule.max}₾ (საბოლოო ფასი დამოკიდებულია სამუშაოს მოცულობაზე). ქვემოთ შეგირჩიეთ შესაბამისი ოსტატები.`
      : `პრობლემის ზუსტად კლასიფიცირება ვერ მოხერხდა — გირჩევთ განათავსო ღია შეკვეთა კატეგორიაში „სხვა მომსახურება", რომ ოსტატებმა თავად შემოგთავაზონ ფასი.`,
    source: "builtin",
  };
}

const SLUGS = CATEGORIES.map((c) => c.slug);

export async function analyzeProblem(problem: string): Promise<AiAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) return builtinAnalyze(problem);

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system:
        "შენ ხარ Ostati-ს (ხელოსნების Marketplace საქართველოში) AI დამხმარე. მომხმარებელი აღწერს საყოფაცხოვრებო პრობლემას ქართულად. შენი ამოცანაა: 1) აირჩიო ყველაზე შესაფერისი კატეგორია, 2) შეაფასო სავარაუდო ღირებულება ლარებში (რეალისტური საბაზრო ფასები საქართველოსთვის), 3) დაწერო მოკლე, პრაქტიკული რჩევა ქართულად (2-4 წინადადება).",
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              category: { type: "string", enum: SLUGS },
              estimateMin: { type: "integer" },
              estimateMax: { type: "integer" },
              advice: { type: "string" },
            },
            required: ["category", "estimateMin", "estimateMax", "advice"],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: "user", content: problem }],
    });

    if (response.stop_reason === "refusal") return builtinAnalyze(problem);
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return builtinAnalyze(problem);
    const parsed = JSON.parse(textBlock.text) as Omit<AiAnalysis, "source">;
    return { ...parsed, source: "claude" };
  } catch {
    // Any API failure falls back to the deterministic analyzer.
    return builtinAnalyze(problem);
  }
}
