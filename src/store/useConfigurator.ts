import { create } from "zustand";

export type CarKey = "ferrari" | "lamborghini" | "mclaren" | "porsche";

interface PaintOption {
  label: string;
  hex: string;
}

interface ConfiguratorState {
  activeCar: CarKey;
  paint: string;
  caliperColor: string;
  rimStyle: "forge" | "carbon" | "chrome";
  interior: "cuir-noir" | "cuir-cognac" | "alcantara";
  carbonPack: boolean;
  paintOptions: PaintOption[];
  setActiveCar: (c: CarKey) => void;
  setPaint: (hex: string) => void;
  setCaliperColor: (hex: string) => void;
  setRimStyle: (r: "forge" | "carbon" | "chrome") => void;
  setInterior: (i: "cuir-noir" | "cuir-cognac" | "alcantara") => void;
  toggleCarbonPack: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  activeCar: "ferrari",
  paint: "#a10f1f",
  caliperColor: "#ff5a1f",
  rimStyle: "forge",
  interior: "cuir-noir",
  carbonPack: false,
  paintOptions: [
    { label: "Rosso Competizione", hex: "#a10f1f" },
    { label: "Nero Profondo", hex: "#0c0c0e" },
    { label: "Giallo Corsa", hex: "#e8b100" },
    { label: "Argento Titane", hex: "#c4c8ce" },
    { label: "Blu Sera", hex: "#0d3b66" },
  ],
  setActiveCar: (c) => set({ activeCar: c }),
  setPaint: (hex) => set({ paint: hex }),
  setCaliperColor: (hex) => set({ caliperColor: hex }),
  setRimStyle: (r) => set({ rimStyle: r }),
  setInterior: (i) => set({ interior: i }),
  toggleCarbonPack: () => set((s) => ({ carbonPack: !s.carbonPack })),
}));
