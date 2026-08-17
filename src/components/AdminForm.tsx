"use client";

import type { Product, NewProduct } from "@/db/schema";
import { Plus, Edit2, Trash2, X, Save, RefreshCw, Settings } from "lucide-react";
import { useState, useEffect } from "react";

interface AdminFormProps {
  initialProducts: Product[];
  adminPassword?: string;
}

export default function AdminForm({ initialProducts: serverProducts, adminPassword: serverAdminPassword }: AdminFormProps) {
  const [products, setProducts] = useState<Product[]>(serverProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  // Store settings
  const [whatsapp, setWhatsapp] = useState("");
  const [storeName, setStoreName] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      async function loadSettings() {
        try {
          const res = await fetch("/api/settings");
          if (res.ok) {
            const config = await res.json();
            if (config.whatsapp) setWhatsapp(config.whatsapp);
            if (config.storeName) setStoreName(config.storeName);
          }
        } catch (err) {
          console.error("Erro ao carregar configurações", err);
        }
      }
      loadSettings();
    }
  }, [isAuthenticated]);

  const emptyProduct: NewProduct = {
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    image: "",
    category: "",
  };

  const [form, setForm] = useState<NewProduct>(emptyProduct);

  const handleLogin = () => {
    const savedPassword = localStorage.getItem("admin_password");
    const pwd = serverAdminPassword || savedPassword || "admin123";
    if (passwordInput === pwd) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleSavePassword = () => {
    localStorage.setItem("admin_password", passwordInput);
  };

  const handleSubmit = async () => {
    if (!form.name || form.price < 0) return;

    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : "/api/products";
    const method = editingProduct ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      const data = await res.json();

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        setEditingProduct(null);
      } else {
        setProducts((prev) => [...prev, data]);
      }
      setForm(emptyProduct);
      setIsAdding(false);
    } catch (err) {
      alert("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Erro ao excluir produto");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, storeName }),
      });
      if (res.ok) {
        alert("Configurações salvas com sucesso!");
      } else {
        throw new Error();
      }
    } catch {
      alert("Erro ao salvar configurações!");
    } finally {
      setSavingSettings(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 to-rose-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
            <p className="text-gray-500 mt-1">Digite a senha para acessar</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Senha"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={() => { handleLogin(); handleSavePassword(); }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Entrar
            </button>
            <p className="text-xs text-gray-400 text-center">
              Senha padrão: admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/30">
      {/* Header */}
      <div className="bg-rose-950 text-white p-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">⚙️ Painel de Controle Lingerie</h1>
            <p className="text-xs text-rose-200">Gerencie seus produtos, estoque e whatsapp</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm bg-rose-900 hover:bg-rose-850 px-4 py-2 rounded-xl border border-rose-800"
            >
              Ver Catálogo
            </a>
            <button
              onClick={() => {
                localStorage.removeItem("admin_password");
                setIsAuthenticated(false);
              }}
              className="text-sm bg-rose-900 hover:bg-rose-800 px-3 py-2 rounded-xl border border-rose-800"
            >
              Sair
            </button>
            <button
              onClick={() => { setIsAdding(true); setForm(emptyProduct); setEditingProduct(null); }}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Novo Produto
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Settings Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Settings size={20} className="text-rose-600" />
            Configurações de Contato e Loja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp (Receber Pedidos) *</label>
              <input
                type="text"
                placeholder="Ex: 5511999999999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Coloque o código do país + DDD + número (apenas números). Ex: 5511999999999</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja *</label>
              <input
                type="text"
                placeholder="Nome da sua loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Ex: Lingerie & Cia</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all"
            >
              {savingSettings ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Salvar Configurações da Loja
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-100">
            <p className="text-sm text-gray-500 font-medium">Total de Peças</p>
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-100">
            <p className="text-sm text-gray-500 font-medium">Em Estoque</p>
            <p className="text-2xl font-bold text-rose-600">
              {products.filter((p) => p.quantity > 0).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-rose-100">
            <p className="text-sm text-gray-500 font-medium">Esgotadas</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter((p) => p.quantity <= 0).length}
            </p>
          </div>
        </div>

        {/* Modal Add/Edit */}
        {(isAdding || editingProduct) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button onClick={() => { setIsAdding(false); setEditingProduct(null); setForm(emptyProduct); }} className="p-1 hover:bg-gray-100 rounded">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Peça *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="Ex: Conjunto Sutiã + Calcinha Renda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    rows={2}
                    placeholder="Descrição do produto..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price || ""}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Disponível *</label>
                    <input
                      type="number"
                      min="0"
                      value={form.quantity ?? ""}
                      onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sem categoria</option>
                    <option value="Conjuntos">Conjuntos</option>
                    <option value="Calcinhas">Calcinhas</option>
                    <option value="Linha Modeladora">Linha Modeladora</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Moda Praia">Moda Praia</option>
                    <option value="Linha Fitness">Linha Fitness</option>
                    <option value="Linha Noite">Linha Noite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem (Opcional)</label>
                  <input
                    type="text"
                    value={form.image || ""}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="https://linkdafoto.com/imagem.jpg"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name || form.price <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                >
                  <Save size={18} />
                  {editingProduct ? "Salvar Alterações" : "Criar Produto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 border border-rose-100">
              <div className="w-16 h-16 rounded-lg bg-rose-50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">
                    {product.category === "Conjuntos" ? "👙" : product.category === "Calcinhas" ? "🩲" : "✨"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-gray-800">{product.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="text-rose-600 font-bold">R$ {product.price.toFixed(2)}</span>
                  <span className={product.quantity > 0 ? "text-rose-600 font-medium" : "text-red-500 font-medium"}>
                    Disponível: {product.quantity} un.
                  </span>
                  {product.category && <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs font-semibold">{product.category}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingProduct(product); setForm(product); setIsAdding(false); }}
                  className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-6xl mb-4">📦</p>
              <p>Nenhum produto cadastrado</p>
              <button
                onClick={() => { setIsAdding(true); setForm(emptyProduct); }}
                className="mt-4 text-rose-600 hover:underline"
              >
                + Adicionar primeiro produto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
