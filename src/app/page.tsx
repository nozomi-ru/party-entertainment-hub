import type { Metadata } from "next";
import {
  Affiliate,
  Features,
  Footer,
  Hero,
  ProblemSolution,
} from "@/components/landing";
import { pageSeo } from "@/config/site";

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
