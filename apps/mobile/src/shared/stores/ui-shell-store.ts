import { create } from 'zustand';

type UiShellStore = {
  isBottomNavHidden: boolean;
  setBottomNavHidden: (hidden: boolean) => void;
};

export const useUiShellStore = create<UiShellStore>((set) => ({
  isBottomNavHidden: false,
  setBottomNavHidden: (hidden) => set({ isBottomNavHidden: hidden }),
}));
