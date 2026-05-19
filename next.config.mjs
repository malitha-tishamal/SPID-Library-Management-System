/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? `/venus-nextjs` : "";

const nextConfig = {
  // Remove static export to allow API routes (NextAuth requires this)
  // output: "export", // Commented out to enable API routes
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || (basePath ? `${basePath}` : "http://localhost:3000"),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "vinulabs-secret-key-change-in-production",
  },
};

export default nextConfig;
