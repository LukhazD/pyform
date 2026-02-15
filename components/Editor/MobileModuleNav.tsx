"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Settings, Pencil, Plus, GripVertical, Check } from "lucide-react";
import { Reorder, useDragControls, motion, AnimatePresence } from "framer-motion";

interface Module {
    id: string;
    type: string;
    order?: number;
    title?: string;
}

const moduleTypeLabels: Record<string, string> = {
    WELCOME: "Bienvenida",
    QUOTE: "Cita",
    GOODBYE: "Despedida",
    TEXT: "Texto",
    EMAIL: "Email",
    NUMBER: "Número",
    PHONE: "Teléfono",
    URL: "URL",
    TEXTAREA: "Texto Largo",
    MULTIPLE_CHOICE: "Opción Múltiple",
    CHECKBOXES: "Casillas",
    DROPDOWN: "Desplegable",
    DATE: "Fecha",
    FILE_UPLOAD: "Archivo",
};

interface MobileModuleNavProps {
    modules: Module[];
    selectedModuleId: string | null;
    showingAddCard?: boolean;
    onSelectModule: (id: string) => void;
    onAddModule: () => void;
    onOpenSettings?: () => void;
    onEditModule?: () => void;
    onReorderModules?: (fromIndex: number, toIndex: number) => void;
    onModulesReorder?: (reorderedModules: Module[]) => void;
}

/* ── Reorder Item ── */
function ReorderItem({
    module,
    index,
}: {
    module: Module;
    index: number;
}) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={module}
            dragListener={false}
            dragControls={dragControls}
            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 select-none"
            whileDrag={{
                scale: 1.03,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 50,
            }}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            {/* Drag handle */}
            <button
                className="touch-none flex-shrink-0 text-gray-400 active:text-gray-600 cursor-grab active:cursor-grabbing p-1 -ml-1"
                onPointerDown={(e) => {
                    dragControls.start(e);
                    // Haptic feedback
                    if (navigator.vibrate) navigator.vibrate(30);
                }}
            >
                <GripVertical size={18} />
            </button>

            {/* Module number */}
            <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
            </span>

            {/* Module label */}
            <span className="text-sm font-medium text-gray-700 truncate flex-1">
                {module.title || moduleTypeLabels[module.type] || module.type}
            </span>
        </Reorder.Item>
    );
}

