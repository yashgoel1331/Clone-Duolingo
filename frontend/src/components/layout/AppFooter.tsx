"use client";

const frontendStack = [
  "Next.js 16 (App Router)",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Vitest",
];

const backendStack = ["FastAPI", "SQLAlchemy 2", "Alembic", "SQLite", "Pydantic Settings"];

const projectLinks = [
  { label: "Learn home", href: "/" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Profile", href: "/profile" },
  { label: "Settings", href: "/settings" },
];

export function AppFooter() {
  return (
    <footer className="mt-10 border-t border-border/80 bg-bg-secondary/30 px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-2 xl:grid-cols-4">
        <section>
          <h2 className="text-sm font-black uppercase tracking-wide text-text">Built by</h2>
          <p className="mt-3 text-xl font-black text-text">Yash Goel</p>
          <p className="mt-1 text-sm font-extrabold text-text-muted">Software Developer Intern @ Flywheel</p>
          <p className="mt-2 text-sm font-bold leading-6 text-text-muted">
            B.Tech, Instrumentation &amp; Control Engineering
            <br />
            Netaji Subhas University of Technology, Delhi
          </p>
          <p className="mt-4 text-sm font-bold leading-6 text-text-muted">
            Built this Duolingo clone as a full-stack project with a production-style frontend, backend API,
            and seeded learner flows.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-wide text-text">Connect</h2>
          <ul className="mt-3 space-y-3 text-sm font-bold text-text-muted">
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-text"
                href="mailto:yashgoel31105@gmail.com"
              >
                yashgoel31105@gmail.com
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-text"
                href="https://github.com/yashgoel1331"
                target="_blank"
                rel="noreferrer"
              >
                github.com/yashgoel1331
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-text"
                href="https://linkedin.com/in/yash-goel"
                target="_blank"
                rel="noreferrer"
              >
                linkedin.com/in/yash-goel
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-2 hover:text-text"
                href="https://yashgoel1331.github.io"
                target="_blank"
                rel="noreferrer"
              >
                yashgoel1331.github.io
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-wide text-text">Tech stack</h2>
          <div className="mt-3">
            <p className="text-xs font-black uppercase tracking-wide text-text">Frontend</p>
            <ul className="mt-2 space-y-1 text-sm font-bold text-text-muted">
              {frontendStack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <p className="text-xs font-black uppercase tracking-wide text-text">Backend</p>
            <ul className="mt-2 space-y-1 text-sm font-bold text-text-muted">
              {backendStack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-wide text-text">Project</h2>
          <ul className="mt-3 space-y-2 text-sm font-bold text-text-muted">
            {projectLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="hover:text-text">
                  {item.label}
                </a>
              </li>
            ))}
            <li className="pt-2 text-xs font-black uppercase tracking-wide text-text">Repository</li>
            <li>
              <a
                href="https://github.com/yashgoel1331/Clone-Duolingo"
                className="text-sm font-bold text-text-muted hover:text-text"
                target="_blank"
                rel="noreferrer"
              >
                github.com/yashgoel1331/Clone-Duolingo
              </a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  );
}
