import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "スーパー こよみ",
  description: "日程調整に手間取ったり、予定が合えばもっと親しい人と時間を共有したい学部3年生などの履修が多様化したり就活などで生活リズムが違う人との交流が増えたりした学生向けのスーパーこよみというプロダクトは日程調整ツールですこれはゼロコストでの日程調整ができ、TimeTree, Spir, Google Calender とは違って、アプリの違いを気にせず予定を秘匿にしたまま気軽に日程を調整できる機能が備わっている。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
