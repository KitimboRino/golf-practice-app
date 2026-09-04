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
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "RangeCard" },
  other: { "mobile-web-app-capable": "yes" },
  openGraph: {
    title: "RangeCard",
    description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "RangeCard" }],
  },
  twitter: {
    card: "summary",
    title: "RangeCard",
    description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
    images: ["/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1013",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Sync theme before first paint so a forced light/dark choice doesn't flash.
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

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
