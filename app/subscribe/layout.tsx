import React from "react";

export default function SubscribeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="min-h-screen bg-base-100">{children}</div>;
}
