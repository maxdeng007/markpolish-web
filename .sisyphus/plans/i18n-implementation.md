# i18n Implementation Plan - English/Chinese Language Support

## TL;DR

> **Quick Summary**: Add internationalization (i18n) support with English (default) and Chinese language options. Users can switch languages via header button.

> **Deliverables**:
>
> - `src/locales/en.ts` - English translations
> - `src/locales/zh.ts` - Chinese translations
> - `src/hooks/useTranslation.ts` - Translation hook with localStorage persistence
> - Updated Header with language switcher button
> - All UI components using translation hook
> - Template names/descriptions translated

> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Locales → Hook → Header → Components

---

## Context

### Original Request

User's Chinese clients cannot use the tool in English. Need English/中文 language switch for different clients.

### Requirements Confirmed

1. **Scope**: UI + Template names/descriptions
2. **Default**: English
3. **Switcher location**: Header (top right), beside theme toggle
4. **Persistence**: localStorage
5. **Architecture**: Easy to add future languages (Japanese, Korean, etc.)

---

## Work Objectives

### Core Objective

Implement full i18n support with English/Chinese language switching that persists across sessions.

### Concrete Deliverables

- `src/locales/en.ts` - All English UI strings
- `src/locales/zh.ts` - All Chinese UI strings
- `src/hooks/useTranslation.ts` - Translation context and hook
- Language switcher button in Header (En/中文 toggle)
- All components translated using hook

### Definition of Done

- [ ] Language switcher visible in header
- [ ] Clicking switch toggles between En/中文
- [ ] All UI text changes on language switch
- [ ] Language preference persists after page refresh
- [ ] Build passes with no errors

### Must Have

- English as default language
- Chinese translations for ALL UI text
- localStorage persistence
- Header switcher button

### Must NOT Have

- Translation of user-generated markdown content
- Translation of AI responses
- Mixed language in same UI (all-or-nothing per session)

---

## Verification Strategy

### QA Policy

Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/`.

**QA Scenarios (manual verification after implementation)**:

```
Scenario: Language switch to Chinese
  Steps:
    1. Open app in browser
    2. Verify default language is English (check "AI Assistant", "Templates", etc.)
    3. Click language toggle in header
    4. Verify all text changes to Chinese
    5. Refresh page
    6. Verify Chinese persists
Expected Result: All UI text in Chinese after switch, persists after refresh

Scenario: Language switch back to English
  Steps:
    1. With Chinese language active
    2. Click language toggle in header
    3. Verify all text changes to English
Expected Result: All UI text in English after switch

Scenario: Template panel translations
  Steps:
    1. Switch to Chinese
    2. Navigate to Templates panel
    3. Verify template names and descriptions are in Chinese
Expected Result: "快速开始模板", "博客文章", etc.
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation - must complete first):
├── Task 1: Create locales/en.ts (all English strings)
├── Task 2: Create locales/zh.ts (all Chinese strings)
└── Task 3: Create useTranslation hook with persistence

Wave 2 (Integration - depends on Wave 1):
├── Task 4: Update App.tsx with TranslationProvider
├── Task 5: Add language switcher to Header
└── Task 6: Translate AIPanel component

Wave 3 (Component Translation - parallel):
├── Task 7: Translate TemplatesPanel
├── Task 8: Translate ComponentsPanel
├── Task 9: Translate ThemesPanel
├── Task 10: Translate StatsPanel
├── Task 11: Translate LintPanel
├── Task 12: Translate ProjectManager
├── Task 13: Translate ImageLibraryPanel
├── Task 14: Translate AIImagePanel
├── Task 15: Translate SettingsModal
└── Task 16: Translate remaining components (Toolbar, ErrorBoundary, etc.)

