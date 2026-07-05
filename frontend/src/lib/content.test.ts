import { describe, expect, it } from "vitest";

import { getDoc, getProject, getProjects } from "./content";

describe("content loader (against the real /content knowledge base)", () => {
  it("loads all projects with required frontmatter and unique slugs", () => {
    const projects = getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(5);
    for (const p of projects) {
      expect(p.type).toBe("project");
      expect(p.title).not.toBe("");
      expect(p.body.length).toBeGreaterThan(100);
    }
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
  });

  it("sorts projects newest first", () => {
    const dates = getProjects().map((p) => p.date ?? "");
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("loads single docs by path and by slug", () => {
    expect(getDoc("resume/resume.md").type).toBe("resume");
    expect(getProject("vital-stream")?.title).toContain("vital-stream");
    expect(getProject("does-not-exist")).toBeNull();
  });
});
