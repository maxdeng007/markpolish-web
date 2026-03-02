# Theme System Polish Plan

## TL;DR

> **Quick Summary**: Overhaul the theme system with 14 distinctive themes organized by Light/Dark categories, each with full component theming for callout, quote, tabs, and accordion.

> **Deliverables**:
>
> - 14 complete themes (8 light + 6 dark)
> - Categorized theme selection UI with Light/Dark sections
> - Full component theming for all custom components
> - Updated Theme interface with category field

> **Estimated Effort**: Large
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Interface Update → Themes → Panel UI

---

## Context

### Original Request

Polish the themes system:

1. Separate themes into light and dark categories
2. Light themes: minimum 6, up to 8
3. Dark themes: minimum 6
4. Each theme must be unique with distinctive character

### Interview Summary

**Key Discussions**:

- Theme names: User approved all 14 proposed names
- Component theming: Full theming for callout, quote, tabs, accordion in each theme
- No exclusions: Keep all 14 themes

**Current State**:

- 5 existing themes (4 light, 1 dark) in `src/lib/themes.ts`
- Flat list display in ThemesPanel
- No category metadata

### Theme Collection

**Light Themes (8)**:
| ID | Name | Character | Colors |
|----|------|-----------|--------|
| wechat-classic | WeChat Classic | Professional, trusted | White + Navy Blue |
| apple-minimalist | Apple Minimalist | Clean, modern | White + SF Blue |
| nordic-frost | Nordic Frost | Cool, calm | Snow white + Nord blue |
| elegant-serif | Elegant Serif | Sophisticated | Cream + Gold |
| warm-sunset | Warm Sunset | Cozy, inviting | Warm white + Orange |
| fresh-garden | Fresh Garden | Natural, organic | Mint green + Earth |
| tokyo-dawn | Tokyo Dawn | Vibrant, energetic | White + Sakura pink |
| newspaper | Newspaper | Classic, authoritative | Off-white + Black + Red |

**Dark Themes (6)**:
| ID | Name | Character | Colors |
|----|------|-----------|--------|
| midnight | Midnight | Pure dark | Deep black + Blue |
| dracula | Dracula | Vibrant, colorful | Dark purple + Green + Pink |
| tokyo-night | Tokyo Night | Japanese cyberpunk | Deep blue + Purple + Cyan |
| nord-dark | Nord Dark | Arctic, cool | Dark slate + Frost blue |
| monokai-pro | Monokai Pro | Code-inspired | Dark gray + Yellow + Pink |
| coffee | Coffee | Warm, cozy | Dark brown + Cream + Orange |

---

## Work Objectives

### Core Objective

Create a polished, professional theme system with 14 unique themes organized by light/dark categories, each with complete styling for all custom components.

### Concrete Deliverables

- Updated `Theme` interface with `category` field
- 14 theme definitions in `themes.ts`
- Redesigned ThemesPanel with Light/Dark sections
- Full component CSS for callout, quote, tabs, accordion in each theme

### Definition of Done

- [x] TypeScript compiles without errors
- [x] All 14 themes display correctly in ThemesPanel
- [x] Light and Dark sections are visually separated
- [x] Each theme renders all custom components with appropriate colors
- [x] Theme switching works without issues
- [x] All 14 themes display correctly in ThemesPanel
- [x] Light and Dark sections are visually separated
- [x] Each theme renders all custom components with appropriate colors
- [x] Theme switching works without issues
- [x] Light and Dark sections are visually separated
- [x] Each theme renders all custom components with appropriate colors
- [x] Theme switching works without issues
- [x] Each theme renders all custom components with appropriate colors
- [x] Theme switching works without issues
- [x] Theme switching works without issues

### Must Have

- 8 light themes with unique character
- 6 dark themes with unique character
- Category-based UI organization
- Full component theming per theme

### Must NOT Have (Guardrails)

- Do NOT break existing theme switching functionality
- Do NOT remove any existing theme content
- Do NOT add external dependencies
- Do NOT duplicate theme IDs

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (Vitest)
- **Automated tests**: Tests-after (focus on visual verification)
- **Framework**: Vitest

