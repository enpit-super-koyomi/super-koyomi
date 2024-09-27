import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Image
          src="/SUPER_koyo.svg"
          width={1417 / 4}
          height={850 / 4}
          alt="super暦ロゴ"
        />
      </div>
      <div
        className="text-center">
        <div className="italic">候補の選択すらできない</div>
        <div className="font-bold">One-click</div>
        <div className="text-xl">日程<del>強制</del>ツール</div>
        <div className="text-xl"><span className="opacity-0">日程</span>調整<span className="opacity-0">ツール</span></div>

      </div>
      <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <Link href="/adjust">予定を調整する</Link>
      </button>
    </div>
  );
}
