"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main
                className={`transition-all duration-300 min-h-screen pt-16 lg:pt-0 flex-1 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
                    }`}
            >
                {children}
            </main>
        </div>
    );
}
