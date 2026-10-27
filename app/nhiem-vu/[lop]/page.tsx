import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QuizClient from "@/components/quiz/QuizClient";
import { rowToQuestion } from "@/lib/quickExam";
import { dayLabel, isDay, missionHref, missionKey, MISSION_GRADES, vnDate } from "@/lib/mission";
import { buildMissionRows } from "@/lib/missionRows";

// /nhiem-vu/lop-3?bai=20&ngay=2026-10-27 — cùng lớp, bài, ngày → cùng 5 câu (link thách bạn mở lại đúng bộ).

type Props = { params: Promise<{ lop: string }>; searchParams: Promise<{ bai?: string; ngay?: string }> };

export const metadata: Metadata = { title: "Nhiệm vụ mỗi ngày", robots: { index: false, follow: false } };

export default async function MissionQuizPage({ params, searchParams }: Props) {
  const [{ lop }, sp] = await Promise.all([params, searchParams]);
  const grade = Number(/^lop-(\d)$/.exec(lop)?.[1]);
  if (!(MISSION_GRADES as readonly number[]).includes(grade)) notFound();
  const so = Number(sp.bai);
  const day = isDay(sp.ngay) ? sp.ngay : vnDate();
  const built = Number.isInteger(so) ? buildMissionRows(grade, so, day) : null;
  if (!built) redirect("/nhiem-vu");

  const href = missionHref(grade, so, day);
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <QuizClient
        initialQuestions={built.rows.map((r, i) => rowToQuestion(r, i + 1))}
        initialLesson={{
          id: 0,
          title: `Nhiệm vụ ${dayLabel(day)} · ${built.bai.label}. ${built.bai.ten}`,
          grade,
          subjectName: "Toán",
          durationMinutes: 10,
        }}
        quickExamHref={href}
        shareHref={href}
        progressKey={missionKey(grade, day)}
        backLink={{ href: "/nhiem-vu", label: "Nhiệm vụ mỗi ngày" }}
        retryLabel="Làm lại nhiệm vụ"
        missionDay={day}
        practice
      />
    </Suspense>
  );
}
