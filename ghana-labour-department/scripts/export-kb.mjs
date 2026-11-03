// Exports the chatbot knowledge base (static/js/knowledge.js) to KNOWLEDGE_BASE.md for review.
// Run: node scripts/export-kb.mjs
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const window = {};
vm.runInNewContext(readFileSync(new URL("../static/js/knowledge.js", import.meta.url), "utf8"), { window });

const md = (html) => html
  .replace(/<li>/g, "\n- ").replace(/<\/li>/g, "")
  .replace(/<\/?ul>/g, "\n").replace(/<p>/g, "\n").replace(/<\/p>/g, "\n")
  .replace(/<\/?strong>/g, "**").replace(/<[^>]+>/g, "")
  .replace(/\n{3,}/g, "\n\n").trim();
const link = (l) => (l.href.startsWith("http") ? `[${l.label}](${l.href})` : `${l.label} (\`${l.href}\`)`);

const groups = [
  ["Small talk", ["greeting", "capabilities", "thanks", "bye"]],
  ["Jobs and GLMIS", ["glmis_about", "glmis_register", "glmis_employer", "glmis_free", "glmis_help", "lmi_data", "cv_help"]],
  ["Public Employment Centres", ["pec", "counselling"]],
  ["Pay, hours and leave", ["min_wage", "unpaid_salary", "annual_leave", "working_hours", "overtime", "maternity", "sick_leave", "contract"]],
  ["Dismissal and complaints", ["termination_notice", "unfair_termination", "complaint"]],
  ["Child labour", ["child_labour_law", "child_labour_report", "gaap"]],
  ["Safety, injury and inspection", ["compensation", "safety", "inspection", "employer_duties", "union"]],
  ["Agencies, scams and working abroad", ["agency_license", "scam", "migration"]],
  ["About the Department", ["chief_officer", "about", "ministry", "labour_bill", "contact"]],
];
const byId = Object.fromEntries(window.LD_KB.map((i) => [i.id, i]));
const used = new Set(groups.flatMap((g) => g[1]));
const extra = window.LD_KB.filter((i) => !used.has(i.id)).map((i) => i.id);
if (extra.length) groups.push(["Other", extra]);

let out = `# Kofi chatbot knowledge base\n\nGenerated from \`static/js/knowledge.js\` by \`node scripts/export-kb.mjs\`. Edit answers in \`knowledge.js\` (and the fact sheet in \`api/chat.js\` if AI mode is on), then re-run this script.\n\n${window.LD_KB.length} topics. For each topic: the example questions it is trained on, the answer Kofi gives, and the buttons shown under the answer.\n`;
let n = 0;
for (const [title, ids] of groups) {
  out += `\n## ${title}\n`;
  for (const id of ids) {
    const it = byId[id]; if (!it) continue; n++;
    out += `\n### ${n}. ${it.q[0].charAt(0).toUpperCase() + it.q[0].slice(1)}\n\n`;
    out += `**Example questions:** ${it.q.map((q) => `"${q}"`).join(", ")}\n\n`;
    out += `**Answer:**\n\n${md(it.a)}\n\n`;
    if (it.links?.length) out += `**Buttons:** ${it.links.map(link).join(" | ")}\n`;
  }
}
out += `\n## When Kofi does not understand\n\n${md(window.LD_KB_FALLBACK.a)}\n\n**Buttons:** ${window.LD_KB_FALLBACK.links.map(link).join(" | ")}\n`;
out += `\n## Fact sheet used in AI mode\n\nWhen \`ANTHROPIC_API_KEY\` is set, the AI is given these facts and told to stay within them:\n\n${window.LD_KB_FACTS.split("\n").map((l) => "- " + l).join("\n")}\n`;
writeFileSync(new URL("../KNOWLEDGE_BASE.md", import.meta.url), out);
console.log(`Wrote KNOWLEDGE_BASE.md (${n} topics)`);
