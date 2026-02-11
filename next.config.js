/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['jsdom', '@mozilla/readability', 'cheerio'],
    },
};

module.exports = nextConfig;


