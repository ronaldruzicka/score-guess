import { Image } from "@unpic/react";

import wcLogo from "./wc26-logo.png";

type Props = Readonly<{
  className?: string;
}>;

export function Logo({ className }: Props) {
  return (
    <Image
      className={className}
      src={wcLogo}
      alt="FIFA Cup 2026"
      layout="constrained"
      width={56}
      height={84}
    />
  );
}
