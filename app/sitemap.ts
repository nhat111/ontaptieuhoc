import type { MetadataRoute } from "next";
import { getIndexableLessonIds } from "@/lib/db";
import { SITE_URL } from "@/lib/siteUrl";
import { GRADES, SUBJECTS_BY_GRADE, getDefaultSubject } from "@/lib/subjects";

// Lessons are created through /import at runtime, so the sitemap has to be
// generated per request rather than frozen at build time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lessonIds = await getIndexableLessonIds();

  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/de-thi`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/huong-dan`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/huong-dan/soan-de`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    // Trò chơi lớp 1, lớp 2 (câu hỏi sinh trên trình duyệt, nội dung trang cố định).
    ...[
      ...["", "/dem-hinh", "/hai-tao", "/nghe-chu", "/nhin-hinh", "/chon-dau"].map((p) => `/lop/1/tro-choi${p}`),
      ...["", "/dong-ho", "/hai-tao", "/chinh-ta", "/loai-tu"].map((p) => `/lop/2/tro-choi${p}`),
    ].map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  // /lop/1 … /lop/5, both the exercise and the exam view.
  const gradePages: MetadataRoute.Sitemap = GRADES.flatMap((g) => [
    { url: `${SITE_URL}/lop/${g}`, lastModified, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE_URL}/lop/${g}?view=exam`, lastModified, changeFrequency: "daily" as const, priority: 0.7 },
  ]);

  // One entry per subject tab, e.g. /lop/3?subject=Ti%E1%BA%BFng%20Vi%E1%BB%87t.
  // The default subject of a grade is already covered by the bare /lop/[grade]
  // URL above, so it is skipped to avoid two URLs with identical content.
  const subjectPages: MetadataRoute.Sitemap = GRADES.flatMap((grade) =>
    SUBJECTS_BY_GRADE[grade]
      .filter((subject) => subject !== getDefaultSubject(grade))
      .map((subject) => ({
        url: `${SITE_URL}/lop/${grade}?subject=${encodeURIComponent(subject)}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  const lessonPages: MetadataRoute.Sitemap = lessonIds.map((id) => ({
    url: `${SITE_URL}/quiz?lessonId=${id}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...gradePages, ...subjectPages, ...lessonPages];
}
