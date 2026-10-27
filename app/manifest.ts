import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YS-Jasstafel",
    short_name: "YS-Jasstafel",
    description: "Gratis Jasstafel für den Schieber – Open Source aus der Schweiz",
    categories: ["games", "utilities"],
    lang: "de-CH",
    start_url: "/spiele",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#242424",
    theme_color: "#242424",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
