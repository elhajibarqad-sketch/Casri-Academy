import { DashboardShell } from "@/components/dashboard-shell";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  await requireAdmin();
  const certificates = await prisma.certificate.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <DashboardShell admin>
      <p className="text-sm font-bold uppercase text-cyan-500">Admin</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl">Certificates</h1>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-white/[0.05]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-white/5"><tr>{["Certificate", "Learner", "Course", "Issued", "PDF"].map((head) => <th key={head} className="px-5 py-4 font-bold">{head}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/10">
            {certificates.length === 0 ? <tr><td className="px-5 py-6 text-slate-500" colSpan={5}>No certificates issued.</td></tr> : certificates.map((certificate) => (
              <tr key={certificate.id}>
                <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{certificate.certificateNo}</td>
                <td className="px-5 py-4 text-slate-500">{certificate.user.name}<br />{certificate.user.email}</td>
                <td className="px-5 py-4 text-slate-500">{certificate.courseId.slice(0, 8)}</td>
                <td className="px-5 py-4 text-slate-500">{certificate.issuedAt.toLocaleDateString()}</td>
                <td className="px-5 py-4 text-slate-500">{certificate.pdfUrl ? "Ready" : "Not uploaded"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
