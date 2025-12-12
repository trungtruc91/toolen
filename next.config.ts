import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false  // Strict type checking
  },
  eslint: {
    ignoreDuringBuilds: false
  }
}

export default nextConfig
