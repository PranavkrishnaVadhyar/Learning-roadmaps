# Kernel Atlas

A simple website displaying the supplied Kernel Methods roadmap: 44 topics across nine stages, from elementary mathematics to research directions. No additional roadmaps or concepts are included.

## Open the website

Open `index.html` directly in a browser. Alternatively, run:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Then visit http://127.0.0.1:4173. No installation or build step is required.

The homepage lists all available roadmaps from the content registry. Currently it contains only Kernel Methods; no additional roadmaps have been added.

## Using the roadmap

- Choose Kernel Methods on the homepage, then open a stage and select a topic.
- Search for a concept or method.
- Follow prerequisite links or use the optional connection graph.
- Use previous/next links to move through the topics.
- Drag the graph to pan; zoom, fit, focus, or expand its connections.
- Read topic notes alongside the graph. No progress tracking or browser storage is used.

The original `kernel-atlas.html` is preserved. Lessons retain its definitions, mathematics, derivations, intuition, applications, practice questions, and readings.

## Code structure

```text
index.html                    Entry page and script loading order
assets/styles/main.css        Layout and responsive styles
src/content/kernel-concepts.js Original roadmap content
src/content/roadmaps.js        Single roadmap definition
src/core/                     View state, traversal, helpers
src/views/                    Homepage, outline, graph, lesson, roadmap rendering
src/router.js                 Roadmap and help navigation
src/app.js                    Startup and navigation events
tests/verify.cjs               Content and behavior smoke checks
```

Classic scripts keep direct-file opening working offline. External readings require internet access. To edit the roadmap, update its content records; prerequisite IDs must resolve and the dependency graph must remain acyclic.

## Verify

```sh
node tests/verify.cjs
```

Checks cover the single-roadmap scope, 44 original topics, dependencies, lesson rendering, static graph rendering and absence of browser storage. They use a minimal DOM stub, not a visual browser test.
