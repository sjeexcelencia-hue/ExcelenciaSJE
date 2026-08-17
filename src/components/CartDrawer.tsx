"use client";

import { useCart, type CartItem } from "./CartContext";
import { X, Plus, Minus, Trash2, Send } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeName, setStoreName] = useState("");

  // Load backend configurations
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const config = await res.json();
          if (config.whatsapp) setWhatsappNumber(config.whatsapp);
          if (config.storeName) setStoreName(config.storeName);
        }
      } catch (err) {
        console.error("Erro ao carregar telefone do vendedor", err);
      }
    }
    loadConfig();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendToWhatsApp = () => {
    if (!whatsappNumber) {
      alert("O vendedor ainda não configurou o número do WhatsApp!");
      return;
    }

    if (!clientName.trim()) {
      alert("Por favor, informe seu nome para podermos te identificar!");
      return;
    }

    let phone = whatsappNumber.replace(/\D/g, "");
    if (!phone.startsWith("55") && phone.length === 11) {
      phone = "55" + phone;
    }

    let message = `🛒 *NOVO PEDIDO - ${storeName || "Loja"}*\n\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    if (clientAddress.trim()) message += `📍 *Endereço:* ${clientAddress}\n`;
    message += `\n📦 *Peças Escolhidas:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}️⃣ *${item.product.name}*\n`;
      message += `   Qtd: ${item.quantity}x | R$ ${item.product.price.toFixed(2)} un.\n`;
      message += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`;
      if (item.product.category) {
        message += `   🏷️ Categoria: ${item.product.category}\n`;
      }
      message += `\n`;
    });

    message += `💰 *VALOR TOTAL: R$ ${totalPrice.toFixed(2)}*\n\n`;
    message += `📱 *Por favor, confirme a disponibilidade das peças e me envie a chave Pix para pagamento!*`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-rose-600 text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            🛒 Sacola de Compras ({totalItems})
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-6xl mb-4">👙</p>
              <p className="text-lg font-semibold">Sua sacola está vazia</p>
              <p className="text-sm mt-1 text-gray-400">Escolha peças lindas no nosso catálogo!</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} onRemove={removeItem} onUpdate={updateQuantity} />
              ))}

              {/* Client Info */}
              <div className="mt-6 space-y-3 border-t pt-4">
                <h3 className="font-semibold text-gray-700">📋 Seus Dados</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Endereço de Entrega (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-rose-50/50 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total do Pedido:</span>
              <span className="text-rose-600">R$ {totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSendToWhatsApp}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-95"
            >
              <Send size={20} />
              Confirmar e Enviar no WhatsApp
            </button>
            <button
              onClick={() => { clearCart(); onClose(); }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Limpar Sacola
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartItem({
  item,
  onRemove,
  onUpdate,
}: {
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdate: (id: number, qty: number) => void;
}) {
  return (
    <div className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-rose-100">
      <div className="w-16 h-16 rounded-lg bg-rose-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {item.product.image ? (
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">
            {item.product.category === "Conjuntos" ? "👙" : item.product.category === "Calcinhas" ? "🩲" : "✨"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 text-sm truncate">{item.product.name}</h4>
        <p className="text-rose-600 font-bold text-sm">R$ {item.product.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onUpdate(item.product.id, item.quantity - 1)}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
          <button
            onClick={() => onUpdate(item.product.id, item.quantity + 1)}
            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors disabled:opacity-30"
            disabled={item.quantity >= item.product.quantity}
          >
            <Plus size={14} />
          </button>
          <span className="text-xs text-gray-400 ml-1">({item.product.quantity} disp.)</span>
          <button
            onClick={() => onRemove(item.product.id)}
            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
