"use client";

import { signOut } from "next-auth/react";
import { ReactNode } from "react";

interface ButtonSignoutProps {
    children?: ReactNode;
    className?: string;
    callbackUrl?: string;
}

const ButtonSignout = ({
    children,
    className = "btn",
    callbackUrl = "/"
}: ButtonSignoutProps) => {
    const handleSignOut = () => {
        signOut({ callbackUrl });
    };

    return (
        <button className={className} onClick={handleSignOut}>
            {children || "Sign out"}
        </button>
    );
};

export default ButtonSignout;
