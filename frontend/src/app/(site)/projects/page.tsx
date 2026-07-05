import type { Metadata } from "next";

import { ProjectCard } from "@/components/home/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects — Srikar Pattipati",
  description: "AI/ML and systems projects: LLM products, NLP, streaming pipelines, cloud.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Every page here renders from the same markdown my AI assistant
          retrieves and cites — one source of truth for humans and machines.
        </p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.05}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </main>
  );
}
