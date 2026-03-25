"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

interface ApiKeyEntry {
    _id: string;
    name: string;
    keyPrefix: string;
    lastUsedAt?: string;
    createdAt: string;
}

export default function ApiKeysCard() {
    const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fetchKeys = useCallback(async () => {
        try {
            const res = await fetch("/api/user/api-keys");
            if (!res.ok) throw new Error("Error al cargar API keys");
            const data = await res.json();
            setKeys(data.keys);
        } catch {
            toast.error("No se pudieron cargar las API keys");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKeys();
    }, [fetchKeys]);

    const handleCreate = async () => {
        if (!newKeyName.trim()) {
            toast.error("Ingresa un nombre para la API key");
            return;
        }
        setIsCreating(true);
        try {
            const res = await fetch("/api/user/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newKeyName.trim() }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al crear API key");
            }
            const data = await res.json();
            setRevealedKey(data.key);
            setNewKeyName("");
            setShowCreateForm(false);
            await fetchKeys();
            toast.success("API Key creada. Cópiala ahora — no se mostrará de nuevo.");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Error al crear API key";
            toast.error(message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevoke = async (keyId: string, keyName: string) => {
        if (!confirm(`¿Revocar la API key "${keyName}"? Esta acción no se puede deshacer.`)) return;
        try {
            const res = await fetch("/api/user/api-keys", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyId }),
            });
            if (!res.ok) throw new Error("Error al revocar");
            setKeys((prev) => prev.filter((k) => k._id !== keyId));
            toast.success("API Key revocada");
        } catch {
            toast.error("No se pudo revocar la API key");
        }
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex gap-4 items-center">
                    <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl">
                        <Key className="text-violet-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                        <p className="text-gray-500 text-sm">
                            Conecta herramientas externas como Claude Cowork
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors duration-200"
                >
                    <Plus size={16} />
                    Nueva Key
                </button>
            </div>

            {/* Revealed key banner (shown once after creation) */}
            {revealedKey && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                        Guarda esta key — no se mostrará de nuevo
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm bg-white px-3 py-2 rounded-lg border border-amber-200 font-mono break-all text-gray-800">
                            {revealedKey}
                        </code>
                        <button
                            onClick={() => copyToClipboard(revealedKey, "revealed")}
                            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                            {copiedId === "revealed" ? (
                                <Check size={18} className="text-green-600" />
                            ) : (
                                <Copy size={18} className="text-amber-700" />
                            )}
                        </button>
                        <button
                            onClick={() => setRevealedKey(null)}
                            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                            <EyeOff size={18} className="text-amber-700" />
                        </button>
                    </div>
                </div>
            )}

            {/* Create form */}
            {showCreateForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la API Key
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="ej. Claude Plugin, CI/CD..."
                            maxLength={64}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            {isCreating ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                "Crear"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Keys list */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-gray-400" />
                </div>
            ) : keys.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                    No tienes API keys activas
                </div>
            ) : (
                <div className="space-y-2">
                    {keys.map((k) => (
                        <div
                            key={k._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1.5 bg-white rounded-lg border border-gray-200">
                                    <Key size={14} className="text-gray-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {k.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <code className="font-mono">{k.keyPrefix}...</code>
                                        <span>·</span>
                                        <span>{formatDate(k.createdAt)}</span>
                                        {k.lastUsedAt && (
                                            <>
                                                <span>·</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDate(k.lastUsedAt)}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRevoke(k._id, k.name)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Revocar API Key"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
