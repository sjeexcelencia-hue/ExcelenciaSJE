import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";

export const metadata: Metadata = {
  title: "Lingerie & Cia - Catálogo de Produtos",
  description: "Encontre as melhores lingeries e roupas íntimas. Faça seu pedido direto pelo WhatsApp!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
  <html lang="pt-BR">
    <body className="bg-rose-50 text-slate-900 antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
