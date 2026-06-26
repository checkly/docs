"use client";
import { useEffect, useState } from "react";

/**
 * Note: this component was AI generated.
 *
 * Interactive pipeline that shows the Checkly workflow on an existing project:
 * setup → generate → test → deploy → monitor.
 *
 * Layout is a CSS grid: alternating auto / 1fr columns (tiles sit in the auto
 * columns, connector lines fill the 1fr columns) across two rows (tiles on row
 * 1, labels on row 2). `align-items: center` centers the lines on the tile axis
 * with no magic offsets. This interactive rail and its detail box are
 * desktop-only (>=640px). On mobile they're hidden and a separate static list
 * renders instead: each step's icon on the left, its label and description on
 * the right, with no selection. The full layout renders at rest at its final
 * size, so the entrance animation and selection only change transforms/colors,
 * so nothing reflows.
 *
 * The entrance plays once, when the component scrolls into view: a blue fill
 * sweeps left-to-right through the lines and each stage turns blue as the fill
 * passes it, then holds. Selecting a stage shows its explanation in the box
 * below. The prefers-reduced-motion fallback shows the completed state with no
 * motion.
 *
 * Everything lives inside the component on purpose: Mintlify evaluates the
 * exported component in an isolated scope, so module-level helpers/constants
 * and local `<Components>` are not resolvable here. The logic also sticks to
 * constructs Mintlify's snippet evaluator supports (no `in` operator, no
 * `.some()`, no `useRef`).
 */
