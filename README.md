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
| Database | Prisma ORM — SQLite (dev) / PostgreSQL (production) |
| Auth | NextAuth.js — Credentials + Google, JWT სესიები |
| AI | Anthropic Claude API (არასავალდებულო) + built-in fallback |

## 🚀 გაშვება

```bash
npm install        # დამოკიდებულებები + prisma generate
npm run setup      # ბაზის შექმნა (SQLite) + demo მონაცემები
npm run dev        # http://localhost:3000
```

### დემო ანგარიშები (პაროლი ყველგან: `ostati123`)

| როლი | Email |
|---|---|
| მომხმარებელი | `demo@ostati.ge` |
| ოსტატი | `master@ostati.ge` |
| ადმინი | `admin@ostati.ge` |

### PostgreSQL-ზე გადასვლა (production)

1. `docker compose up -d` (ან ნებისმიერი Postgres)
2. `prisma/schema.prisma`-ში: `provider = "postgresql"`
3. `.env.local`-ში: `DATABASE_URL="postgresql://ostati:ostati@localhost:5432/ostati"`
4. `npm run setup`

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

## 🗺 Roadmap (Phase 2+)

- ონლაინ გადახდები (საკომისიოს ავტომატური ჩამოჭრა) და Premium გამოწერა
- ტელეფონით ავტორიზაცია (SMS OTP)
- WebSocket ჩატი და Push notifications
- ფოტოების ატვირთვა object storage-ში (ამჟამად data-URL)
- პირადობის/სერტიფიკატების ატვირთვა ვერიფიკაციისთვის
- React Native მობილური აპლიკაცია (API უკვე მზადაა ამისთვის)
