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
        <header className="site-header">
          <div>
            <div className="site-title">中孟法律术语库</div>
            <div className="site-subtitle">Zh–Bn Legal Corpus</div>
          </div>
          <nav className="site-nav">
            <a href="#dictionary">术语检索 Search</a>
            <a href="#import">资料导入 Upload</a>
            <a href="#about">项目简介 About</a>
          </nav>
        </header>
        <main className="main-container">{children}</main>
      </body>
    </html>
  );
}
