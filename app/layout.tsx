import type { Metadata, Viewport } from "next";
import "./globals.css";
import { manrope, fraunces, materialSymbols } from "./fonts";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/Confirm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterSW } from "@/components/RegisterSW";

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

// Last-resort splash recovery. If the JS bundle fails to load / hydrate (a stale
// service worker serving a dead chunk after a deploy), React never runs, so the
// in-app 6s escape hatch never appears. This runs from the document itself:
// after 12s with no sign of the app, it swaps the splash for reload controls.
const recoveryScript = `setTimeout(function(){
  try{
    if(window.__rcReady) return;
    var boot=document.querySelector('.boot');
    if(!boot||document.querySelector('.boot-stuck')) return;
    var wrap=document.createElement('div');
    wrap.className='boot-stuck';
    wrap.innerHTML='<p>This is taking longer than it should.</p>';
    var mk=function(label,fn){var x=document.createElement('button');x.className='btn-ghost';x.textContent=label;x.onclick=fn;wrap.appendChild(x);};
    mk('Reload',function(){location.reload();});
    mk('Clear cached files & reload',function(){
      var done=function(){location.reload();};
      try{
        var p=('serviceWorker' in navigator)
          ? navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister();}));})
          : Promise.resolve();
        p.then(function(){return (typeof caches!=='undefined')?caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x);}));}):null;}).then(done,done);
      }catch(e){done();}
    });
    var n=document.createElement('span');n.className='boot-stuck-note';n.textContent='Your logged sessions and rounds are kept.';wrap.appendChild(n);
    boot.appendChild(wrap);
  }catch(e){}
},12000);`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable} ${materialSymbols.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: recoveryScript }} />
        <a href="#main" className="skip-link">Skip to content</a>
        <ToastProvider>
          <ConfirmProvider>
            <div className="app">{children}</div>
            <InstallPrompt />
            <RegisterSW />
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