### QA Policy

Every task includes agent-executed QA scenarios via:

- **Frontend/UI**: Playwright - load app, switch themes, verify colors
- **TypeScript**: `npx tsc --noEmit` verification

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - 2 tasks):
├── Task 1: Update Theme interface + helper functions [quick]
└── Task 2: Redesign ThemesPanel with category sections [visual-engineering]

Wave 2 (Light Themes - 8 tasks, MAX PARALLEL):
├── Task 3: Light Theme - WeChat Classic (update) [visual-engineering]
├── Task 4: Light Theme - Apple Minimalist (update) [visual-engineering]
├── Task 5: Light Theme - Nordic Frost (update) [visual-engineering]
├── Task 6: Light Theme - Elegant Serif (update) [visual-engineering]
├── Task 7: Light Theme - Warm Sunset (new) [visual-engineering]
├── Task 8: Light Theme - Fresh Garden (new) [visual-engineering]
├── Task 9: Light Theme - Tokyo Dawn (new) [visual-engineering]
└── Task 10: Light Theme - Newspaper (new) [visual-engineering]

Wave 3 (Dark Themes - 6 tasks, MAX PARALLEL):
├── Task 11: Dark Theme - Midnight (rename + update) [visual-engineering]
├── Task 12: Dark Theme - Dracula (new) [visual-engineering]
├── Task 13: Dark Theme - Tokyo Night (new) [visual-engineering]
├── Task 14: Dark Theme - Nord Dark (new) [visual-engineering]
├── Task 15: Dark Theme - Monokai Pro (new) [visual-engineering]
└── Task 16: Dark Theme - Coffee (new) [visual-engineering]

Wave 4 (Verification - 1 task):
└── Task 17: Final verification + README update [quick]

Critical Path: Task 1 → Task 2 → Wave 2/3 (parallel) → Task 17
Parallel Speedup: ~80% faster than sequential
Max Concurrent: 8 (Waves 2 & 3)
```

### Dependency Matrix

- **1**: — → 2, 3-10, 11-16
- **2**: 1 — → 17
- **3-10**: 1 — → 17
- **11-16**: 1 — → 17
- **17**: 2, 3-10, 11-16 — END

### Agent Dispatch Summary

- **Wave 1**: 2 tasks — T1 → `quick`, T2 → `visual-engineering`
- **Wave 2**: 8 tasks — All `visual-engineering`
- **Wave 3**: 6 tasks — All `visual-engineering`
- **Wave 4**: 1 task — T17 → `quick`

---

## TODOs

### Wave 1: Foundation

- [x] 1. **Update Theme Interface and Helper Functions**
- [x] 2. **Redesign ThemesPanel with Category Sections**

  **What to do**:
  - Add `category: 'light' | 'dark'` field to Theme interface
  - Add `getLightThemes()` and `getDarkThemes()` helper functions
  - Update `getThemeList()` to maintain backward compatibility
  - Add JSDoc comments for new fields

  **Must NOT do**:
  - Do not remove existing Theme fields
  - Do not break existing theme references

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple TypeScript interface update
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (foundation task)
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: All theme tasks (3-16)
  - **Blocked By**: None

  **References**:
  - `src/lib/themes.ts:3-18` - Current Theme interface
  - `src/lib/themes.ts:295-301` - Current helper functions

  **Acceptance Criteria**:
  - [ ] Theme interface has `category` field
  - [ ] `getLightThemes()` returns only light themes
  - [ ] `getDarkThemes()` returns only dark themes
  - [ ] TypeScript compiles without errors

  **QA Scenarios**:
  ```
  Scenario: Interface update compiles correctly
    Tool: Bash
    Steps:
      1. Run `npx tsc --noEmit`
    Expected Result: Exit code 0, no errors
    Evidence: .sisyphus/evidence/task-01-tsc.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 2. **Redesign ThemesPanel with Category Sections**

  **What to do**:
  - Add section headers: "Light Themes" and "Dark Themes" with icons
  - Group themes by category using new helper functions
  - Add visual separator between sections
  - Maintain existing theme card design (color swatches, checkmark)

  **Must NOT do**:
  - Do not change existing theme selection logic
  - Do not remove color preview swatches

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI/UX component redesign
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 1 after interface update)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 17 (verification)
  - **Blocked By**: Task 1 (needs helper functions)

  **References**:
  - `src/components/ThemesPanel.tsx` - Current panel implementation
  - `src/components/ComponentsPanel.tsx` - Similar grid layout pattern

  **Acceptance Criteria**:
  - [ ] Two section headers visible (Light/Dark)
  - [ ] Light themes appear under Light section
  - [ ] Dark themes appear under Dark section
  - [ ] Theme selection still works
  - [ ] TypeScript compiles

  **Commit**: YES (with Task 1)
  - Message: `feat(themes): add category field and redesign theme panel`
  - Files: `src/lib/themes.ts`, `src/components/ThemesPanel.tsx`

