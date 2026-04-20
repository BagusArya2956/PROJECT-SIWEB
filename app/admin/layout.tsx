import { AdminTopNavbar } from "@/components/admin/admin-top-navbar";

export default function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminTopNavbar />
      {children}
    </>
  );
}
