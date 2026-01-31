import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Hardcoded for Production Stability: Points to HuggingFace Space
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://akhil-008-agentic-compliance-analyst.hf.space';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
