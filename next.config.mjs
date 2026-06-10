import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: projectRoot
  },
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
