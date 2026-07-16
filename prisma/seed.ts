import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD = "ostati123";

const MASTERS = [
  { name: "გიორგი მაისურაძე", email: "master@ostati.ge", category: "electrician", city: "თბილისი", exp: 12, from: 40, to: 200, verified: true, premium: true, bio: "12 წლიანი გამოცდილება საყოფაცხოვრებო და კომერციულ ელექტროობაში. ვმუშაობ სწრაფად, სუფთად და გარანტიით." },
  { name: "დავით ბერიძე", email: "davit@ostati.ge", category: "plumber", city: "თბილისი", exp: 9, from: 50, to: 250, verified: true, premium: false, bio: "სანტექნიკის სრული სპექტრი — მილების გაყვანიდან გაჟონვის აღმოფხვრამდე. გამოძახება დღესვე." },
  { name: "ლევან კვარაცხელია", email: "levan@ostati.ge", category: "renovation", city: "თბილისი", exp: 15, from: 300, to: 8000, verified: true, premium: true, bio: "ბინის რემონტი „გასაღებამდე“ — დემონტაჟიდან ფინალურ დეტალებამდე. საკუთარი გუნდი." },
  { name: "ნიკოლოზ ჩხეიძე", email: "nikoloz@ostati.ge", category: "hvac", city: "ბათუმი", exp: 7, from: 60, to: 400, verified: true, premium: false, bio: "კონდიციონერების მონტაჟი, სერვისი და გათბობის სისტემები. ვმუშაობ ბათუმსა და მიმდებარედ." },
  { name: "თამარ გელაშვილი", email: "tamar@ostati.ge", category: "designer", city: "თბილისი", exp: 8, from: 200, to: 3000, verified: true, premium: false, bio: "ინტერიერის დიზაინერი — 3D ვიზუალიზაცია, პროექტი და ავტორული ზედამხედველობა." },
  { name: "ზურაბ წიკლაური", email: "zurab@ostati.ge", category: "furniture", city: "ქუთაისი", exp: 20, from: 100, to: 2500, verified: false, premium: false, bio: "ავეჯის დამზადება ინდივიდუალური შეკვეთით — სამზარეულო, კარადები, საწოლები." },
  { name: "ირაკლი ლომიძე", email: "irakli@ostati.ge", category: "appliances", city: "თბილისი", exp: 10, from: 40, to: 220, verified: true, premium: false, bio: "სარეცხი მანქანების, მაცივრებისა და ღუმელების შეკეთება ადგილზე. ორიგინალი ნაწილები." },
  { name: "მარიამ ხუციშვილი", email: "mariam@ostati.ge", category: "cleaning", city: "თბილისი", exp: 5, from: 60, to: 300, verified: false, premium: false, bio: "პროფესიონალური დასუფთავება — ბინა, ოფისი, რემონტის შემდგომი დალაგება." },
  { name: "ბექა ჯაფარიძე", email: "beka@ostati.ge", category: "doors-windows", city: "რუსთავი", exp: 11, from: 50, to: 500, verified: false, premium: false, bio: "მეტალოპლასტმასის კარ-ფანჯრის მონტაჟი და რეგულირება, საკეტების შეცვლა." },
  { name: "გია ცერცვაძე", email: "gia@ostati.ge", category: "construction", city: "ბათუმი", exp: 18, from: 1000, to: 50000, verified: true, premium: true, bio: "მშენებლობა ნულიდან — კერძო სახლები, აგარაკები. სრული დოკუმენტაცია და ვადების დაცვა." },
];

const PORTFOLIO: Record<string, { title: string; description: string; hue: number }[]> = {
  electrician: [
    { title: "ბინის სრული ელგაყვანილობა", description: "120მ² ბინა, ახალი კარადა და 40+ წერტილი", hue: 45 },
    { title: "კომერციული ფართის განათება", description: "კაფეს დეკორატიული და ტექნიკური განათება", hue: 210 },
  ],
  plumber: [
    { title: "სველი წერტილის მონტაჟი", description: "სრული სანტექნიკა ახალ აშენებულ ბინაში", hue: 200 },
    { title: "გათბობის მილების შეცვლა", description: "ძველი მილების ჩანაცვლება პოლიპროპილენით", hue: 160 },
  ],
  renovation: [
    { title: "ბინის რემონტი ვაკეში", description: "85მ² — სრული რემონტი 2 თვეში", hue: 30 },
    { title: "სამზარეულოს განახლება", description: "დემონტაჟი, ფილები, ელექტროობა, მალიარკა", hue: 270 },
  ],
  hvac: [{ title: "მულტი-სპლიტ სისტემა", description: "4 შიდა ბლოკი საცხოვრებელ სახლში", hue: 190 }],
  designer: [
    { title: "თანამედროვე ინტერიერი", description: "3-ოთახიანი ბინის დიზაინ-პროექტი", hue: 320 },
    { title: "ოფისის დიზაინი", description: "IT კომპანიის სამუშაო სივრცე", hue: 250 },
  ],
  furniture: [{ title: "სამზარეულოს გარნიტური", description: "MDF ფასადები, რბილი დახურვის ფურნიტურა", hue: 25 }],
  appliances: [{ title: "ინდუქციური ზედაპირის შეკეთება", description: "მართვის მოდულის ჩანაცვლება", hue: 0 }],
  cleaning: [{ title: "რემონტის შემდგომი დასუფთავება", description: "150მ² სახლი — 1 დღეში", hue: 140 }],
  "doors-windows": [{ title: "ფანჯრების შეცვლა", description: "6 მეტალოპლასტმასის ფანჯარა ბინაში", hue: 100 }],
  construction: [{ title: "კერძო სახლი წყალწმინდაზე", description: "220მ² მონოლითური კარკასი", hue: 35 }],
};

