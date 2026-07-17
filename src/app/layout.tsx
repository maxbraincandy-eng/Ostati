import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Ostati — იპოვე სანდო ოსტატი რამდენიმე წუთში",
    template: "%s | Ostati",
  },
  description:
    "პრემიუმ ხელოსნების Marketplace საქართველოსთვის. პროფესიონალი ხელოსნები, შემოწმებული პროფილებით და რეალური შეფასებებით.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  appleWebApp: { capable: true, title: "Ostati", statusBarStyle: "black-translucent" },
};

export const viewport = {
  themeColor: "#0B0D10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
