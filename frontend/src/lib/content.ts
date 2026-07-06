// Server-only content loader.
//
// The portfolio pages render from the SAME markdown documents the backend
// chunks and embeds for the AI (single source of truth — see
// docs/architecture.md). Files are read at build time; every page using this
// is statically generated.
//
// Deployment note: on Vercel the app root is frontend/, so "include files
// outside root directory" (default on) must stay enabled for ../content.

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import type { ContentDoc } from "./content-types";

const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(process.cwd(), "..", "content");

function parseFile(filePath: string): ContentDoc {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug: path.basename(filePath, ".md"),
    type: String(data.type ?? ""),
    title: String(data.title ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    date: data.date ? String(data.date) : null,
    links:
      data.links && typeof data.links === "object"
        ? Object.fromEntries(Object.entries(data.links).map(([k, v]) => [k, String(v)]))
        : {},
    body: content.trim(),
  };
}

export function getProjects(): ContentDoc[] {
  const dir = path.join(CONTENT_DIR, "projects");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseFile(path.join(dir, f)))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function getProject(slug: string): ContentDoc | null {
  const filePath = path.join(CONTENT_DIR, "projects", `${slug}.md`);
  return fs.existsSync(filePath) ? parseFile(filePath) : null;
}

/** Load a single doc by content-relative path, e.g. "resume/resume.md". */
export function getDoc(relPath: string): ContentDoc {
  return parseFile(path.join(CONTENT_DIR, relPath));
}

export interface Release {
  version: string;
  title: string;
  body: string;
}

/** Parse changelog/releases.md "## vX.Y — Title" sections into entries. */
export function getReleases(): Release[] {
  const doc = getDoc("changelog/releases.md");
  const releases: Release[] = [];
  for (const block of doc.body.split(/^## /m).slice(1)) {
    const [heading, ...rest] = block.split("\n");
    const match = heading.match(/^(v[\w.-]+)\s+—\s+(.*)$/);
    if (!match) continue;
    releases.push({
      version: match[1],
      title: match[2].trim(),
      body: rest.join("\n").trim(),
    });
  }
  return releases;
}
