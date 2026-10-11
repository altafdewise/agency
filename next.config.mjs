/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Blog posts are markdown files read at request time (lib/posts.ts). Not
  // every server function gets them traced automatically — the sitemap didn't,
  // so it dropped the posts whenever it regenerated — so ship them with all.
  outputFileTracingIncludes: {
    "/**": ["./content/blog/**/*"],
  },
};

export default nextConfig;
