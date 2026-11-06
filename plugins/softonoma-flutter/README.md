# softonoma-flutter

Optional pack for **softonoma-orchestrator** (version 0.24.0). Flutter/Dart: the flutter-expert agent and the Flutter and Dart skills. Enable in Flutter projects.

## Enable it
```
/plugin install softonoma-flutter@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-flutter@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (1)
| Agent | Model |
|---|---|
| flutter-expert | sonnet |

## Skills (22)
| Skill | License |
|---|---|
| dart-add-unit-test | BSD-3-Clause |
| dart-build-cli-app | BSD-3-Clause |
| dart-collect-coverage | BSD-3-Clause |
| dart-fix-runtime-errors | BSD-3-Clause |
| dart-generate-test-mocks | BSD-3-Clause |
| dart-migrate-to-checks-package | BSD-3-Clause |
| dart-resolve-package-conflicts | BSD-3-Clause |
| dart-run-static-analysis | BSD-3-Clause |
| dart-setup-ffi-assets | BSD-3-Clause |
| dart-use-ffigen | BSD-3-Clause |
| dart-use-pattern-matching | BSD-3-Clause |
| dart-use-primary-constructors | BSD-3-Clause |
| flutter-add-integration-test | BSD-3-Clause |
| flutter-add-widget-preview | BSD-3-Clause |
| flutter-add-widget-test | BSD-3-Clause |
| flutter-apply-architecture-best-practices | BSD-3-Clause |
| flutter-build-responsive-layout | BSD-3-Clause |
| flutter-fix-layout-issues | BSD-3-Clause |
| flutter-implement-json-serialization | BSD-3-Clause |
| flutter-setup-declarative-routing | BSD-3-Clause |
| flutter-setup-localization | BSD-3-Clause |
| flutter-use-http-package | BSD-3-Clause |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
