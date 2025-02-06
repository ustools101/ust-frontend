import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomSessionProvider from '@/components/providers/custom-session-provider';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react"
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate Social Tools",
  description: "Your all-in-one social media management solution",
  manifest: '/manifest.json',
  icons: {
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  themeColor: '#111827',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ultimate Social Tools',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Ultimate Social Tools",
    "apple-mobile-web-app-title": "Ultimate Social Tools",
    "theme-color": "#111827",
    "msapplication-navbutton-color": "#111827",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-starturl": "/?source=pwa",
    
    // iPhone 14 Pro Max
    "apple-touch-startup-image-1284x2778": "/splash/splash-iPhone14ProMax.png",
    // iPhone 14 Pro
    "apple-touch-startup-image-1170x2532": "/splash/splash-iPhone14Pro.png",
    // iPhone 14
    "apple-touch-startup-image-1179x2556": "/splash/splash-iPhone14.png",
    // iPhone 13 Pro
    // iPhone 12 Mini
    "apple-touch-startup-image-1080x2340": "/splash/splash-iPhone12Mini.png",
    // iPhone X
    "apple-touch-startup-image-1125x2436": "/splash/splash-iPhoneX.png",
    // iPhone Xr
    "apple-touch-startup-image-828x1792": "/splash/splash-iPhoneXr.png",
    // iPhone 8
    "apple-touch-startup-image-750x1334": "/splash/splash-iPhone8.png",
    // iPad Pro 11-inch
    "apple-touch-startup-image-1668x2388": "/splash/splash-iPadPro3.png",
    // iPad Pro 12.9-inch
    "apple-touch-startup-image-2048x2732": "/splash/splash-iPadPro4.png",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="dark">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        {/* iOS Splash Screen Links */}
        <link
          href="/splash/splash-iPhone14ProMax.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhone14Pro.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhone14.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhone13Pro.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhone12Mini.png"
          media="(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhoneX.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhoneXr.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPhone8.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPadPro3.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
        <link
          href="/splash/splash-iPadPro4.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"
        />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <Analytics />
        <CustomSessionProvider>
          <ThemeProvider>
            <Toaster />
            {children}
          </ThemeProvider>
        </CustomSessionProvider>
      </body>
    </html>
  );
}
