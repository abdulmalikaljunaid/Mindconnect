/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Remove ignoreBuildErrors to catch TypeScript errors during build
    // ignoreBuildErrors: true,
  },
  images: {
    // Enable image optimization for better performance
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
  // Power performance optimizations
  poweredByHeader: false,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

export default nextConfig
