import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, type NewProduct } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(products);
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  try {
    const body: NewProduct = await req.json();
    const [newProduct] = await db.insert(products).values(body).returning();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
