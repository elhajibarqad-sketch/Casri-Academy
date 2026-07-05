import { redirect } from "next/navigation";

export default function MyCoursesIndexPage() {
  redirect("/dashboard/courses");
}
