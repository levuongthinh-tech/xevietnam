import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.vnecdn.net' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  experimental: {
    // Tăng tốc build
  },
}

export default nextConfig
