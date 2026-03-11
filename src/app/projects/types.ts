export interface ProjectPage {
  slug: string;
  name: string;
  description: string;
}

export interface ProjectManifest {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  pages: ProjectPage[];
}
