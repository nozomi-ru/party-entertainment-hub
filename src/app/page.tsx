import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/landing";
import { pageSeo } from "@/config/site";

const ProblemSolution = dynamic(
  () =>
    import("@/components/landing/ProblemSolution").then(
      (m) => m.ProblemSolution,
    ),
);
const Features = dynamic(() =>
  import("@/components/landing/Features").then((m) => m.Features),
);
const Affiliate = dynamic(() =>
  import("@/components/landing/Affiliate").then((m) => m.Affiliate),
);
const Footer = dynamic(() =>
  import("@/components/landing/Footer").then((m) => m.Footer),
);

export const metadata: Metadata = {
  title: {
    absolute: pageSeo.home.title,
  },
  description: pageSeo.home.description,
  openGraph: {
    title: pageSeo.home.title,
    description: pageSeo.home.description,
  },
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ProblemSolution />
      <Features />
      <Affiliate />
      <Footer />
    </main>
  );
}
