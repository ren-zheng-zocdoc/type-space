import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import NextLink from "next/link";
import { IconButton } from "@/components/vibezz";
import { VibezzDevTools } from "@/dev-tools/vibezz-dev-tools";
import { InspectTool } from "@/dev-tools/inspect-tool";
import { SpacingTool } from "@/dev-tools/spacing-tool";
import { TypographyTool } from "@/dev-tools/typography-tool";
import { SettingsTool } from "@/dev-tools/settings-tool";
import { EscapeHint } from "@/dev-tools/escape-hint";
import { ChangesDrawer } from "@/dev-tools/changes-drawer";
import { manifest } from "../example-project/manifest";

interface Props {
  params: Promise<{ page: string }>;
}

export default async function DynamicPage({ params }: Props) {
  const { page } = await params;

  const pageInfo = manifest.pages.find((p) => p.slug === page);
  if (!pageInfo) notFound();

  const PageComponent = dynamic(
    () => import(`../example-project/pages/${page}`),
    {
      loading: () => (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-64 w-full max-w-2xl rounded bg-[var(--background-disabled)] animate-pulse" />
        </div>
      ),
    }
  );

  return (
    <div className="h-screen flex flex-col bg-[var(--background-default-white)]">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[var(--stroke-default)]">
        <NextLink href="/projects">
          <IconButton icon="arrow_back" size="small" aria-label="Back to pages" />
        </NextLink>
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)]">
            {pageInfo.name}
          </span>
          <span className="text-[12px] leading-[16px] text-[var(--text-secondary)]">
            {pageInfo.description}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <EscapeHint />
          <ChangesDrawer />
          <InspectTool />
          <VibezzDevTools />
          <SpacingTool />
          <TypographyTool />
          <SettingsTool />
        </div>
      </header>

      <Suspense>
        <PageComponent />
      </Suspense>
    </div>
  );
}
