import { create } from 'zustand';

interface TransitionState {
  isTransitioning: boolean;
  imageSrc: string | null;
  imageRect: DOMRect | null;
  setTransition: (src: string, rect: DOMRect) => void;
  clearTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  imageSrc: null,
  imageRect: null,
  setTransition: (src, rect) =>
    set({ isTransitioning: true, imageSrc: src, imageRect: rect }),
  clearTransition: () =>
    set({ isTransitioning: false, imageSrc: null, imageRect: null }),
}));
