import type { Metadata, Viewport } from "next";
import "./globals.css";
import { manrope, materialSymbols } from "./fonts";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/Confirm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterSW } from "@/components/RegisterSW";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "RangeCard",
  title: "RangeCard — Golf Range Tracker",
  description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RangeCard",
    startupImage: [
      {
        url: "/apple-splash-1284x2778.png",
        media:
          "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  other: { "mobile-web-app-capable": "yes" },
  openGraph: {
    title: "RangeCard",
    description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
    type: "website",
    images: [{ url: "/og.png", width: 1024, height: 1024, alt: "RangeCard" }],
  },
  twitter: {
    card: "summary",
    title: "RangeCard",
    description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1013", // dark default; the inline script corrects it per theme
  width: "device-width",
  initialScale: 1,
  // pinch-zoom is left enabled — capping it fails WCAG 1.4.4
  viewportFit: "cover",
};

// Before first paint: apply a forced light/dark choice, then point the
// theme-color meta at whatever --bg resolves to (so the browser chrome /
// status bar matches the theme instead of always being dark).
const themeScript = `try{
  var d=document.documentElement,t=localStorage.getItem('theme');
  if(t==='light'||t==='dark')d.setAttribute('data-theme',t);
  var bg=getComputedStyle(d).getPropertyValue('--bg').trim();
  var m=document.querySelector('meta[name="theme-color"]');
  if(m&&bg)m.setAttribute('content',bg);
}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${materialSymbols.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a href="#main" className="skip-link">Skip to content</a>
        <ToastProvider>
          <ConfirmProvider>
            <div className="app">{children}</div>
            <InstallPrompt />
            <RegisterSW />
            <SmoothScroll />
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
