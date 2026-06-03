#!/usr/bin/env node
/**
 * Build a Markdown summary of an axe-core accessibility report for a GitHub issue.
 *
 * Usage: node a11y-report.mjs <path-to-axe-report.json>
 * Env:
 *   DOCS_URL  Public docs site base URL; audited localhost links are rewritten to it.
 *   RUN_URL   Link to the GitHub Actions run that produced the report.
 */
import { readFileSync } from 'node:fs';

// Show at most this many example elements per rule, per page.
// Breadth of error kinds matters more than an exhaustive listing.
const MAX_PER_PAGE = 10;
const LOCAL = 'http://localhost:8080';

const reportPath = process.argv[2];
const docsUrl = (process.env.DOCS_URL || '').replace(/\/$/, '');
const runUrl = process.env.RUN_URL || '';

const pages = JSON.parse(readFileSync(reportPath, 'utf8'));

// Audits run against a local server, so rewrite links to the public site.
const toPublic = (url) => (docsUrl ? url.replace(LOCAL, docsUrl) : url);
const toPath = (url) => url.replace(LOCAL, '') || '/';
const pageLink = (url) => `[${toPath(url)}](${toPublic(url)})`;

// Flatten every failing element, tagged with its page and rule.
const elements = [];
for (const page of pages) {
  for (const v of page.violations ?? []) {
    for (const node of v.nodes ?? []) {
      elements.push({
        url: page.url,
        rule: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        description: v.description,
        target: node.target?.[0] ?? '(unknown)',
        summary: (node.failureSummary ?? '')
          .replace(/^Fix any of the following:\s*/i, '')
          .replace(/\s*\n\s*/g, ' ')
          .trim(),
      });
    }
  }
}

const lines = ['## Accessibility audit', ''];

if (elements.length === 0) {
  lines.push('No accessibility violations detected. 🎉');
  console.log(lines.join('\n'));
  process.exit(0);
}

const rules = [...new Set(elements.map((e) => e.rule))];
const pagesWithIssues = [...new Set(elements.map((e) => e.url))];
const ruleCount = (id) => elements.filter((e) => e.rule === id).length;
const pageCount = (url) => elements.filter((e) => e.url === url).length;
const rulesByCount = rules.slice().sort((a, b) => ruleCount(b) - ruleCount(a));

lines.push(
  `**${elements.length} issues** across **${rules.length} rule types** on **${pagesWithIssues.length} pages**.`,
);
if (runUrl) {
  lines.push(`See the [most recent run](${runUrl}) · audited against WCAG 2.0 / 2.1 (A & AA).`);
}
lines.push('');

// Summary: issues by rule
lines.push('### Issues by rule', '', '| Rule | Impact | Elements |', '| --- | --- | --- |');
for (const id of rulesByCount) {
  const e = elements.find((x) => x.rule === id);
  lines.push(`| [${id}](${e.helpUrl}) | ${e.impact} | ${ruleCount(id)} |`);
}
lines.push('');

// Summary: affected pages (0-count pages are simply absent)
lines.push('### Affected pages', '', '| Page | Issues |', '| --- | --- |');
for (const url of pagesWithIssues.slice().sort((a, b) => pageCount(b) - pageCount(a))) {
  lines.push(`| ${pageLink(url)} | ${pageCount(url)} |`);
}
lines.push('');

// Details: one collapsible dropdown per rule
lines.push('### Details', '');
for (const id of rulesByCount) {
  const ruleElements = elements.filter((e) => e.rule === id);
  const { impact, description, helpUrl } = ruleElements[0];
  lines.push(
    '<details>',
    `<summary><strong>${id}</strong> (${impact}) — ${ruleElements.length} elements</summary>`,
    '',
    `> ${description} [Learn more](${helpUrl})`,
    '',
  );
  for (const url of [...new Set(ruleElements.map((e) => e.url))]) {
    const onPage = ruleElements.filter((e) => e.url === url);
    lines.push(`On ${pageLink(url)}:`, '');
    for (const e of onPage.slice(0, MAX_PER_PAGE)) {
      lines.push(`- \`${e.target}\` — ${e.summary}`);
    }
    if (onPage.length > MAX_PER_PAGE) {
      lines.push(`- …and ${onPage.length - MAX_PER_PAGE} more on this page`);
    }
    lines.push('');
  }
  lines.push('</details>', '');
}

// GitHub rejects issue bodies over 65536 characters, which would fail the
// `gh issue` call. Truncate well under that and point to the full run.
const MAX_BODY = 60000;
const body = lines.join('\n');
console.log(
  body.length > MAX_BODY
    ? `${body.slice(0, MAX_BODY)}\n\n_Report truncated — see the [most recent run](${runUrl}) for the full details._`
    : body,
);
