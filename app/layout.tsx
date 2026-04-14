import type { Metadata } from "next";
import "./globals.css";
import { CompanyProvider } from "./lib/companyStore";

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
      <body className="bg-gray-50 text-gray-900 antialiased">
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </body>
    </html>
  );
}
