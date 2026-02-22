"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Settings,
    Menu,
    X,
    LifeBuoy,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import ButtonAccount from "@/components/ButtonAccount";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { label: "Formularios", href: "/dashboard/forms", icon: <FileText size={20} /> },
    { label: "Analíticas", href: "/dashboard/analytics", icon: <BarChart3 size={20} /> },
    { label: "Soporte", href: "/dashboard/support", icon: <LifeBuoy size={20} /> },
    { label: "Ajustes", href: "/dashboard/settings", icon: <Settings size={20} /> },
];

export default function Sidebar({
    isCollapsed = false,
    onToggleCollapse,
}: {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <Link href="/dashboard" className="flex items-center gap-2 ml-3">
                    <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                    </div>
                    <span className="text-base font-bold text-gray-900">Pyform</span>
                </Link>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Desktop */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex-col hidden lg:flex transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"
                    }`}
            >
                {/* Logo Area */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <Link href="/dashboard" className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
                        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">P</span>
                        </div>
                        {!isCollapsed && <span className="text-xl font-bold text-gray-900 truncate">Pyform</span>}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                title={isCollapsed ? item.label : undefined}
                                className={
                                    isActive
                                        ? `flex items-center gap-3 py-3 rounded-xl bg-gray-100 text-gray-900 font-medium transition-all duration-150 ${isCollapsed ? "justify-center px-0" : "px-4"}`
                                        : `flex items-center gap-3 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150 ${isCollapsed ? "justify-center px-0" : "px-4"}`
                                }
                            >
                                <span className={`${isActive ? "text-gray-900" : "text-gray-400"} flex-shrink-0`}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle Button & User Section container */}
                <div className="mt-auto border-t border-gray-100 flex flex-col">
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className={`p-4 flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors ${isCollapsed ? "justify-center" : "justify-end"}`}
                            title={isCollapsed ? "Expandir" : "Colapsar"}
                        >
                            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {isOpen && (
                <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col lg:hidden">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-white font-bold text-lg">P</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">Pyform</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={
                                        isActive
                                            ? "flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 text-gray-900 font-medium transition-all duration-150"
                                            : "flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
                                    }
                                >
                                    <span className={isActive ? "text-gray-900" : "text-gray-400"}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-100">
                        <ButtonAccount />
                    </div>
                </aside>
            )}
        </>
    );
}
