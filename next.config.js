/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Ensure the /sops markdown files are bundled into the Vercel deployment
  // so lib/sops.ts can read them at runtime.
  outputFileTracingIncludes: {
    "/sops": ["./sops/**/*"],
    "/sops/[slug]": ["./sops/**/*"],
  },
};

module.exports = nextConfig;
