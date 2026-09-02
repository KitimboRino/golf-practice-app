import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterSW } from "@/components/RegisterSW";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  applicationName: "RangeCard",
  title: "RangeCard — Golf Range Tracker",
  description: "Log range sessions from the 4-week plan and track your progress. Works offline.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "RangeCard" },
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
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ToastProvider>
          <div className="app">{children}</div>
          <InstallPrompt />
          <RegisterSW />
          <SmoothScroll />
        </ToastProvider>
      </body>
    </html>
  );
}