---

### Wave 2: Light Themes

- [x] 3. **Light Theme - WeChat Classic (Update)**
- [x] 4. **Light Theme - Apple Minimalist (Update)**
- [x] 5. **Light Theme - Nordic Frost (Update)**
- [x] 6. **Light Theme - Elegant Serif (Update)**
- [x] 7. **Light Theme - Warm Sunset (New)**
- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Add `category: 'light'` and full component CSS. Use WeChat navy (#576b95).
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 4. **Light Theme - Apple Minimalist (Update)**
- [x] 5. **Light Theme - Nordic Frost (Update)**
- [x] 6. **Light Theme - Elegant Serif (Update)**
- [x] 7. **Light Theme - Warm Sunset (New)**
- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
  Add `category: 'light'` and full component CSS. Use SF Blue (#0071e3).
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 5. **Light Theme - Nordic Frost (Update)**
- [x] 6. **Light Theme - Elegant Serif (Update)**
- [x] 7. **Light Theme - Warm Sunset (New)**
- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Add `category: 'light'` and full component CSS. Use Nord blue (#5e81ac).
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 6. **Light Theme - Elegant Serif (Update)**
- [x] 7. **Light Theme - Warm Sunset (New)**
- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Add `category: 'light'` and full component CSS. Use gold accent (#c7a27c).
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 7. **Light Theme - Warm Sunset (New)**
- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Create new theme. Colors: Warm white (#fffbf5), Orange (#e07a38). Autumn vibes.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 8. **Light Theme - Fresh Garden (New)**
- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Create new theme. Colors: Mint green (#86c8bc), Earth brown. Natural, organic.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 9. **Light Theme - Tokyo Dawn (New)**
- [x] 10. **Light Theme - Newspaper (New)**
  Create new theme. Colors: Sakura pink (#ffb7c5). Japanese aesthetic.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 2

- [x] 10. **Light Theme - Newspaper (New)**
  Create new theme. Colors: Off-white (#faf9f6), Black (#1a1a1a), Red (#c41e3a). Print journalism.
  **Category**: `visual-engineering` | **Commit**: YES (Wave 2)
  - Message: `feat(themes): add 8 light themes with full component styling`

---

### Wave 3: Dark Themes

- [x] 11. **Dark Theme - Midnight (Rename + Update)**
- [x] 12. **Dark Theme - Dracula (New)**
- [x] 13. **Dark Theme - Tokyo Night (New)**
- [x] 14. **Dark Theme - Nord Dark (New)**
- [x] 15. **Dark Theme - Monokai Pro (New)**
- [x] 16. **Dark Theme - Coffee (New)**
  Rename `dark-mode` to `midnight`. Add `category: 'dark'`. Pure dark aesthetic.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 3

- [x] 12. **Dark Theme - Dracula (New)**
- [x] 13. **Dark Theme - Tokyo Night (New)**
- [x] 14. **Dark Theme - Nord Dark (New)**
- [x] 15. **Dark Theme - Monokai Pro (New)**
- [x] 16. **Dark Theme - Coffee (New)**
  Create new theme. Colors: Background (#282a36), Green (#50fa7b), Pink (#ff79c6). Vibrant.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 3

- [x] 13. **Dark Theme - Tokyo Night (New)**
- [x] 14. **Dark Theme - Nord Dark (New)**
- [x] 15. **Dark Theme - Monokai Pro (New)**
- [x] 16. **Dark Theme - Coffee (New)**
  Create new theme. Colors: Background (#1a1b26), Purple (#bb9af7), Cyan (#7dcfff). Cyberpunk.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 3

- [x] 14. **Dark Theme - Nord Dark (New)**
- [x] 15. **Dark Theme - Monokai Pro (New)**
- [x] 16. **Dark Theme - Coffee (New)**
  Create new theme. Colors: Polar Night (#2e3440), Frost (#88c0d0). Arctic, cool.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 3

- [x] 15. **Dark Theme - Monokai Pro (New)**
- [x] 16. **Dark Theme - Coffee (New)**
  Create new theme. Colors: Background (#2d2a2e), Yellow (#ffd866), Pink (#ff6188). Code editor.
  **Category**: `visual-engineering` | **Commit**: Groups with Wave 3

- [x] 16. **Dark Theme - Coffee (New)**
  Create new theme. Colors: Dark brown (#2c2418), Cream (#f5e6d3). Warm, cozy.
  **Category**: `visual-engineering` | **Commit**: YES (Wave 3)
  - Message: `feat(themes): add 6 dark themes with full component styling`

---

### Wave 4: Verification

- [x] 17. **Final Verification and Documentation**

  **What to do**:
  - Run TypeScript type check
  - Run test suite
  - Update README.md with new theme list organized by category
  - Verify all 14 themes appear in UI

  **Recommended Agent Profile**: `quick`
  **Parallelization**: Sequential (final task)
  **Blocked By**: All previous tasks

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test -- --run` passes
  - [ ] README lists all 14 themes with categories

  **Commit**: YES
  - Message: `docs: update README with new theme system`
  - Files: `README.md`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
- [x] F2. **Code Quality Review** — `unspecified-high`
- [x] F3. **Visual QA** — `unspecified-high` + `playwright`
- [x] F4. **Scope Fidelity Check** — `deep`
      Verify all 14 themes exist, each has category field, UI shows Light/Dark sections.

- [x] F2. **Code Quality Review** — `unspecified-high`
- [x] F3. **Visual QA** — `unspecified-high` + `playwright`
- [x] F4. **Scope Fidelity Check** — `deep`
      Run `tsc --noEmit`. Check for TypeScript errors. Verify theme switching works.

- [x] F3. **Visual QA** — `unspecified-high` + `playwright`
- [x] F4. **Scope Fidelity Check** — `deep`
      Load app, cycle through all 14 themes, verify each renders correctly with proper colors.

- [x] F4. **Scope Fidelity Check** — `deep`
      Verify no scope creep, no removed features, all requirements met.

---

## Commit Strategy

- **Wave 1**: `feat(themes): add category field and redesign theme panel`
- **Wave 2**: `feat(themes): add 8 light themes with full component styling`
- **Wave 3**: `feat(themes): add 6 dark themes with full component styling`
- **Wave 4**: `docs: update README with new theme system`

---

## Success Criteria

### Verification Commands

```bash
npx tsc --noEmit  # Expected: no errors
npm test -- --run # Expected: all tests pass
npm run dev       # Expected: app loads, theme switching works
```

### Final Checklist

- [x] 8 light themes with unique character
- [x] 6 dark themes with unique character
- [x] Light/Dark sections in ThemesPanel
- [x] All custom components styled per theme
- [x] TypeScript compiles
- [x] Tests pass
- [x] 6 dark themes with unique character
- [x] Light/Dark sections in ThemesPanel
- [x] All custom components styled per theme
- [x] TypeScript compiles
- [x] Tests pass
- [x] Light/Dark sections in ThemesPanel
- [x] All custom components styled per theme
- [x] TypeScript compiles
- [x] Tests pass
- [x] All custom components styled per theme
- [x] TypeScript compiles
- [x] Tests pass
- [x] TypeScript compiles
- [x] Tests pass
- [x] Tests pass
