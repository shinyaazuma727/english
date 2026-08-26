import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KAKU - 英単語を書いて覚える",
    short_name: "KAKU",
    description: "Apple Pencilで英単語を手書きしながら覚える英語学習アプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f9f4",
    theme_color: "#0e8f5e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
