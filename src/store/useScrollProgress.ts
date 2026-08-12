import { create } from "zustand";

export type SceneId =
  | "intro" // scene 1
  | "showroom-entry" // scene 2
  | "ferrari-orbit" // scene 3
  | "ferrari-cockpit" // scene 4
  | "showroom-tour" // scene 5
  | "lamborghini-reveal" // scene 6
  | "lamborghini-underside" // scene 7
  | "mclaren-reveal" // scene 8
  | "mclaren-hood" // scene 8
  | "porsche-reveal" // scene 9
  | "porsche-rear" // scene 9
  | "showroom-exit" // scene 10
  | "road-drive" // scene 11
  | "services" // scene 12
  | "inventory" // scene 13
  | "configurator" // scene 14
  | "contact"; // scene 15

interface ScrollProgressState {
  /** 0..1 across the whole cinematic (showroom + road) scroll track */
  progress: number;
  sceneId: SceneId;
  setProgress: (p: number) => void;
  setScene: (s: SceneId) => void;
}

export const useScrollProgress = create<ScrollProgressState>((set) => ({
  progress: 0,
  sceneId: "intro",
  setProgress: (p) => set({ progress: p }),
  setScene: (s) => set({ sceneId: s }),
}));
