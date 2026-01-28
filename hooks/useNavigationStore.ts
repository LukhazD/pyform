
import { create } from 'zustand';

interface NavigationState {
    isNavigating: boolean;
    setNavigating: (isNavigating: boolean) => void;
    // We can add more robust locking if needed, e.g. timestamp
    lastActionTime: number;
    setLastActionTime: (time: number) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    isNavigating: false,
    setNavigating: (isNavigating) => set({ isNavigating }),
    lastActionTime: 0,
    setLastActionTime: (time) => set({ lastActionTime: time }),
}));
