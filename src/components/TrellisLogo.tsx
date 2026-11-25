"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import trellisDark from "@/assets/trellis-dark.png";
import trellisLight from "@/assets/trellis-light.png";

type TrellisLogoProps = {
  className?: string;
  priority?: boolean;
};

const subscribeToTheme = (callback: () => void) => {
  window.addEventListener("trellis-theme-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("trellis-theme-change", callback);
    window.removeEventListener("storage", callback);
  };
};

const getThemeSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export default function TrellisLogo({
  className = "h-auto w-55",
  priority = false,
}: TrellisLogoProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  return (
    <Image
      src={theme === "dark" ? trellisDark : trellisLight}
      alt="Trellis Bank Digital Banking"
      priority={priority}
      className={className}
    />
  );
}
