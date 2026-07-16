import AiAssistant from "./AiAssistant";

export const metadata = { title: "AI დამხმარე" };

export default function AiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <p className="mb-3 inline-block rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-medium text-gold-light">
          Ostati AI
        </p>
        <h1 className="text-3xl font-bold md:text-4xl">აღწერე პრობლემა — AI გიპოვის ოსტატს</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          მაგალითად: „სამზარეულოში წყალი ჟონავს" — AI გააანალიზებს პრობლემას, შეაფასებს სავარაუდო
          ღირებულებას და შემოგთავაზებს შესაბამის სპეციალისტებს.
        </p>
      </div>
      <AiAssistant />
    </div>
  );
}
