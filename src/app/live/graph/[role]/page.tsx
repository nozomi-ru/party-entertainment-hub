import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ role: string }>;
};

/** 旧 live/graph 入口を専用ルートへ誘導 */
export default async function LegacyGraphRedirect({ params }: Props) {
  const { role } = await params;
  redirect(`/graph/${role}`);
}
