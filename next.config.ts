import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/grades/:gradeId",
        destination: "/grades?gradeId=:gradeId",
      },
      {
        source: "/topics/:topicId",
        destination: "/topics?topicId=:topicId",
      },
      {
        source: "/worksheets/generate/:templateId",
        destination: "/worksheets/generate?templateId=:templateId",
      },
    ];
  },
};

export default nextConfig;