Wave FINAL (Verification):
├── Task F1: Build and verify no errors
├── Task F2: Manual QA - language switching works
└── Task F3: Verify all components translated
```

### Dependency Matrix

- **Task 1**: — — 3, 2
- **Task 2**: — — 3, 1
- **Task 3**: 1, 2 — 4, 5, 6, 7-16
- **Task 4**: 3 — —
- **Task 5**: 3 — —
- **Task 6**: 3 — —
- **Tasks 7-16**: 3 — —
- **Tasks F1-F3**: Tasks 4-16 — —

---

## TODOs

- [ ] 1. Create src/locales/en.ts - All English UI strings

  **What to do**:
  - Create directory `src/locales/`
  - Create `en.ts` with complete English translations
  - Structure: nested by component (common, header, sidebar, ai, templates, etc.)
  - Include ALL UI strings from all components

  **References**:
  - `src/components/AIPanel.tsx` - AI panel strings
  - `src/components/TemplatesPanel.tsx` - Template panel strings
  - `src/components/ComponentsPanel.tsx` - Components panel strings
  - `src/components/ThemesPanel.tsx` - Themes panel strings
  - `src/components/SettingsModal.tsx` - Settings strings
  - `src/components/ProjectManager.tsx` - Project strings
  - `src/components/ImageLibraryPanel.tsx` - Image library strings
  - `src/components/AIImagePanel.tsx` - AI image strings
  - `src/components/LintPanel.tsx` - Lint strings
  - `src/components/layout/Header.tsx` - Header strings
  - `src/components/layout/Sidebar.tsx` - Sidebar strings
  - `src/lib/templates.ts` - Template names/descriptions

  **Acceptance Criteria**:
  - [ ] File created at `src/locales/en.ts`
  - [ ] Exports `en` object with complete translations
  - [ ] All UI strings from all components included
  - [ ] Type-safe structure matching components

---

- [ ] 2. Create src/locales/zh.ts - All Chinese UI strings

  **What to do**:
  - Create `zh.ts` with complete Chinese translations
  - Match structure of `en.ts`
  - Translate ALL strings including template names/descriptions

  **References**:
  - Template from Task 1

  **Acceptance Criteria**:
  - [ ] File created at `src/locales/zh.ts`
  - [ ] Exports `zh` object with complete Chinese translations
  - [ ] All strings translated (no missing keys)
  - [ ] Proper Chinese characters throughout

---

- [ ] 3. Create src/hooks/useTranslation.ts - Translation hook

  **What to do**:
  - Create `useTranslation.ts` in `src/hooks/`
  - Define `Language` type: `'en' | 'zh'`
  - Create `TranslationContext` with:
    - `language: Language`
    - `setLanguage: (lang: Language) => void`
    - `t: (key: string) => string` - translation function
  - Implement localStorage persistence (key: `markpolish-language`)
  - Default to English if no saved preference
  - Create `useTranslation()` hook for components

  **References**:
  - `src/components/Toast.tsx` - Similar context pattern

  **Acceptance Criteria**:
  - [ ] Hook created at `src/hooks/useTranslation.ts`
  - [ ] `useTranslation()` hook exported
  - [ ] Language persists in localStorage
  - [ ] `t()` function works with nested keys (e.g., `t('ai.title')`)
  - [ ] Default language is English

---

- [ ] 4. Update App.tsx with TranslationProvider

  **What to do**:
  - Import `TranslationProvider` from hook
  - Wrap entire app with `TranslationProvider`
  - Add `LanguageSwitcher` component to header area

  **References**:
  - `src/App.tsx` - Current structure
  - `src/components/Toast.tsx` - Provider pattern to follow

  **Acceptance Criteria**:
  - [ ] App wrapped with TranslationProvider
  - [ ] No breaking changes to existing functionality

---

- [ ] 5. Add language switcher to Header

  **What to do**:
  - Create language toggle button component
  - Position: Top right, next to theme toggle button
  - Display: "En" or "中文" based on current language
  - Style: Match existing header buttons
  - Behavior: Toggle between En/中文 on click

  **References**:
  - `src/components/layout/Header.tsx` - Header structure
  - Existing toggle button styling for reference

  **Acceptance Criteria**:
  - [ ] Button visible in header top-right
  - [ ] Shows "En" when in Chinese mode, "中文" when in English mode
  - [ ] Clicking toggles language
  - [ ] Styled consistently with app theme

---

- [ ] 6. Translate AIPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Replace all hardcoded strings with `t('key')` calls
  - Strings to translate:
    - "AI Assistant" / "AI 操作"
    - "Provider" / "服务商"
    - "Model" / "模型"
    - "Configure AI Providers" / "配置 AI 服务商"
    - All button labels
    - All placeholders
    - Error messages
    - Result labels

  **References**:
  - `src/components/AIPanel.tsx`
  - `src/locales/en.ts` (from Task 1)

  **Acceptance Criteria**:
  - [ ] All text in AIPanel uses `t()` function
  - [ ] Chinese translation appears when language switched
  - [ ] No hardcoded English strings remaining

---

- [ ] 7. Translate TemplatesPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Replace all hardcoded strings
  - Template names/descriptions from locales (already in zh.ts)

  **References**:
  - `src/components/TemplatesPanel.tsx`
  - `src/locales/zh.ts` (template translations)

  **Acceptance Criteria**:
  - [ ] All UI text uses `t()` function
  - [ ] Template names/descriptions translated

---

- [ ] 8. Translate ComponentsPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate component names, descriptions, tooltips

  **References**:
  - `src/components/ComponentsPanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 9. Translate ThemesPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate panel title, category names

  **References**:
  - `src/components/ThemesPanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 10. Translate StatsPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate all stat labels

  **References**:
  - `src/components/StatsPanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 11. Translate LintPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate panel title, messages

  **References**:
  - `src/components/LintPanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 12. Translate ProjectManager component

  **What to do**:
  - Import `useTranslation` hook
  - Translate buttons, labels, placeholders, alerts

  **References**:
  - `src/components/ProjectManager.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 13. Translate ImageLibraryPanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate all UI strings

  **References**:
  - `src/components/ImageLibraryPanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 14. Translate AIImagePanel component

  **What to do**:
  - Import `useTranslation` hook
  - Translate all UI strings

  **References**:
  - `src/components/AIImagePanel.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 15. Translate SettingsModal component

  **What to do**:
  - Import `useTranslation` hook
  - Translate all settings labels, buttons, placeholders

  **References**:
  - `src/components/SettingsModal.tsx`

  **Acceptance Criteria**:
  - [ ] All text uses `t()` function

