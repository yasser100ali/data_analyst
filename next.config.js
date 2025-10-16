/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : `${process.env.RAILWAY_BACKEND_URL || "dataanalyst-production-2e27.up.railway.app"}/api/:path*`,
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/docs"
            : `${process.env.RAILWAY_BACKEND_URL || "dataanalyst-production-2e27.up.railway.app"}/docs`,
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/openapi.json"
            : `${process.env.RAILWAY_BACKEND_URL || "dataanalyst-production-2e27.up.railway.app"}/openapi.json`,
      },
    ];
  },
};

module.exports = nextConfig;
