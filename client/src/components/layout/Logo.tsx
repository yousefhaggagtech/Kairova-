import Image from "next/image";

type LogoProps = {
  width?: number;
};

export default function Logo({ width = 120 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Kairova"
      width={width}
      height={Math.round(width * 0.3)}
      priority
    />
  );
}
