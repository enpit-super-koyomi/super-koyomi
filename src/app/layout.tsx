import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { UserWidget } from "@/components/UserWidget"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: "スーパー こよみ",
  description:
    "日程調整に手間取ったり、予定が合えばもっと親しい人と時間を共有したい学部3年生などの履修が多様化したり就活などで生活リズムが違う人との交流が増えたりした学生向けのスーパーこよみというプロダクトは日程調整ツールですこれはゼロコストでの日程調整ができ、TimeTree, Spir, Google Calender とは違って、アプリの違いを気にせず予定を秘匿にしたまま気軽に日程を調整できる機能が備わっている。",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="w-full flex justify-between items-center p-3 fixed top-0 bg-white z-10">
          <p>スーパーこよみ</p>
          <UserWidget
            signin={Boolean(session?.user)}
            name={session?.user?.name ?? undefined}
            picture={session?.user?.image ?? undefined}
          />
        </header>

        <div className="relative h-8"></div>

        {children}
      </body>
    </html>
  )
}