---

- [ ] 16. Translate remaining components

  **What to do**:
  - Translate any remaining components:
    - Toolbar (if has text)
    - ErrorBoundary messages
    - CompactStats
    - PDFExportModal
    - Other components with text

  **References**:
  - All component files with text

  **Acceptance Criteria**:
  - [ ] All components use `t()` function
  - [ ] No hardcoded strings anywhere

---

## Final Verification Wave

- [ ] F1. **Build Verification** — `unspecified-high`
      Run `npm run build` and verify no TypeScript errors.
      Output: `Build [PASS/FAIL]`

- [ ] F2. **Language Switch Test** — `unspecified-high`
      Start dev server, test language switching in browser.
  - Switch to Chinese, verify all text changes
  - Refresh, verify persistence
  - Switch back to English, verify all text changes

- [ ] F3. **Complete Coverage Check** — `quick`
      Grep for hardcoded strings - there should be none in UI.
      `grep -r "English word" src/components/` should return empty.

---

## Commit Strategy

- **Single commit**: `feat: Add i18n support with English/Chinese languages`

---

## Success Criteria

### Verification Commands

```bash
npm run build  # Should pass with no errors
npm run test  # All 57+ tests should pass
```

### Final Checklist

- [ ] Language switcher button visible in header
- [ ] Switching to Chinese translates ALL UI text
- [ ] Switching to English translates back to English
- [ ] Language preference persists in localStorage
- [ ] No hardcoded strings in any component
- [ ] Build passes without errors
