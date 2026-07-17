# Ostati — პრემიუმ ხელოსნების Marketplace 🇬🇪

**Ostati** აკავშირებს მომხმარებლებს სანდო, ვერიფიცირებულ ხელოსნებთან საქართველოში — „Uber ხელოსნებისთვის". მომხმარებელი წუთებში პოულობს სპეციალისტს, ხედავს რეიტინგს, პორტფოლიოს და ფასებს, და უკვეთავს მომსახურებას პლატფორმაზევე.

## ✨ ფუნქციები (MVP — Phase 1 + Phase 2 საწყისები)

- **Landing page** — Hero, ძებნა (მომსახურება + ქალაქი), კატეგორიები, გამორჩეული ოსტატები
- **Authentication** — Email/პაროლი (bcrypt), Google OAuth (env-ით ჩართვადი), როლები: CUSTOMER / MASTER / ADMIN
- **Marketplace** — ოსტატების ბარათები ფოტოთი, რეიტინგით, გამოცდილებით, ფასით; ფილტრები კატეგორიით/ქალაქით/ტექსტით; Premium პროფილები ძებნაში მაღლა
- **ოსტატის პროფილი** — ბიო, სამუშაო საათები, ფასები, პორტფოლიო, რეალური მიმოხილვები, „Verified Ostati Professional" ბეჯი
- **შეკვეთის სისტემა** — აღწერა, ფოტოების ატვირთვა, მისამართი, სასურველი დრო; პირდაპირი ან ღია მოთხოვნა; ოსტატების შეთავაზებები (bidding); სტატუსები: Pending → Accepted → In Progress → Completed / Cancelled
- **ჩატი** — რეალური დროის მიმოწერა დამკვეთსა და ოსტატს შორის თითო შეკვეთაზე
- **ოსტატის Dashboard** — ახალი მოთხოვნები, მიმდინარე/დასრულებული სამუშაოები, შემოსავლის სტატისტიკა (8% საკომისიოს გათვალისწინებით)
- **მომხმარებლის პროფილი** — შეკვეთების ისტორია, შენახული ოსტატები (ფავორიტები), შეფასებები
- **AI დამხმარე** — პრობლემის აღწერით არჩევს კატეგორიას, აფასებს ღირებულებას და გთავაზობთ ოსტატებს. `ANTHROPIC_API_KEY`-ის მითითებისას იყენებს Claude API-ს (structured outputs), წინააღმდეგ შემთხვევაში ჩაშენებულ ქართულ keyword-ანალიზატორს
- **Admin Panel** — მომხმარებლების/ოსტატების სტატისტიკა, ვერიფიკაცია, Premium სტატუსის მართვა, შეკვეთების კონტროლი, პლატფორმის შემოსავალი
- **შეტყობინებები** — in-app notifications ყველა მნიშვნელოვან მოვლენაზე

## 🛠 Tech Stack

| ფენა | ტექნოლოგია |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (Node.js), Zod ვალიდაცია |
| Database | Prisma ORM + PostgreSQL |
| Auth | NextAuth.js — Credentials + Google, JWT სესიები |
| AI | Anthropic Claude API (არასავალდებულო) + built-in fallback |

## 🚀 გაშვება (ლოკალურად)

```bash
docker compose up -d   # PostgreSQL
npm install            # დამოკიდებულებები + prisma generate
npm run setup          # ბაზის სქემა + demo მონაცემები
npm run dev            # http://localhost:3000
```

### დემო ანგარიშები (პაროლი ყველგან: `ostati123`)

| როლი | Email |
|---|---|
| მომხმარებელი | `demo@ostati.ge` |
| ოსტატი | `master@ostati.ge` |
| ადმინი | `admin@ostati.ge` |

### ☁️ Railway-ზე დეპლოი

1. Railway პროექტში დაამატე ეს GitHub რეპო (branch: `main`) და PostgreSQL სერვისი
2. აპის სერვისზე → **Variables** დააყენე:
   - `DATABASE_URL` → Postgres სერვისის reference (`${{Postgres.DATABASE_URL}}`)
   - `NEXTAUTH_SECRET` → ძლიერი შემთხვევითი სტრიქონი (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` → შენი საჯარო დომენი, მაგ. `https://ostati.up.railway.app`
3. Deploy — `npm start` თავად შექმნის ბაზის სქემას (`prisma db push`) და ჩატვირთავს demo მონაცემებს

> Vercel-ზე დეპლოისას Build Command: `prisma generate && prisma db push && next build` და იგივე env ცვლადები.

### Environment ცვლადები

იხილე `.env.example`. Google login ჩაირთვება `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`-ის მითითებისას; AI დამხმარე Claude-ზე გადავა `ANTHROPIC_API_KEY`-ის მითითებისას. Production-ში აუცილებელია ძლიერი `NEXTAUTH_SECRET` (`openssl rand -base64 32`).

## 📁 არქიტექტურა

```
prisma/            # სქემა (User, MasterProfile, Booking, Offer, Review,
                   #         Favorite, Message, Notification) + seed
src/lib/           # prisma client, auth config, AI ანალიზატორი, კონსტანტები
src/components/    # UI კომპონენტები (Navbar, MasterCard, SearchBar, ...)
src/app/           # გვერდები (App Router)
src/app/api/       # REST API — register, bookings, offers, reviews,
                   #            messages, favorites, ai, admin
```

## 💳 გადახდები (Bank of Georgia)

Premium გამოწერის გადახდა ინტეგრირებულია **საქართველოს ბანკის e-commerce API**-სთან:

1. გახსენი BOG ბიზნეს ანგარიში და მიიღე მერჩანტ მონაცემები ([api.bog.ge](https://api.bog.ge))
2. დაამატე env ცვლადები: `BOG_CLIENT_ID`, `BOG_CLIENT_SECRET`
3. ამის შემდეგ „არჩევა" ღილაკი მომხმარებელს ბანკის დაცულ გადახდის გვერდზე გადაიყვანს (Visa/Mastercard/Apple Pay/Google Pay); გადახდის დადასტურება ხდება webhook-ით (`/api/payments/callback`), რომელიც სტატუსს უშუალოდ ბანკის API-დან გადაამოწმებს

მონაცემების გარეშე checkout **დემო რეჟიმში** მუშაობს — გადახდა სიმულირდება.

## 🗺 Roadmap (Phase 3+)

- შეკვეთის საკომისიოს ონლაინ გადახდა (იგივე BOG ინტეგრაციით)
- ტელეფონით ავტორიზაცია (SMS OTP)
- WebSocket ჩატი და Push notifications
- ფოტოების ატვირთვა object storage-ში (ამჟამად data-URL)
- პირადობის/სერტიფიკატების ატვირთვა ვერიფიკაციისთვის
- React Native მობილური აპლიკაცია (API უკვე მზადაა ამისთვის)
