import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await req.json();

    const existing = await db.select().from(products).where(eq(products.id, productId));
    if (existing.length === 0) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const [updated] = await db
      .update(products)
      .set({
        name: body.name ?? existing[0].name,
        description: body.description !== undefined ? body.description : existing[0].description,
        price: body.price !== undefined ? body.price : existing[0].price,
        quantity: body.quantity !== undefined ? body.quantity : existing[0].quantity,
        image: body.image !== undefined ? body.image : existing[0].image,
        category: body.category !== undefined ? body.category : existing[0].category,
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    await db.delete(products).where(eq(products.id, productId));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}
