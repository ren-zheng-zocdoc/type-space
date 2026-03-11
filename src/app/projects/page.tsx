"use client";

import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Nav,
  Logo,
  Container,
  Section,
  Header,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@/components/vibezz";
import { manifest } from "./example-project/manifest";

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={<NextLink href="/"><Logo size="small" /></NextLink>}
        right={
          <div className="flex items-center gap-4">
            <NextLink
              href="/components"
              className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] hover:text-[var(--text-link)] transition-colors"
            >
              Components
            </NextLink>
            <NextLink
              href="/projects"
              className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] hover:text-[var(--text-link)] transition-colors"
            >
              Projects
            </NextLink>
          </div>
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            <Header title={manifest.name} subbody={manifest.description} />

            {manifest.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {manifest.tags.map((tag) => (
                  <Badge key={tag} variant="info">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Table>
                <TableHeader>
                  <TableRow className="border-t-0">
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manifest.pages.map((page) => (
                    <TableRow
                      key={page.slug}
                      className="cursor-pointer"
                      onClick={() => router.push(`/projects/${page.slug}`)}
                    >
                      <TableCell>
                        <span className="font-semibold">{page.name}</span>
                      </TableCell>
                      <TableCell>{page.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
