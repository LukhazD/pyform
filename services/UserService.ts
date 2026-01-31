export class UserService {
    static async refreshSession(sessionId?: string | null) {
        const url = sessionId
            ? `/api/user/refresh-session?session_id=${sessionId}`
            : `/api/user/refresh-session`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Failed to refresh session");
        }

        return await res.json();
    }

    static async updateOnboarding(name: string) {
        const res = await fetch("/api/user/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        return data;
    }
}
