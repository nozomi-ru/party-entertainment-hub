import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ role: string }>;
};

/** 旧 live/dress 入口を専用ルートへ誘導 */
export default async function LegacyDressRedirect({ params }: Props) {
  const { role } = await params;
  if (role === "admin") {
    redirect("/dress/admin?ans=orange");
  }
  redirect(`/dress/${role}`);
}