export const SetupFlow = () => {
  const steps = [
    {
      label: "Setup",
      icon: "terminal",
      detail: (
        <span>
          Execute <code className="cklyflow-code">npx checkly init</code> to
          automatically install the <code className="cklyflow-code">checkly</code>{" "}
          CLI and the Checkly agent skills, and scaffold a{" "}
          <code className="cklyflow-code">checkly.config.ts</code>.
        </span>
      ),
    },
    {
      label: "Generate",
      icon: "agent",
      detail: (
        <span>
          Paste the provided prompt into your AI agent. It scans and parses your
          project, then creates monitoring resources using Checkly constructs.
        </span>
      ),
    },
    {
      label: "Test",
      icon: "testing",
      detail: (
        <span>
          Run <code className="cklyflow-code">npx checkly test</code> to validate
          your monitoring setup before it goes live.
        </span>
      ),
    },
    {
      label: "Deploy",
      icon: "deploy",
      detail: (
        <span>
          Deploy your code-defined monitoring with a single command:{" "}
          <code className="cklyflow-code">npx checkly deploy</code>.
        </span>
      ),
    },
    {
      label: "Monitor",
      icon: "globe",
      detail: (
        <span>
          Monitor your application from global locations and get alerted the
          moment something breaks.
        </span>
      ),
    },
  ];
  const stepGap = 0.5; // seconds between stages turning blue
  const columns = steps
    .map((step, i) => (i < steps.length - 1 ? "3.5rem 1fr" : "3.5rem"))
    .join(" ");

  const renderIcon = (name) => {
    const common = {
      width: 24,
      height: 24,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    };
    if (name === "terminal") {
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="1.5" />
          <path d="M7 9.5l3 2.5-3 2.5M12.5 15h4" />
        </svg>
      );
    }
    if (name === "agent") {
      return (
        <svg {...common} stroke="none" fill="currentColor">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
          <path d="M18.5 14l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" />
        </svg>
      );
    }
    if (name === "testing") {
      return (
        <svg {...common}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    }
    if (name === "deploy") {
      return (
        <svg {...common}>
          <path d="M12 3v12M7 8l5-5 5 5M5 21h14" />
        </svg>
      );
    }
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" />
      </svg>
    );
  };

  const [played, setPlayed] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const node = document.getElementById("cklyflow-root");

    if (reduce || !node || typeof IntersectionObserver === "undefined") {
      setPlayed(true);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setPlayed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);

    return function () {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      id="cklyflow-root"
      className={`cklyflow my-6 ${played ? "cklyflow-played" : ""}`}
    >
      <style>{`
        .cklyflow {
          --ckly-rest-border:#e5e7eb; --ckly-rest-icon:#9ca3af; --ckly-rest-bg:#ffffff;
          --ckly-blue:#0075ff; --ckly-blue-bg:rgba(0,117,255,0.08); --ckly-blue-icon:#0075ff;
          --ckly-line:#e5e7eb;
        }
        .dark .cklyflow {
          --ckly-rest-border:#374151; --ckly-rest-icon:#6b7280; --ckly-rest-bg:rgba(255,255,255,0.02);
          --ckly-blue:#3b9bff; --ckly-blue-bg:rgba(0,117,255,0.16); --ckly-blue-icon:#5aa9ff;
          --ckly-line:#374151;
        }
        .cklyflow-rail { display:none; }
        @media (min-width:640px) {
          .cklyflow-rail {
            display:grid;
            grid-template-columns:var(--ckly-cols);
            align-items:center;
            column-gap:.5rem;
            row-gap:.85rem;
          }
        }
        .cklyflow-list { display:flex; flex-direction:column; }
        .cklyflow-list-row { display:flex; gap:.9rem; align-items:stretch; }
        .cklyflow-list-rail { display:flex; flex-direction:column; align-items:center; flex:0 0 auto; }
        .cklyflow-list-line { flex:1 0 auto; width:2px; min-height:.85rem; margin:.4rem 0; border-radius:9999px; }
        .cklyflow-list-text { padding-bottom:1.4rem; }
        .cklyflow-list-row:last-child .cklyflow-list-text { padding-bottom:0; }
        .cklyflow-detail-box { display:none; }
        @media (min-width:640px) {
          .cklyflow-list { display:none; }
          .cklyflow-detail-box { display:block; }
        }
        .cklyflow-tile {
          border:1px solid var(--ckly-rest-border);
          background:var(--ckly-rest-bg);
          color:var(--ckly-rest-icon);
          padding:0;
          cursor:pointer;
          transition:
            border-color .4s ease var(--ckly-d,0s),
            background-color .4s ease var(--ckly-d,0s),
            color .4s ease var(--ckly-d,0s),
            transform .2s ease,
            box-shadow .2s ease;
        }
        @media (min-width:640px) { .cklyflow-tile { justify-self:center; } }
        .cklyflow-played .cklyflow-tile {
          border-color:var(--ckly-blue);
          background:var(--ckly-blue-bg);
          color:var(--ckly-blue-icon);
        }
        .cklyflow-tile.is-active {
          transform:scale(1.08);
          box-shadow:0 0 0 4px rgba(0,117,255,.18), 0 8px 20px -6px rgba(0,117,255,.5);
        }
        .cklyflow-tile:focus-visible { outline:2px solid var(--ckly-blue); outline-offset:2px; }
        .cklyflow-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size:.85em;
          background:rgba(0,0,0,.05);
          padding:.1em .35em;
          border-radius:.35em;
        }
        .dark .cklyflow-code { background:rgba(255,255,255,.1); }
        .cklyflow-line {
          position:relative; overflow:hidden; border-radius:9999px;
          width:100%; height:2px; background:var(--ckly-line);
        }
        .cklyflow-conn-v { position:relative; overflow:hidden; background:var(--ckly-line); }
        .cklyflow-fill-h, .cklyflow-fill-v { position:absolute; inset:0; background:var(--ckly-blue); }
        .cklyflow-fill-h {
          transform:scaleX(0); transform-origin:left center;
          transition:transform .4s ease var(--ckly-d,0s);
        }
        .cklyflow-fill-v {
          transform:scaleY(0); transform-origin:top center;
          transition:transform .4s ease var(--ckly-d,0s);
        }
        .cklyflow-played .cklyflow-fill-h { transform:scaleX(1); }
        .cklyflow-played .cklyflow-fill-v { transform:scaleY(1); }
        @media (prefers-reduced-motion: reduce) {
          .cklyflow-tile, .cklyflow-fill-h, .cklyflow-fill-v { transition:none !important; }
        }
      `}</style>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.02] p-6 sm:p-7">
        <div
          className="cklyflow-rail"
          style={{ "--ckly-cols": columns }}
          aria-label="The Checkly workflow: setup, generate, test, deploy, monitor"
        >
          {steps.flatMap((step, i) => {
            const isActive = selected === i;
            const tileCol = String(2 * i + 1);
            const items = [
              <button
                key={`${step.label}-tile`}
                type="button"
                aria-pressed={isActive}
                aria-controls="cklyflow-detail"
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                className={`cklyflow-tile ${isActive ? "is-active" : ""} rounded-2xl w-14 h-14 flex items-center justify-center`}
                style={{
                  "--ckly-d": `${i * stepGap}s`,
                  gridColumn: tileCol,
                  gridRow: "1",
                }}
              >
                {renderIcon(step.icon)}
              </button>,
              <div
                key={`${step.label}-label`}
                className={`text-sm font-semibold text-center transition-colors ${isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-200"}`}
                style={{ gridColumn: tileCol, gridRow: "2" }}
              >
                {step.label}
              </div>,
            ];

            if (i < steps.length - 1) {
              items.push(
                <div
                  key={`${step.label}-line`}
                  aria-hidden="true"
                  className="cklyflow-line"
                  style={{
                    "--ckly-d": `${i * stepGap + 0.2}s`,
                    gridColumn: String(2 * i + 2),
                    gridRow: "1",
                  }}
                >
                  <span className="cklyflow-fill-h" />
                </div>
              );
            }

            return items;
          })}
        </div>

        <div
          className="cklyflow-list"
          aria-label="The Checkly workflow: setup, generate, test, deploy, monitor"
        >
          {steps.map((step, i) => (
            <div key={`${step.label}-row`} className="cklyflow-list-row">
              <div className="cklyflow-list-rail">
                <div
                  className="cklyflow-tile rounded-2xl w-12 h-12 flex items-center justify-center"
                  style={{ "--ckly-d": `${i * stepGap}s`, cursor: "default" }}
                >
                  {renderIcon(step.icon)}
                </div>
                {i < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="cklyflow-conn-v cklyflow-list-line"
                    style={{ "--ckly-d": `${i * stepGap + 0.2}s` }}
                  >
                    <span className="cklyflow-fill-v" />
                  </div>
                )}
              </div>
              <div className="cklyflow-list-text">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {step.label}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1 mb-0">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          id="cklyflow-detail"
          className="cklyflow-detail-box mt-5 sm:mt-6 pt-5 border-t border-gray-200/80 dark:border-gray-800 min-h-[64px]"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed m-0">
            <span className="font-semibold text-gray-900 dark:text-white">
              {steps[selected].label}.
            </span>{" "}
            {steps[selected].detail}
          </p>
        </div>
      </div>
    </div>
  );
};
