import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "中孟法律术语库 / Zh–Bn Legal Corpus",
  description:
    "Offline-first Chinese and Bengali legal terminology reference built for bilingual practitioners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hans">
      <body>
        {children}
      </body>
    </html>
  );
}
