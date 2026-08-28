import Image from "next/image";

const LOGO_SRC =
  "https://ik.imagekit.io/1pscfy7oah/kiarova/kiavora.png?updatedAt=1787868605345";

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
      height={Math.round(width * 0.3)}
      className={className}
      priority
    />
  );
}