const REVIEWS = [
  { rating: 5, comment: "ზუსტად დროზე მოვიდა, სამუშაო შესანიშნავად შეასრულა. ნამდვილად ვურჩევ!" },
  { rating: 5, comment: "პროფესიონალი თავის საქმეში. ფასიც სამართლიანი იყო." },
  { rating: 4, comment: "კარგი ხელოსანია, ცოტა დაგვიანდა მაგრამ შედეგი მშვენიერია." },
  { rating: 5, comment: "მეორედ ვიყენებ ამ ოსტატს — ყოველთვის ხარისხიანად აკეთებს." },
  { rating: 4, comment: "სუფთად და აკურატულად იმუშავა. მადლობა!" },
];

async function main() {
  const passwordHash = await hash(PASSWORD, 10);

  // Admin + demo customer
  await prisma.user.upsert({
    where: { email: "admin@ostati.ge" },
    update: {},
    create: { name: "ადმინისტრატორი", email: "admin@ostati.ge", phone: "+995 599 00 00 01", passwordHash, role: "ADMIN" },
  });
  const demo = await prisma.user.upsert({
    where: { email: "demo@ostati.ge" },
    update: {},
    create: { name: "ნინო კაპანაძე", email: "demo@ostati.ge", phone: "+995 599 00 00 02", passwordHash, role: "CUSTOMER" },
  });
  const customer2 = await prisma.user.upsert({
    where: { email: "sandro@ostati.ge" },
    update: {},
    create: { name: "სანდრო აბაშიძე", email: "sandro@ostati.ge", phone: "+995 599 00 00 03", passwordHash, role: "CUSTOMER" },
  });

  for (const [i, m] of MASTERS.entries()) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        name: m.name,
        email: m.email,
        phone: `+995 555 10 20 ${String(30 + i)}`,
        passwordHash,
        role: "MASTER",
      },
    });

    const existing = await prisma.masterProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    const profile = await prisma.masterProfile.create({
      data: {
        userId: user.id,
        category: m.category,
        city: m.city,
        experienceYears: m.exp,
        priceFrom: m.from,
        priceTo: m.to,
        verified: m.verified,
        premium: m.premium,
        bio: m.bio,
        portfolio: {
          create: (PORTFOLIO[m.category] ?? []).map((p) => ({
            title: p.title,
            description: p.description,
            imageHue: p.hue,
          })),
        },
      },
    });

    // Completed bookings + reviews so ratings/history look real
    const reviewCount = 2 + ((i * 7) % 3);
    for (let r = 0; r < reviewCount; r++) {
      const customer = r % 2 === 0 ? demo : customer2;
      const review = REVIEWS[(i + r) % REVIEWS.length];
      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          masterId: profile.id,
          category: m.category,
          description: "დასრულებული სამუშაო (დემო მონაცემი)",
          address: "დემო მისამართი 12",
          city: m.city,
          preferredDate: "2026-06-01T10:00",
          status: "COMPLETED",
          price: m.from + ((i + r) * 17) % Math.max(m.to - m.from, 1),
        },
      });
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: customer.id,
          masterId: profile.id,
          rating: review.rating,
          comment: review.comment,
        },
      });
    }

    const agg = await prisma.review.aggregate({
      where: { masterId: profile.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.masterProfile.update({
      where: { id: profile.id },
      data: { ratingAvg: agg._avg.rating ?? 0, reviewCount: agg._count },
    });
  }

  console.log("✔ Seed complete — demo accounts: demo@ostati.ge / master@ostati.ge / admin@ostati.ge (password: ostati123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
