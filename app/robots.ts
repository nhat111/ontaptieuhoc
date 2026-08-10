import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Editor, account and per-session pages carry no content worth indexing
      // (/result only exists in sessionStorage, /progress requires a login).
      disallow: [
        "/api/",
        "/import",
        "/result",
        "/progress",
        "/login",
        "/reset-password",
        "/auth/",
        "/nang-cap",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
