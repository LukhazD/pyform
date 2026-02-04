/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import config from "@/config";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
// If the user is already logged in, it will show their profile picture & redirect them to callbackUrl immediately.
const ButtonSignin = ({
  text = "Get started",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    if (status === "authenticated") {
      setIsLoading(true);
      router.push(config.auth.callbackUrl);
    } else {
      signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    }
  };

  if (status === "authenticated") {
    return (
      <button
        onClick={() => {
          setIsLoading(true);
          router.push(config.auth.callbackUrl);
        }}
        disabled={isLoading}
        className={`btn ${extraStyle ? extraStyle : ""} ${isLoading ? "opacity-80 cursor-wait" : ""}`}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <>
            {session.user?.image ? (
              <img
                src={session.user?.image}
                alt={session.user?.name || "Account"}
                className="w-6 h-6 rounded-full shrink-0"
                referrerPolicy="no-referrer"
                width={24}
                height={24}
              />
            ) : (
              <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0 text-xs">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
              </span>
            )}
            {session.user?.name || session.user?.email || "Account"}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      className={`btn ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default ButtonSignin;
