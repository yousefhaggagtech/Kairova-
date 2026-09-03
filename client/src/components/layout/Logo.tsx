import Image from "next/image";

const LOGO_SRC =
  "https://ik.imagekit.io/1pscfy7oah/kiarova/kiavora.png?updatedAt=1787868605345";
const LOGO_HEIGHT_RATIO = 749 / 2098;

type LogoProps = {
  className?: string;
  width?: number;
};

export default function Logo({ className, width = 120 }: LogoProps) {
  return (
    <Image
      src={LOGO_SRC}
      alt="Kairova"
      width={width}
      height={Math.round(width * LOGO_HEIGHT_RATIO)}
      className={className}
      style={{ height: "auto" }}
      priority
    />
  );
}
