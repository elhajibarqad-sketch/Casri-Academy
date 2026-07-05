import { InfoGridPage } from "@/components/marketing/info-grid-page";

export const metadata = {
  title: "Support Center | Casri Academy",
  description: "Support center for Casri Academy learners, course access, payments, accounts, and technical help.",
};

const items = [
  { meta: "Account", title: "Login and Signup Help", body: "Get help with account access, password requirements, profile settings, and secure sessions." },
  { meta: "Courses", title: "Course Access", body: "Review enrollment status, payment state, lesson access, previews, and course player questions." },
  { meta: "Payments", title: "Billing Support", body: "Understand manual or Stripe-ready payment flows, order confirmation, and receipt status." },
  { meta: "Learning", title: "Progress and Certificates", body: "Get support with completion percentages, lesson progress, certificates, and learning records." },
  { meta: "Security", title: "Account Security", body: "Learn how to protect your account, avoid phishing, and keep contact information current." },
  { meta: "Contact", title: "Message the Team", body: "Use the contact page for support requests, partnership questions, and academy inquiries." },
];

export default function SupportPage() {
  return <InfoGridPage eyebrow="Support" title="Support center for learners." body="Find help for accounts, payments, course access, progress tracking, and platform questions. Use the contact page for direct support requests." items={items} />;
}
