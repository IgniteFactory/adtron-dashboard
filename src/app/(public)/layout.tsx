import Header from "@/components/Header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 lg:px-12 lg:py-16">
        {children}
      </main>
    </>
  );
}
