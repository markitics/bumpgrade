# Content Surfaces

Issue #20 turns the top-level marketing routes into source-aware product
surfaces instead of placeholders:

- `/users`: audience segments with linked feature IDs, issue numbers, and agent
  boundaries.
- `/developers-and-agents`: public read contracts, agent docs, MCP direction,
  and write-safety boundaries.
- `/resources`: comparison, migration, launch, product, blog-index, and agent
  resources with evidence routes.
- `/pricing`: launch pricing direction and explicit not-yet-claimed billing
  caveats.
- `/pricing-v2`: usage-based pricing exploration for Mark to compare before
  replacing launch pricing or enabling self-serve checkout.
- `/content/source-data`: public-safe JSON mirror for audiences, resources,
  pricing principles, and planned pricing tracks.
- `/pricing-v2/source-data`: public-safe JSON with usage meters, decision
  questions, source references, and billing caveats.

Pricing tracks are positioning hypotheses only. `/pricing-v2` is a public
exploration, not a final plan table. Do not describe plan names, amounts,
limits, trials, entitlements, or live billing availability as shipped until a
later billing rollout issue adds source evidence.

Agents may read `/content/source-data` and cite its stable IDs. They still need
source URLs, issue links, shipped-product evidence, or work-log evidence before
changing public resource, migration, launch, or pricing claims.
