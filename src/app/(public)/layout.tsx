"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <Header />
      {isHome ? (
        children
      ) : (
        <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:px-12 lg:py-16">
          {children}
        </div>
      )}
      <WhatsAppWidget />
    </>
  );
}

