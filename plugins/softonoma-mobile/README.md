# softonoma-mobile

Optional pack for **softonoma-orchestrator** (version 0.25.1). Mobile specialists (iOS, React Native) and the full Expo/EAS/React Native skill set. Enable in React Native / Expo projects (the core mobile-dev agent and expo-react-native skill stay in the core).

## Enable it
```
/plugin install softonoma-mobile@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-mobile@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (2)
| Agent | Model |
|---|---|
| ios-developer | sonnet |
| mobile-developer | sonnet |

## Skills (22)
| Skill | License |
|---|---|
| assess-react-native-migration | MIT |
| create-react-native-library | MIT |
| eas-app-stores | MIT |
| eas-hosting | MIT |
| eas-update-insights | MIT |
| eas-workflows | MIT License |
| expo-brownfield | MIT |
| expo-data-fetching | MIT |
| expo-dev-client | MIT |
| expo-dom | MIT |
| expo-module | MIT |
| expo-native-ui | MIT |
| expo-project-structure | MIT |
| expo-router | MIT |
| expo-tailwind-setup | MIT |
| expo-upgrade | MIT |
| expo-web-to-native | MIT |
| react-native-best-practices | MIT |
| react-native-brownfield-migration | MIT |
| react-native-tv-best-practices | MIT |
| react-navigation | MIT |
| upgrading-react-native | MIT |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
