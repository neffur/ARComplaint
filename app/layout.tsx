import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ComplaintProvider } from "@/lib/complaint-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARComplaint - Complaint Management System",
  description:
    "Modern complaint management system for reporting and tracking issues",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e22323",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ backgroundColor: "#0f0f0f", colorScheme: "dark" }}
    >
      <body
        className="font-sans antialiased"
        style={{ backgroundColor: "#0f0f0f" }}
      >
        <ComplaintProvider>{children}</ComplaintProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
