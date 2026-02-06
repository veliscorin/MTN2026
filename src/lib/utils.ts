import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BRAND_COLORS = {
  PINK: "#FF3294",
  YELLOW: "#FFAB00",
  GREEN: "#00AB9D",
  BLUE: "#242F6B",
  ORANGE: "#F38133",
  DARK_GREY: "#333132",
  LIGHT_BROWN: "#F6F0EB",
};
