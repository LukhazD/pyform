"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Settings, Type, Mail, Hash, Phone, Globe, AlignLeft, List, CheckSquare, Calendar, Upload, MessageSquare, StickyNote, LogOut } from "lucide-react";
import { Reorder, useDragControls, useAnimate, motion } from "framer-motion";

interface Module {
    id: string;
    type: string;
    order?: number;
}

interface MobileModuleNavProps {
    modules: Module[];
    selectedModuleId: string | null;
    onSelectModule: (id: string) => void;
    onAddModule: () => void;
    onReorderModules?: (fromIndex: number, toIndex: number) => void;
    onModulesChange?: (modules: Module[]) => void;
    onOpenSettings?: () => void;
}

const getModuleIcon = (type: string) => {
    switch (type) {
        case "WELCOME": return <MessageSquare size={18} />;
        case "TEXT": return <Type size={18} />;
        case "EMAIL": return <Mail size={18} />;
        case "NUMBER": return <Hash size={18} />;
        case "PHONE": return <Phone size={18} />;
        case "URL": return <Globe size={18} />;
        case "TEXTAREA": return <AlignLeft size={18} />;
        case "MULTIPLE_CHOICE": return <List size={18} />;
        case "CHECKBOXES": return <CheckSquare size={18} />;
        case "DROPDOWN": return <List size={18} />;
        case "DATE": return <Calendar size={18} />;
        case "FILE_UPLOAD": return <Upload size={18} />;
        case "QUOTE": return <StickyNote size={18} />;
        case "GOODBYE": return <LogOut size={18} />;
        default: return <Type size={18} />;
    }
};

const DraggableItem = ({
    module,
    isSelected,
    onSelect,
    onDragStart,
    onDragEnd,
}: {
    module: Module;
    isSelected: boolean;
    onSelect: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}) => {
    const controls = useDragControls();
    const [isHolding, setIsHolding] = useState(false);
    const [isDragging, setIsDragging] = useState(false); // Local drag state to prevent triggering onDragEnd prematurely
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [scope, animate] = useAnimate();
    const startPoint = useRef<{ x: number; y: number } | null>(null);

    // NON-PASSIVE LISTENER: This is the nuclear option for iOS
    // We must preventDefault on touchmove ONLY when dragging to stop the browser from scrolling
    useEffect(() => {
        const element = scope.current;
        if (!element) return;

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                e.preventDefault();
            }
        };

        // Passive: false is required to be able to call preventDefault
        element.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            element.removeEventListener("touchmove", handleTouchMove);
        };
    }, [isDragging, scope]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button !== 0) return;

        startPoint.current = { x: e.clientX, y: e.clientY };
        setIsHolding(true);
        animate(scope.current, { scale: 0.9 }, { duration: 0.2 });
        animate(".progress-ring", { pathLength: 1, opacity: 1 }, { duration: 0.5, ease: "linear" });

        timeoutRef.current = setTimeout(() => {
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(50);

            animate(scope.current, { scale: 1.1, zIndex: 100 }, { type: "spring", stiffness: 400, damping: 10 });
            animate(".progress-ring", { opacity: 0 }, { duration: 0.2 });

            controls.start(e);
            setIsDragging(true);
            onDragStart(); // Lock the scroll container
            setIsHolding(false);
        }, 500);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (timeoutRef.current && isHolding && startPoint.current) {
            const moveX = Math.abs(e.clientX - startPoint.current.x);
            const moveY = Math.abs(e.clientY - startPoint.current.y);

            // If moved > 10px before activation, cancel everything
            if (moveX > 10 || moveY > 10) {
                cancelLongPress();
            }
        }
    }

    const cancelLongPress = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (isHolding) {
            setIsHolding(false);
            animate(scope.current, { scale: 1, zIndex: 0 }, { duration: 0.2 });
            animate(".progress-ring", { pathLength: 0, opacity: 0 }, { duration: 0.1 });
        }
    };

    return (
        <Reorder.Item
            value={module}
            dragListener={false}
            dragControls={controls}
            className="relative flex-shrink-0 touch-pan-x"
            style={{ touchAction: "pan-x" }}
            onDragEnd={() => {
                setIsDragging(false);
                onDragEnd(); // Unlock scroll container
            }}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
            onPointerMove={handlePointerMove}
        >
            <div ref={scope} className="relative">
                {/* SVG Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 40 40">
                    <motion.circle
                        className="progress-ring text-primary stroke-current"
                        cx="20" cy="20" r="18" strokeWidth="2" fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                    />
                </svg>

                <button
                    onPointerDown={handlePointerDown}
                    onClick={(e) => {
                        if (isDragging) return; // Prevent click if we were dragging
                        onSelect();
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        return false;
                    }}
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all relative z-10
                        outline-none ring-0
                        select-none
                        touch-pan-x
                        [-webkit-tap-highlight-color:transparent] 
                        [-webkit-touch-callout:none] 
                        [-webkit-user-select:none] 
                        [-moz-user-select:none] 
                        [-ms-user-select:none] 
                        user-select-none
                        ${isSelected
                            ? "bg-gray-900 text-white shadow-md scale-110"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }
                    `}
                >
                    <span className="pointer-events-none block">
                        {getModuleIcon(module.type)}
                    </span>
                </button>
            </div>
        </Reorder.Item>
    );
};

export default function MobileModuleNav({
    modules,
    selectedModuleId,
    onSelectModule,
    onAddModule,
    onReorderModules,
    onModulesChange,
    onOpenSettings,
}: MobileModuleNavProps) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-30">
            <div className="flex items-center justify-between px-2 py-2 gap-2 h-24">
                {/* Settings Button */}
                <button
                    onClick={onOpenSettings}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all"
                >
                    <Settings size={20} />
                </button>

                <div className="w-[1px] h-10 bg-gray-300 mx-1 flex-shrink-0" />

                <div className={`flex-1 flex items-center h-full gap-2 hide-scrollbar mask-gradient-right overscroll-x-contain ${isDragging ? 'overflow-x-hidden touch-none' : 'overflow-x-auto'}`}>
                    {onReorderModules ? (
                        <Reorder.Group
                            axis="x"
                            values={modules}
                            onReorder={onModulesChange || (() => { })}
                            className="flex items-center gap-2 px-1"
                        >
                            {modules.map((module) => (
                                <DraggableItem
                                    key={module.id}
                                    module={module}
                                    isSelected={selectedModuleId === module.id}
                                    onSelect={() => onSelectModule(module.id)}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={() => setIsDragging(false)}
                                />
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="flex items-center gap-2 px-1">
                            {modules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => onSelectModule(module.id)}
                                    className={`
                                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                                        ${selectedModuleId === module.id
                                            ? "bg-gray-900 text-white shadow-md scale-110"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }
                                    `}
                                >
                                    {getModuleIcon(module.type)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-[1px] h-10 bg-gray-300 mx-1 flex-shrink-0" />

                <button
                    onClick={onAddModule}
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
