import Image from "next/image";

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
    </div>
  );
}
