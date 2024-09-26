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
          src="/SUPER_.png"
          width={1417 / 2}
          height={850 / 2}
          alt="super暦ロゴ"
        />
      </div>
      <button className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
        <Link href="candidate">細川 の空き時間</Link>
      </button>
    </div>
  );
}
