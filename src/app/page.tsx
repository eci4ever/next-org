import { CTA } from "@/components/marketing/cta";
import { FAQ } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { Problem } from "@/components/marketing/problem";
import { Reveal } from "@/components/marketing/reveal";
import { UseCases } from "@/components/marketing/use-cases";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Reveal variant="fade-up"><Problem /></Reveal>
        <Reveal variant="fade-up"><Features /></Reveal>
        <Reveal variant="fade-up"><UseCases /></Reveal>
        <Reveal variant="fade-up"><HowItWorks /></Reveal>
        <Reveal variant="fade-up"><Pricing /></Reveal>
        <Reveal variant="fade-up"><FAQ /></Reveal>
        <Reveal variant="fade-up"><CTA /></Reveal>
      </main>
      <Footer />
    </>
  );
}
