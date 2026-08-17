import { db } from "@/db";
import { products } from "@/db/schema";
import AdminForm from "@/components/AdminForm";

export default async function AdminPage() {
  const allProducts = await db.select().from(products);
  const adminPassword = process.env.ADMIN_PASSWORD;

  return <AdminForm initialProducts={allProducts} adminPassword={adminPassword} />;
}
