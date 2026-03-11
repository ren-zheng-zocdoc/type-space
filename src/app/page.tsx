import NextLink from "next/link";
import { Nav, Logo, Container, Section, Icon } from "@/components/vibezz";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={<Logo size="small" />}
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

      <main className="flex-1 flex items-center justify-center">
        <Container size="narrow">
          <Section size="3">
            <div className="text-center">
              <h1 className="text-[32px] leading-[44px] font-semibold text-[var(--text-default)]">
                Vibezz Design System
              </h1>
              <p className="mt-2 text-[16px] leading-[26px] text-[var(--text-secondary)]">
                Components and project templates for building consistent UIs.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <NextLink
                href="/components"
                className="group rounded-lg border border-[var(--stroke-default)] p-6 transition-colors hover:border-[var(--stroke-charcoal)]"
              >
                <div className="flex items-center gap-3">
                  <Icon name="widgets" size="24" className="text-[var(--icon-default)]" />
                  <h2 className="text-[18px] leading-[28px] font-semibold text-[var(--text-default)] group-hover:text-[var(--text-link)]">
                    Components
                  </h2>
                </div>
                <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                  Browse the full component library with props, variants, and usage examples.
                </p>
              </NextLink>

              <NextLink
                href="/projects"
                className="group rounded-lg border border-[var(--stroke-default)] p-6 transition-colors hover:border-[var(--stroke-charcoal)]"
              >
                <div className="flex items-center gap-3">
                  <Icon name="folder_open" size="24" className="text-[var(--icon-default)]" />
                  <h2 className="text-[18px] leading-[28px] font-semibold text-[var(--text-default)] group-hover:text-[var(--text-link)]">
                    Projects
                  </h2>
                </div>
                <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                  Example pages built with Vibezz components and dev tools.
                </p>
              </NextLink>
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
