import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Briefly | AI Article Summarizer",
  description: "Grounded, hallucination-free summaries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-25 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}