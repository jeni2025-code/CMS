import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Management System",
  description: "A modern college management platform for students, faculty, and admins.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
