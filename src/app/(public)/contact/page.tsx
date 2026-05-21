import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="site-gutter mx-auto w-full max-w-2xl py-12">
      <div className="animate-fade-up mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Is something missing or incorrect? Send a short message below.
        </p>
      </div>
      <div className="animate-fade-up-d1">
        <ContactForm />
      </div>
    </div>
  );
}
