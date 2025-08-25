import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public'
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
      '*.firebase.studio',
      'shyft-xphli.firebaseapp.com',
    ],
  },
};

export default withPWA(nextConfig);
