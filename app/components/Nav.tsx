"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CompanySwitcher from "./CompanySwitcher";

const links = [
  { href: "/",              label: "Value Creation Actions" },
  { href: "/first-100-days", label: "First 100 Days"        },
  { href: "/dashboard",      label: "Dashboard"              },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-3">
      {/* Company switcher — always visible in every page header */}
      <CompanySwitcher />

      {/* Page navigation */}
      <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors
              ${pathname === href
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
