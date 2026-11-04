/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { serverComponentsExternalPackages: ["postgres", "bcryptjs", "qrcode"] }
};
export default nextConfig;
