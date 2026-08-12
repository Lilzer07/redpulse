import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/canvas/SmoothScroll";
import Scene from "@/components/canvas/Scene";
import Nav from "@/components/ui/Nav";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "VELOCE — Maison Automobile",
  description:
    "Ferrari, Lamborghini, McLaren, Porsche. Un court-métrage interactif.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="webgl-canvas">
          <Scene />
        </div>

        <Nav />

        <SmoothScroll>
          <main className="dom-layer">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
