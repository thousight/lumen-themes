# Theme testing and automated releases

Implemented and validated on GitHub-hosted Ubuntu runners on 2026-09-06.

## Workflow

- Pull requests run theme, package, VS Code rendering, and minimum-version compatibility tests without secrets.
- A separate release workflow runs on pushes to `main`, after required pull request checks have passed, validates commit messages, and runs semantic-release.
- GitHub Issues track follow-up work.

Semantic-release and its locked plugins determine the version, update `CHANGELOG.md`, build and test the VSIX, publish it to Open VSX and the Visual Studio Marketplace, and create the GitHub release. No release-worthy commit means no publication.

## Commands

| Command | Checks |
| --- | --- |
| `npm test` | Theme structure, colors, contrast invariants, and release mapping |
| `npm run test:package` | Builds and inspects the VSIX and its exclusions |
| `npm run test:ui` | Tests both themes in real pinned VS Code instances |
| `npm run test:compat` | Checks extension discovery in VS Code 1.80.0 |
| `npm run test:all` | Runs every check above |

The UI test installs the built VSIX and pinned TOML/dotenv grammar extensions into isolated profiles. It checks both themes with semantic highlighting enabled and disabled, verifies workbench surfaces and specific tokens in the language samples, and requires every test to complete. Both status bars retain their primary background; Blanc also has a visible active-tab underline. Exact color assertions are limited to the tested scenes, grammar extensions, and VS Code version; see [the sample index](../samples/README.md).

CI runs desktop tests through Xvfb on `ubuntu-24.04`. Action revisions, Node 24 LTS, VS Code, and development dependencies are pinned. Failure diagnostics include hidden ExTester screenshots and logs.

## Commit contract

Squash PRs so the resulting `main` commit has a Conventional Commit title and a useful description. Commitlint checks the actual commits after merge, immediately before release.

| Message | Release |
| --- | --- |
| `fix(theme): ...` | Patch |
| `feat(theme): ...` | Minor |
| `type(scope)!: ...` plus `BREAKING CHANGE: ...` | Major |
| `docs`, `test`, `ci`, `chore`, ordinary `refactor` | None |

Breaking changes require both `!` in the title and a nonempty `BREAKING CHANGE:` footer. Descriptions may use normal prose; semantic-release uses the title and breaking footer to determine the release.

Release commit linting starts at the latest verified release tag, so legacy history before `v0.2.1` is not re-linted. The verified `v0.2.1` tag and Open VSX package both correspond to commit `d5b6fc8`.

## Release

`.github/workflows/release.yml` starts on each push to `main`, which is protected by the required pull request checks. It uses full history, verifies the release history, lints commits since the latest release tag, and runs semantic-release under Xvfb because the prepare step repeats package and UI tests on the versioned artifact.

Plugins run in this order:

1. Analyze commits and generate release notes.
2. Update `CHANGELOG.md`, `package.json`, and `package-lock.json`.
3. Build, test, checksum, and publish `dist/lumen-themes.vsix` to Open VSX and the Visual Studio Marketplace.
4. Commit release metadata and create a GitHub release with the same VSIX and checksum.

Only the release job receives credentials:

```yaml
GH_TOKEN: ${{ secrets.GH_TOKEN }}
OVSX_PAT: ${{ secrets.OPEN_VSX_TOKEN }}
VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

`GH_TOKEN` writes the release commit, tag, and GitHub release. `OVSX_PAT` authenticates the Open VSX CLI. Token values never belong in repository files.
`VSCE_PAT` authenticates the Visual Studio Marketplace CLI. Token values never belong in repository files.

## References

- [semantic-release](https://www.npmjs.com/package/semantic-release) and [GitHub Actions guidance](https://semantic-release.gitbook.io/semantic-release/recipes/ci-configurations/github-actions)
- [VS Code extension testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension) and [continuous integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [ExTester](https://github.com/redhat-developer/vscode-extension-tester)
- [commitlint](https://commitlint.js.org/reference/configuration.html)
- [Open VSX publishing](https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions)
