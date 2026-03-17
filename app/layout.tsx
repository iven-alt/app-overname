import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Value Creation App",
  description: "Define and track value creation actions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
