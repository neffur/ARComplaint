import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ComplaintProvider } from "@/lib/complaint-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARComplaint - Complaint Management System",
  description:
    "Modern complaint management system for reporting and tracking issues",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e22323",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <ComplaintProvider>{children}</ComplaintProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
