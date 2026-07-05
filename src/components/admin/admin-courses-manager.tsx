"use client";

import { useEffect, useMemo, useState } from "react";

type AdminCourse = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  status: string;
  priceCents: number;
  instructor: string;
  duration: string;
  outcomes: string[];
  thumbnail?: string | null;
  lessons: { id: string; title: string; order: number; isFree: boolean }[];
};

const initialCourse = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  category: "FOREX_BASICS",
  level: "BEGINNER",
  priceCents: 5900,
  instructor: "",
  duration: "",
  thumbnail: "",
  outcomes: "",
};

const controlClass =
  "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-300 dark:focus:ring-cyan-300/10";

const panelClass =
  "grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-950 sm:p-6";

export function AdminCoursesManager() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(initialCourse);
  const [lesson, setLesson] = useState({
    title: "",
    slug: "",
    summary: "",
    videoUrl: "",
    pdfUrl: "",
    order: 1,
    isFree: false,
    durationMin: 15,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedCourse = useMemo(() => courses.find((course) => course.id === selectedId), [courses, selectedId]);

  async function loadCourses() {
    setLoading(true);
    const response = await fetch("/api/admin/courses", { cache: "no-store" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "Unable to load courses. Check admin login and database.");
      return;
    }
    setCourses(data.courses ?? []);
    setSelectedId((current) => current || data.courses?.[0]?.id || "");
  }

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void loadCourses();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = {
      ...form,
      priceCents: Number(form.priceCents),
      outcomes: form.outcomes.split(",").map((item) => item.trim()).filter(Boolean),
    };
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setMessage(response.ok ? "Course draft created." : data.error ?? "Unable to create course.");
    if (response.ok) {
      setForm(initialCourse);
      await loadCourses();
    }
  }

  async function updateStatus(id: string, status: "PUBLISHED" | "ARCHIVED") {
    const response = await fetch(`/api/admin/courses/${id}`, {
      method: status === "ARCHIVED" ? "DELETE" : "PATCH",
      headers: { "content-type": "application/json" },
      body: status === "ARCHIVED" ? undefined : JSON.stringify({ status }),
    });
    const data = await response.json();
    setMessage(response.ok ? `Course ${status.toLowerCase()}.` : data.error ?? "Unable to update course.");
    if (response.ok) await loadCourses();
  }

  async function submitLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return setMessage("Select a course first.");
    const response = await fetch(`/api/admin/courses/${selectedId}/lessons`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...lesson,
        order: Number(lesson.order),
        durationMin: Number(lesson.durationMin),
      }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Lesson added to course." : data.error ?? "Unable to add lesson.");
    if (response.ok) {
      setLesson({ title: "", slug: "", summary: "", videoUrl: "", pdfUrl: "", order: 1, isFree: false, durationMin: 15 });
      await loadCourses();
    }
  }

  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="grid gap-5">
        <form onSubmit={submitCourse} className={panelClass}>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Create course</h2>
          {[
            ["title", "Title"],
            ["slug", "Slug"],
            ["instructor", "Instructor"],
            ["duration", "Duration"],
            ["thumbnail", "Thumbnail URL"],
          ].map(([key, label]) => (
            <input
              key={key}
              value={String(form[key as keyof typeof form])}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={label}
              className={controlClass}
            />
          ))}
          <input
            type="number"
            value={form.priceCents}
            onChange={(event) => setForm((current) => ({ ...current, priceCents: Number(event.target.value) }))}
            placeholder="Price cents"
            className={controlClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={controlClass}>
              <option value="FOREX_BASICS">Forex Basics</option>
              <option value="TECHNICAL_ANALYSIS">Technical Analysis</option>
              <option value="RISK_MANAGEMENT">Risk Management</option>
              <option value="CRYPTO_BASICS">Crypto Basics</option>
              <option value="BLOCKCHAIN">Blockchain</option>
              <option value="TRADING_PSYCHOLOGY">Trading Psychology</option>
            </select>
            <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))} className={controlClass}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <input value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Subtitle" className={controlClass} />
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={5} className={controlClass} />
          <input value={form.outcomes} onChange={(event) => setForm((current) => ({ ...current, outcomes: event.target.value }))} placeholder="Outcomes, comma separated" className={controlClass} />
          <button className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">Save draft</button>
        </form>

        <form onSubmit={submitLesson} className={panelClass}>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Add lesson media</h2>
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className={controlClass}>
            <option value="">Select course</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          {[
            ["title", "Lesson title"],
            ["slug", "lesson-slug"],
            ["videoUrl", "Video URL from Cloudinary/S3"],
            ["pdfUrl", "PDF URL from Cloudinary/S3"],
          ].map(([key, label]) => (
            <input key={key} value={String(lesson[key as keyof typeof lesson])} onChange={(event) => setLesson((current) => ({ ...current, [key]: event.target.value }))} placeholder={label} className={controlClass} />
          ))}
          <textarea value={lesson.summary} onChange={(event) => setLesson((current) => ({ ...current, summary: event.target.value }))} placeholder="Lesson summary" rows={3} className={controlClass} />
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="number" value={lesson.order} onChange={(event) => setLesson((current) => ({ ...current, order: Number(event.target.value) }))} placeholder="Order" className={controlClass} />
            <input type="number" value={lesson.durationMin} onChange={(event) => setLesson((current) => ({ ...current, durationMin: Number(event.target.value) }))} placeholder="Minutes" className={controlClass} />
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
              <input type="checkbox" checked={lesson.isFree} onChange={(event) => setLesson((current) => ({ ...current, isFree: event.target.checked }))} />
              Free
            </label>
          </div>
          <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Attach lesson</button>
        </form>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-white/10">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Courses in database</h2>
          {message && <p className="mt-2 text-sm font-semibold text-cyan-600 dark:text-cyan-200">{message}</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <tr>
                {["Course", "Category", "Price", "Status", "Lessons", "Actions"].map((head) => (
                  <th key={head} className="px-5 py-4 font-bold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <tr><td className="px-5 py-6 text-slate-600 dark:text-slate-300" colSpan={6}>Loading courses...</td></tr>
              ) : courses.length === 0 ? (
                <tr><td className="px-5 py-6 text-slate-600 dark:text-slate-300" colSpan={6}>No courses yet. Create the first draft.</td></tr>
              ) : courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{course.title}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{course.category}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">${Math.round(course.priceCents / 100)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">{course.status}</span></td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{course.lessons?.length ?? 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(course.id, "PUBLISHED")} className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-bold text-white">Publish</button>
                      <button onClick={() => updateStatus(course.id, "ARCHIVED")} className="rounded-full bg-rose-500 px-3 py-2 text-xs font-bold text-white">Archive</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedCourse && <div className="border-t border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10">Selected: {selectedCourse.title}</div>}
      </div>
    </div>
  );
}
