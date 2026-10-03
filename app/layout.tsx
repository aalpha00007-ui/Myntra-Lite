import type { Metadata, Viewport } from "next";
import { Assistant } from "next/font/google";
import { WebHeader } from "@/components/ui";
import "./globals.css";

const assistant = Assistant({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-assistant" });

export const metadata: Metadata = {
  title: "Myntra-Lite",
  description: "A learning project: a fashion shopping app with Fit Twin size suggestions. Not affiliated with Myntra.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#d6336c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={assistant.variable}>
      <body>
        <div className="app">
          <WebHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
