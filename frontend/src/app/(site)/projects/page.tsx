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
        <p className="microlabel">Index — {projects.length} projects</p>
        <h1 className="display mt-3 text-3xl font-semibold">Projects</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Every page here renders from the same markdown my AI assistant
          retrieves and cites — one source of truth for humans and machines.
        </p>
      </Reveal>
      <div className="mt-12">
        {projects.map((project, i) => (
          <Reveal key={project.slug} delay={i * 0.04}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </div>
    </main>
  );
}
