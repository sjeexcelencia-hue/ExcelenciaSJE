import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const records = await db.select().from(settings);
    const config: Record<string, string> = {};
    records.forEach((r) => {
      config[r.key] = r.value;
    });

    // Default fallback if not configured yet
    if (!config.whatsapp) {
      config.whatsapp = "5511999999999";
    }
    if (!config.storeName) {
      config.storeName = "Lingerie & Cia";
    }

    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { whatsapp, storeName } = body;

    if (whatsapp !== undefined) {
      await db
        .insert(settings)
        .values({ key: "whatsapp", value: whatsapp })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: whatsapp },
        });
    }

    if (storeName !== undefined) {
      await db
        .insert(settings)
        .values({ key: "storeName", value: storeName })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: storeName },
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
