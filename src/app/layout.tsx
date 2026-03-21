import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Book with ThePupPad",
  description: "Kennel-free dog boarding & pet care — book your pup's stay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
