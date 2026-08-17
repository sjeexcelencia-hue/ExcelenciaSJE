"use client";

import { useCart } from "./CartContext";
import type { Product } from "@/db/schema";
import { Plus, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.product.id === product.id);
  const isOut = product.quantity <= 0;

  const handleAdd = () => {
    if (isOut) return;
    addItem(product);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-lg overflow-hidden ${isOut ? 'border-red-200 opacity-70' : 'border-transparent hover:border-rose-200'}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {product.category === "Conjuntos" ? "👙" : product.category === "Calcinhas" ? "🩲" : product.category === "Linha Modeladora" ? "💃" : product.category === "Masculino" ? "👔" : product.category === "Infantil" ? "🧸" : product.category === "Moda Praia" ? "🏖️" : product.category === "Linha Fitness" ? "🏋️" : product.category === "Linha Noite" ? "🌙" : "👗"}
          </div>
        )}
        {isOut && (
          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
            <div className="text-white font-bold text-lg flex items-center gap-2">
              <AlertTriangle size={20} />
              ESGOTADO
            </div>
          </div>
        )}
        {product.quantity > 0 && product.quantity <= 3 && !isOut && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Últimas {product.quantity}!
          </div>
        )}
        {inCart && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            ✅ {inCart.quantity} no carrinho
          </div>
        )}
        {product.category && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {product.category}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
        {product.description && (
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-xs text-gray-400">Preço unitário</p>
            <p className="text-2xl font-bold text-rose-600">
              R$ {product.price.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={isOut}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              isOut
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white hover:shadow-lg active:scale-95"
            }`}
          >
            <Plus size={16} />
            {isOut ? "Esgotado" : "Adicionar"}
          </button>
        </div>
        {product.quantity > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            📦 {product.quantity} disponível(is)
          </p>
        )}
      </div>
    </div>
  );
}
