# Lumen design

## Shared principles

The editor, sidebar, panels, and terminal share a background to create a continuous surface. Keep the workbench flat, with transparent widget shadows and subtle borders. Use restrained selection and hover tints, readable syntax, and quiet secondary UI elements.

Theme JSON is the source of truth for exact values and scope mappings. The values below summarize the current implementation rather than define a second palette to maintain independently.

## Color roles

**Primary** colors define the main surface and readable text. **Secondary** colors distinguish subdued text, borders, and interaction states. **Accent** colors emphasize actions and navigation. Secondary surfaces are neutral treatments of the primary surface; they do not form a separate sidebar or panel palette.

| Role and use | Blanc | Noir |
| --- | --- | --- |
| Primary surface — editor and workbench | Warm white `#f7f7f4` | Dark neutral `#26251e` |
| Primary text — editor and selected rows | Near black `#1a1a1a` | Light gray `#e0e0e0` |
| Secondary text — descriptions and quiet icons | Warm gray `#706d6b` | Gray `#a0a0a0` |
| Secondary surface — list hover / selection | Paper gray `#eaeae7` for both | White overlays: `#ffffff11` / `#ffffff22` |
| Secondary borders — subtle separation | `#e0e0de` | `#3a3933` |
| Action accent — primary buttons, focus, activity badges, progress | Muted blue `#496d91` | International Orange `#f54e00` |
| Navigation accent — links and search-result labels | Muted blue `#496d91` | Soft blue `#7eb6f6` |

Noir's secondary overlays blend with the surface beneath them; they are not opaque white. Syntax and diagnostic colors have separate semantic roles and should not all be replaced with the action accent.

Blanc uses neutral selection and hover backgrounds and a muted syntax palette. Primary buttons use muted blue `#496d91` with warm white text and a darker blue `#3f607f` on hover. Its normal, no-folder, and debugging status bars explicitly share the warm white background, dark foreground, and subtle border. Noir applies the same status bar treatment with its dark neutral background and light foreground.

Noir combines a neutral workbench with orange control-flow and action accents. Its cursor is neutral. Syntax, bracket colors, Git decorations, diagnostics, and terminal ANSI colors also use muted hues. Earlier monochromatic-only plans describe historical intent, not the current palette.

Blanc marks the active editor tab with a muted blue bottom border and a paper-gray background; inactive tabs share the warm-white primary surface. Noir uses a lighter dark-neutral active tab with an orange bottom border; inactive tabs share the dark-neutral primary surface. Unfocused active indicators are softened in both variants.

Remote status indicators retain the primary surface with action-accent text.

Inputs, dropdowns, and editor widgets share the primary surface and subtle borders. Menus, checkboxes, the Command Palette, suggestions, hovers, and notifications inherit these shared colors. Selected rows retain the theme's normal text color on neutral selection backgrounds. Preserve VS Code's derived hover and inactive colors where they already follow the palette.

Built-in diagnostics and input validation distinguish muted red errors, amber warnings, and blue information. Validation backgrounds use opaque, lightly tinted surfaces. Find matches use the action accent with a legible foreground and a translucent tint for other matches.

## Syntax and language coverage

| Syntax role | Blanc | Noir |
| --- | --- | --- |
| Keywords | Muted red | International Orange |
| Functions, configuration keys, properties, markup attributes | Muted blue | Soft blue |
| CSS selectors and configuration section headings | Muted teal | International Orange |
| Strings | Dark green | Soft green |
| Constants | Muted purple | Soft purple |

Use ordinary font weight and style for programming syntax; bold and italics are allowed for markup structure. Both variants enable semantic highlighting. Review TextMate rules and semantic token rules together so language-server highlighting preserves the intended hierarchy.

Prefer broad conventional scopes with narrow language-specific additions when needed. Use [the sample index](../samples/README.md) to inspect configuration formats, CSS, HTML/XML/SVG, JavaScript/JSX, TypeScript/TSX, Python, Rust, C++, PHP, shell, and Markdown. These are visual fixtures, not an executable test suite or a guarantee of every language's support.

JSON key quotes follow key colors; string values remain green and literals purple. CSS named values use the constant palette. JS/TS properties use blue in both TextMate and language-specific semantic rules, including readonly properties. YAML retains its existing tag-colored keys. TOML and dotenv coverage depends on the pinned grammars listed with the samples.

## Readability and integrations

Keep text legible against its actual background, including selections and overlays. Account for alpha blending when evaluating contrast. Record measured combinations and conditions before making accessibility claims; old completion statements are not a current audit.

The themes contain GitLens and Error Lens color entries. Extension-defined colors depend on those extensions and their supported keys. Verify their behavior in the editor when changing them. Historical plans mention Todo Tree, but the current JSON does not contain explicit Todo Tree color entries.

## Changing the design

For a new visual direction, explain the decision here and link the relevant GitHub issue or PR. Update affected screenshots when they no longer represent the theme. Small corrections within the existing design need only the implementation, relevant verification, and a user-facing changelog entry.
