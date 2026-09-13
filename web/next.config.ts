import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components: уншилтыг `use cache`-ээр кэшлэн, админы засвар
  // `revalidateTag`-аар шууд түгдэг болгоно.
  cacheComponents: true,
};

export default nextConfig;
