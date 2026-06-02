import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | SHIPIN GO",
  description: "Gerbang masuk menuju dashboard admin SHIPIN GO."
};

export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