/* ── Main Component ── */
export default function MobileModuleNav({
    modules,
    selectedModuleId,
    showingAddCard,
    onSelectModule,
    onAddModule,
    onOpenSettings,
    onEditModule,
    onReorderModules,
    onModulesReorder,
}: MobileModuleNavProps) {
    const currentIndex = modules.findIndex((m) => m.id === selectedModuleId);
    const [reorderMode, setReorderMode] = useState(false);
    const [reorderItems, setReorderItems] = useState<Module[]>([]);
    const [showHint, setShowHint] = useState(false);
    const hintShown = useRef(false);

    // Show hint once per session after a short delay
    useEffect(() => {
        if (modules.length >= 2 && !hintShown.current && !reorderMode) {
            hintShown.current = true;
            const show = setTimeout(() => setShowHint(true), 1200);
            const hide = setTimeout(() => setShowHint(false), 7000);
            return () => { clearTimeout(show); clearTimeout(hide); };
        }
    }, [modules.length, reorderMode]);

    // Long-press detection
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggered = useRef(false);

    const handlePointerDown = useCallback(() => {
        longPressTriggered.current = false;
        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true;
            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate(50);
            // Enter reorder mode & dismiss hint
            setShowHint(false);
            setReorderItems([...modules]);
            setReorderMode(true);
        }, 500);
    }, [modules]);

    const handlePointerUp = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const handlePointerLeave = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Apply reorder and exit
    const handleDone = useCallback(() => {
        // Compute reorder operations: compare original vs new order
        if (onReorderModules) {
            // Apply moves sequentially from original → target
            const originalIds = modules.map(m => m.id);
            const newIds = reorderItems.map(m => m.id);

            // Find what changed and apply the minimum reorder operations
            // We'll use a simple approach: find each module in its new position
            const tempModules = [...modules];
            for (let targetIdx = 0; targetIdx < newIds.length; targetIdx++) {
                const currentIdx = tempModules.findIndex(m => m.id === newIds[targetIdx]);
                if (currentIdx !== targetIdx) {
                    onReorderModules(currentIdx, targetIdx);
                    // Simulate the same move in our temp array
                    const [moved] = tempModules.splice(currentIdx, 1);
                    tempModules.splice(targetIdx, 0, moved);
                }
            }
        }

        setReorderMode(false);
    }, [reorderItems, modules, onReorderModules]);

    /* ── Reorder Mode ── */
    if (reorderMode) {
        return (
            <>
                {/* Backdrop */}
                <motion.div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDone}
                />

                {/* Reorder Panel */}
                <motion.div
                    className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md rounded-t-2xl shadow-2xl border-t border-gray-200"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                    style={{ maxHeight: "60dvh" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Reordenar módulos</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Arrastra para cambiar el orden</p>
                        </div>
                        <button
                            onClick={handleDone}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium active:scale-95 transition-transform"
                        >
                            <Check size={16} />
                            Listo
                        </button>
                    </div>

                    {/* Reorderable list */}
                    <div className="overflow-y-auto px-3 py-3" style={{ maxHeight: "calc(60dvh - 72px)" }}>
                        <Reorder.Group
                            axis="y"
                            values={reorderItems}
                            onReorder={setReorderItems}
                            className="space-y-2"
                            layoutScroll
                        >
                            {reorderItems.map((module, index) => (
                                <ReorderItem
                                    key={module.id}
                                    module={module}
                                    index={index}
                                />
                            ))}
                        </Reorder.Group>
                    </div>
                </motion.div>
            </>
        );
    }

    /* ── Normal Mode (Dot Navigation) ── */
    return (
        <div className="relative bg-white/90 backdrop-blur-md border-t border-gray-100 flex-shrink-0 z-30">
            {/* Reorder hint — floats above the bar with emphasis */}
            <AnimatePresence>
                {showHint && (
                    <motion.div
                        className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-50"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <motion.span
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200"
                            animate={{
                                boxShadow: [
                                    "0 0 0 0 rgba(17, 24, 39, 0)",
                                    "0 0 0 6px rgba(17, 24, 39, 0.08)",
                                    "0 0 0 0 rgba(17, 24, 39, 0)",
                                ],
                            }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <GripVertical size={14} className="text-gray-400" />
                            Mantén presionado para reordenar
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
                {/* Settings Button */}
                <button
                    onClick={onOpenSettings}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Configuración"
                >
                    <Settings size={20} />
                </button>

                {/* Center: Position dots — long-press anywhere in this zone to reorder */}
                <motion.div
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 overflow-hidden cursor-default select-none relative rounded-xl"
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerLeave}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", touchAction: "none" }}
                    animate={showHint ? {
                        borderColor: [
                            "rgba(156, 163, 175, 0)",
                            "rgba(156, 163, 175, 0.6)",
                            "rgba(156, 163, 175, 0)",
                        ],
                        boxShadow: [
                            "inset 0 0 0 0 rgba(156, 163, 175, 0)",
                            "inset 0 0 8px 0 rgba(156, 163, 175, 0.1)",
                            "inset 0 0 0 0 rgba(156, 163, 175, 0)",
                        ],
                    } : {
                        borderColor: "rgba(156, 163, 175, 0)",
                        boxShadow: "inset 0 0 0 0 rgba(156, 163, 175, 0)",
                    }}
                    transition={showHint ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                    initial={{ borderWidth: 2, borderStyle: "solid", borderColor: "rgba(156, 163, 175, 0)" }}
                >
                    {modules.map((module, i) => (
                        <button
                            key={module.id || `dot-${i}`}
                            onClick={() => {
                                if (!longPressTriggered.current) {
                                    onSelectModule(module.id);
                                }
                            }}
                            className={`rounded-full transition-all duration-200 flex-shrink-0 ${!showingAddCard && i === currentIndex
                                ? "w-6 h-2.5 bg-gray-900"
                                : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                                }`}
                            aria-label={`Módulo ${i + 1}`}
                        />
                    ))}
                    {/* Add dot — shows active when on ghost card */}
                    <button
                        onClick={onAddModule}
                        className={`rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center ${showingAddCard
                            ? "w-6 h-6 bg-gray-900 text-white"
                            : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300"
                            }`}
                        aria-label="Añadir módulo"
                    >
                        {showingAddCard && <Plus size={14} />}
                    </button>
                </motion.div>

                {/* Edit Button */}
                <button
                    onClick={onEditModule}
                    disabled={showingAddCard || currentIndex === -1}
                    className={`flex items-center gap-1.5 px-4 h-10 rounded-full transition-all ${showingAddCard || currentIndex === -1
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-gray-900 text-white active:scale-95 shadow-sm"
                        }`}
                    aria-label="Editar módulo"
                >
                    <Pencil size={16} />
                    <span className="text-sm font-medium">Editar</span>
                </button>
            </div>
        </div>
    );
}
