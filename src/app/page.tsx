"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/components/CartContext";
import type { Product } from "@/db/schema";
import { Search, ShoppingCart, ArrowRight } from "lucide-react";

function CatalogContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { totalItems, totalPrice } = useCart();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch {
        console.error("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Handle deep link to cart
  useEffect(() => {
    if (searchParams?.get("cart") === "open") {
      setCartOpen(true);
    }
  }, [searchParams]);

  const categories = Array.from(new Set(products.map((p) => p.category).filter((c): c is string => !!c)));

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-rose-600 text-white p-2 rounded-xl text-lg">
              💕
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Lingerie & Cia</h1>
              <p className="text-xs text-gray-500">Lingerie & Roupas Íntimas</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-rose-600 hover:bg-rose-700 text-white p-3 rounded-xl transition-colors"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-2">✨ Lindas como Você</h2>
          <p className="text-pink-100 mb-4">
            Escolha seus produtos e envie seu pedido direto pelo WhatsApp!
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? "bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-rose-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-xl text-gray-500">Nenhum produto encontrado</p>
            <p className="text-gray-400 mt-2">Tente buscar com outros termos</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{filtered.length} produto(s) encontrado(s)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Floating Cart Button (Mobile) */}
      {totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between font-bold transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={20} />
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
            <span className="flex items-center gap-2">
              R$ {totalPrice.toFixed(2)}
              <ArrowRight size={18} />
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">💕</span>
            <span className="text-white font-bold">Lingerie & Cia</span>
          </div>
          <p className="text-sm">© 2025 Todos os direitos reservados</p>
          <p className="text-xs mt-2">Pedidos enviados via WhatsApp</p>
          <div className="mt-4">
            <a href="/admin" className="text-xs text-gray-600 hover:text-gray-400">
              🔐 Área Admin
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  );
}
