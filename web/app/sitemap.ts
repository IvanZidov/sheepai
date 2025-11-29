import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cybershepherd.io";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ];

  // In a real app, you would fetch article IDs from your database/API
  // For now, returning static pages only
  // const articlePages = articles.map((article) => ({
  //   url: `${baseUrl}/article/${article.id}`,
  //   lastModified: new Date(article.publishedAt),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }));

  return [...staticPages];
}

