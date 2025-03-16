/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    return config;
  },
  images: {
    domains: ['www.paypalobjects.com', 'diplomacollective.com']
  },
};

module.exports = nextConfig; 