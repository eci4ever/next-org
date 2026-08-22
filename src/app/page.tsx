import {
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  CheckIcon,
  CirclePlayIcon,
  Clock3Icon,
  GraduationCapIcon,
  Layers3Icon,
  MessageCircleMoreIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const courses = [
  {
    category: "Design",
    title: "Designing thoughtful digital products",
    meta: "24 lessons · 8 weeks",
    color: "from-violet-500/30 via-fuchsia-500/10",
  },
  {
    category: "Development",
    title: "Modern web development foundations",
    meta: "32 lessons · 10 weeks",
    color: "from-blue-500/30 via-cyan-500/10",
  },
  {
    category: "Business",
    title: "Build and validate your next idea",
    meta: "18 lessons · 6 weeks",
    color: "from-amber-500/30 via-orange-500/10",
  },
];

const features = [
  {
    icon: Layers3Icon,
    title: "Structured learning",
    text: "Follow clear paths with focused lessons, practical projects, and measurable milestones.",
  },
  {
    icon: BarChart3Icon,
    title: "Visible progress",
    text: "Track completed lessons, assessment results, and the skills you are building in real time.",
  },
  {
    icon: MessageCircleMoreIcon,
    title: "Human support",
    text: "Exchange ideas and get useful feedback from instructors and your learning community.",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent)]"
        aria-hidden="true"
      />

      <header className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <GraduationCapIcon className="size-4.5" aria-hidden="true" />
            </span>
            Learnspace
          </Link>
          <nav
            className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
            aria-label="Main navigation"
          >
            <a
              className="transition-colors hover:text-foreground"
              href="#courses"
            >
              Courses
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="#features"
            >
              Why Learnspace
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="#community"
            >
              Community
            </a>
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              nativeButton={false}
              variant="ghost"
              className="hidden sm:inline-flex"
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
            <Button nativeButton={false} render={<Link href="/signup" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="px-5 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="max-w-3xl">
              <Badge
                variant="secondary"
                className="mb-6 gap-1.5 rounded-full px-3 py-1.5"
              >
                <SparklesIcon data-icon="inline-start" />A better way to keep
                learning
              </Badge>
              <h1 className="text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
                Build skills that move you forward.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Learn from practical courses, experienced instructors, and a
                community that helps you turn knowledge into real progress.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  nativeButton={false}
                  size="lg"
                  className="w-full px-5 shadow-sm sm:w-auto"
                  render={<Link href="/signup" />}
                >
                  Start learning free
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                  className="w-full px-5 sm:w-auto"
                  render={<a href="#courses" />}
                >
                  <CirclePlayIcon data-icon="inline-start" />
                  Explore courses
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {[
                  "No credit card",
                  "Learn at your pace",
                  "Track your progress",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckIcon
                      className="size-3.5 text-foreground"
                      aria-hidden="true"
                    />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Card className="mx-auto w-full max-w-xl overflow-hidden border-0 bg-card/90 p-2 shadow-2xl shadow-primary/5 ring-1 ring-foreground/10 backdrop-blur-sm">
              <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg bg-neutral-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(139,92,246,.5),transparent_35%),radial-gradient(circle_at_25%_75%,rgba(59,130,246,.4),transparent_40%)]" />
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:32px_32px]" />
                <span className="relative flex size-14 items-center justify-center rounded-full bg-white text-neutral-950 shadow-xl">
                  <CirclePlayIcon className="size-6" aria-hidden="true" />
                </span>
                <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between text-white">
                  <div>
                    <p className="text-xs text-white/65">Featured lesson</p>
                    <p className="mt-1 text-sm font-medium">
                      Building better learning habits
                    </p>
                  </div>
                  <span className="rounded-md bg-black/35 px-2 py-1 text-xs backdrop-blur-sm">
                    08:42
                  </span>
                </div>
              </div>
              <CardContent className="gap-5 px-4 pt-4 pb-3 sm:px-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      YOUR NEXT COURSE
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold">
                      Learn how to learn
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    In progress
                  </span>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>12 of 18 lessons</span>
                    <span>67%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-2/3 rounded-full bg-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-border/60 bg-muted/25 px-5 py-8 sm:px-6">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              ["12k+", "Active learners"],
              ["180+", "Expert-led courses"],
              ["94%", "Completion rate"],
              ["4.9/5", "Average rating"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="courses"
          className="scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Popular courses
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Start with what inspires you.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Practical, focused courses built to help you create meaningful
                work.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.title}
                  className="group border-0 py-0 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${course.color} to-transparent`}
                  >
                    <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:28px_28px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-background/80 shadow-lg ring-1 ring-foreground/10 backdrop-blur-sm transition-transform group-hover:scale-105">
                        <BookOpenIcon className="size-6" aria-hidden="true" />
                      </span>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-background/80 text-foreground backdrop-blur-sm">
                      {course.category}
                    </Badge>
                  </div>
                  <CardContent className="gap-4 px-5 pt-5 pb-6">
                    <h3 className="text-lg leading-6 font-semibold tracking-tight">
                      {course.title}
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3Icon className="size-3.5" aria-hidden="true" />
                      {course.meta}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-20 bg-foreground px-5 py-20 text-background sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-medium tracking-widest text-background/55 uppercase">
              Built for progress
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Everything you need to keep moving.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-background/15 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="bg-foreground p-7 sm:p-8">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-background/10">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-background/60">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="community"
          className="scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <div className="flex gap-1 text-amber-500">
                {["one", "two", "three", "four", "five"].map((star) => (
                  <StarIcon
                    key={star}
                    className="size-4 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="mt-5 text-2xl leading-9 font-medium tracking-tight sm:text-3xl sm:leading-11">
                “The lessons are clear, practical, and easy to fit around my
                schedule. I can finally see the progress I’m making.”
              </blockquote>
              <p className="mt-5 text-sm text-muted-foreground">
                Nadia Rahman · Product designer
              </p>
            </div>
            <Card className="border-0 bg-muted/40 shadow-none ring-1 ring-foreground/10">
              <CardContent className="p-8 sm:p-10">
                <UsersIcon className="size-7" aria-hidden="true" />
                <h2 className="mt-8 text-3xl font-semibold tracking-[-0.03em]">
                  Learn alongside people who care.
                </h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Join focused discussions, share your work, and get the
                  encouragement you need to finish what you start.
                </p>
                <Button
                  nativeButton={false}
                  className="mt-7"
                  render={<Link href="/signup" />}
                >
                  Join the community
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12 sm:py-18">
            <GraduationCapIcon className="size-8" aria-hidden="true" />
            <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Your next chapter starts here.
            </h2>
            <p className="mt-4 max-w-xl text-primary-foreground/70">
              Create your free account and start learning with courses designed
              for real progress.
            </p>
            <Button
              nativeButton={false}
              size="lg"
              variant="secondary"
              className="mt-8 px-5"
              render={<Link href="/signup" />}
            >
              Create free account
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <GraduationCapIcon className="size-4" />
            Learnspace
          </div>
          <p>Learn continuously. Grow confidently.</p>
          <div className="flex gap-5">
            <Link className="hover:text-foreground" href="/login">
              Sign in
            </Link>
            <Link className="hover:text-foreground" href="/signup">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
