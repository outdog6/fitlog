import { Sidebar } from "@/components/sidebar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {children}
      </main>
    </div>
  );
}
