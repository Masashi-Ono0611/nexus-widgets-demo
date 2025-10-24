/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fallback configuration to ignore browser-dependent APIs during SSR
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // React Native related
      '@react-native-async-storage/async-storage': false,
      // Logging related
      'pino-pretty': false,
      // Storage related (indexedDB related)
      'idb-keyval': false,
      'unstorage': false,
      // Browser APIs
      'indexedDB': false,
      'localStorage': false,
      'sessionStorage': false,
      // Other browser-dependent APIs
      'crypto': false,
      'fs': false,
      'path': false,
      'os': false,
      'util': false,
    };

    // Apply fallback only on server side
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Additional server-side fallback
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }

    return config;
  },
};

export default nextConfig;
