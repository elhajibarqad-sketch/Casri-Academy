import { PageFrame, PageHero } from "@/components/page-frame";

export default function ContactPage() {
  return (
    <PageFrame>
      <PageHero eyebrow="Contact" title="Talk to Casri Academy." body="Questions about courses, instructor access, enterprise teams, or payments? Send a message to the backend contact API." />
      <section className="mx-auto max-w-3xl px-5 py-12">
        <form action="/api/contact" method="post" className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/5">
          <input name="name" required placeholder="Name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
          <input name="email" required type="email" placeholder="Email" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
          <input name="topic" required placeholder="Topic" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
          <textarea name="message" required placeholder="Message" rows={6} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
          <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">Send message</button>
        </form>
      </section>
    </PageFrame>
  );
}
