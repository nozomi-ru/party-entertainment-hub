import {
  Affiliate,
  Features,
  Footer,
  Hero,
  ProblemSolution,
} from "@/components/landing";

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
