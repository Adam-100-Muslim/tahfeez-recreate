import type { NextConfig } from "next";
const { withExpo } = require('@expo/next-adapter');

const nextConfig: NextConfig = {
  // Configure for React Native Web compatibility
  webpack: (config: any) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
  transpilePackages: [
    'react-native',
    'react-native-web',
    'expo',
    '@expo/vector-icons',
  ],
};

export default withExpo(nextConfig);
