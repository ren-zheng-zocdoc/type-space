"use client";

import { useState } from "react";
import { Container, Section, TextField, Button, Flag } from "@/components/vibezz";

export default function EmailPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-default-white)]">
      <Container size="narrow">
        <Section size="3">
          <div className="max-w-md mx-auto">
            <h1 className="text-[24px] leading-[32px] font-semibold text-[var(--text-default)]">
              Stay in the loop
            </h1>
            <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
              Enter your email to get updates.
            </p>

            {submitted ? (
              <div className="mt-6">
                <Flag
                  color="green"
                  title="You're subscribed!"
                >
                  {`We'll send updates to ${email}.`}
                </Flag>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <TextField
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  state={error ? "error" : "default"}
                  errorMessage={error}
                />
                <Button type="submit" variant="primary" size="default">
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </Section>
      </Container>
    </div>
  );
}
