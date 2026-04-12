import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // This is the magic line for GitHub Pages
  images: {
    unoptimized: true,   // GitHub Pages doesn't support the Next.js image server
  },
  // If your domain is a subfolder like username.github.io/repo-name, 
  // add: basePath: '/repo-name',
};

export default nextConfig;
