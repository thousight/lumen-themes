# Language samples

Open these fixtures in a clean VS Code profile with either Lumen theme. They are visual examples, not executable applications, and are excluded from the VSIX.

| Fixtures | Language mode / grammar |
| --- | --- |
| `json.json`, `jsonc.jsonc`, `json-lines.jsonl`, `example.code-snippets` | Built-in JSON, JSON with Comments, JSON Lines, Snippets |
| `styles.css` | Built-in CSS |
| `config.ini`, `application.properties` | Built-in INI, Properties |
| `markup.html`, `document.xml`, `image.svg` | Built-in HTML, XML (select XML for SVG) |
| `javascript.js`, `javascript.jsx`, `typescript.ts`, `typescript.tsx` | Built-in JavaScript, JavaScript React, TypeScript React |
| `config.yaml` | Built-in YAML |
| `config.toml` | [Even Better TOML](https://github.com/tamasfe/taplo), `tamasfe.even-better-toml@0.21.2` |
| `.env.example` | [DotENV](https://github.com/mikestead/vscode-dotenv), `mikestead.dotenv@1.0.1`; dummy values only |
| Existing Python, Rust, C++, PHP, shell, Markdown files | Select the corresponding language mode; language extensions may supply additional semantic tokens |

The rendering suite checks specific syntax tokens in both variants with semantic highlighting enabled and disabled. It installs the two pinned grammar extensions only in isolated test profiles. Alternative TOML and dotenv extensions can emit different scopes and are not covered by these checks.

Inspect keys versus values, quoted keys and escapes, CSS selectors, markup attributes and namespaces, and JS/TS object properties. Bracket pair colorization retains the theme's existing palette. INI/Properties and dotenv grammars do not classify every unquoted value as a string; these values may retain the editor foreground.
