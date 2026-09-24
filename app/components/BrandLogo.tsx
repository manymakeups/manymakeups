import Image from "next/image";
import { site } from "@/lib/site";

type Size = "header" | "footer" | "block";

const frame: Record<Size, string> = {
  header: "size-[5.5rem] sm:size-[8.75rem] md:size-[10.5rem]",
  footer: "size-[5.5rem]",
  block: "size-[20rem] xl:size-[24rem]",
};

export function BrandLogo({
  size,
  className,
  priority,
}: {
  size: Size;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={size === "header" ? "/brand/logo-mark.png" : site.logo}
      alt=""
      width={1024}
      height={1024}
      className={className ?? frame[size]}
      quality={100}
      unoptimized
      priority={priority ?? size === "header"}
    />
  );
}
