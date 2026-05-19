import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPID Library Management System",
  description: "Official Library Management System of the Southern Provincial Irrigation Department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50/50">
        {children}
      </body>
    </html>
  );
}
