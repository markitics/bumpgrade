# Content Surfaces

Issue #20 turns the top-level marketing routes into source-aware product
surfaces instead of placeholders:

- `/users`: audience index with linked feature IDs, issue numbers, and agent
  boundaries.
- `/users/[slug]`: issue #536 dedicated SEO use-case pages for the audience
  segments in `/content/source-data`, including canonical metadata, related
  public paths, evidence routes, and journey references.
- `/developers-and-agents`: public read contracts, agent docs, MCP direction,
  and write-safety boundaries.
- `/resources`: comparison, migration, launch, product, blog-index, and agent
  resources with evidence routes.
- `/pricing`: self-serve Experiment and Grow plans, Enterprise contact path,
  optional White glove setup, and current billing boundaries.
- `/pricing-v2`: an alternate usage-based pricing draft for future packaging
  decisions.
- `/content/source-data`: public-safe JSON mirror for audiences, dedicated
  use-case routes, resources, pricing principles, and planned pricing tracks.

Issue #316 makes Experiment and Grow self-serve account-plan checkout records.
Issue #317 adds the usage-based draft as an alternate, not the default. Future
limits, trials, usage-meter rates, and package changes still need source-data
updates before agents cite them as current.

Agents may read `/content/source-data` and cite its stable IDs. They still need
source URLs, issue links, shipped-product evidence, or work-log evidence before
changing public resource, migration, launch, or pricing claims.
