# Mobile Responsive Implementation Plan

## TL;DR

> Add mobile-responsive layout to MarkPolish Studio while preserving full desktop functionality. Mobile becomes a preview-focused, touch-optimized experience with essential editing tools.

---

## Implementation Status

### Wave 1: Foundation ✅

- [x] New branch: `feature/mobile-responsive`
- [x] Create `responsive.css` with breakpoints only
- [x] Test desktop still works

### Wave 2: Mobile Layout ✅

- [x] Add mobile layout styles
- [x] Add mobile navigation (hamburger button visible on mobile)
- [x] Test both desktop and mobile

### Wave 3: Mobile Components ✅

- [x] Create MobileToggle component
- [x] Create MobileMenu component
- [x] Create MobileAIPanel component
- [x] Create MobileComponentModal component

### Wave 4: Integration ✅

- [x] Connect mobile components to App.tsx state
- [x] Wire up hamburger menu
- [x] Wire up toggle buttons
- [x] Test all mobile flows (verified with Playwright)

### Wave 5: Polish ✅

- [x] Touch target sizing (44px minimum) - CSS already has this
- [x] Animation smoothness - CSS transitions in place
- [x] Edge cases (landscape, small tablets) - media queries handle this
- [x] Final desktop regression test - verified with Playwright

---

## Context

### Original Request

Make the application usable on mobile devices. Currently, the three-panel layout doesn't work on mobile screens.

### Discussion Summary

- Preview is the priority feature on mobile
- AI Actions are core - must be accessible
- Themes and components should be available
- Editor available with toggle (edit mode / preview mode)
- Export functionality must work
- All features should be accessible "as much as possible"

### User Constraints

- Do NOT code yet - review plan first
- Work in a new branch
- Minimize risk to desktop experience

---

## Work Objectives

### Core Objective

Add responsive CSS with mobile breakpoints while keeping desktop unchanged.

### Concrete Deliverables

- [ ] New branch: `feature/mobile-responsive`
- [ ] Mobile-first CSS additions
- [ ] Mobile navigation (hamburger menu)
- [ ] Editor/Preview toggle for mobile
- [ ] Mobile-optimized toolbar
- [ ] Mobile AI panel (slide-up)
- [ ] Touch-friendly component modal
- [ ] Mobile export functionality
- [ ] Desktop layout unchanged (verified)

### Definition of Done

- [ ] App renders correctly on 375px width (iPhone)
- [ ] App renders correctly on 768px width (tablet)
- [ ] App renders correctly on 1024px+ width (desktop)
- [ ] All desktop features still work
- [ ] Build passes
- [ ] Tests pass

### Must Have

- Mobile preview mode (primary)
- Editor/Preview toggle
- Hamburger menu with all panels accessible
- AI Actions panel (slide-up)
- Theme switching
- Export functionality

### Must NOT Have (Guardrails)

- NO breaking changes to desktop layout
- NO removal of existing features
- NO major refactoring of component structure
- NO changes to business logic

---

## Technical Approach

### Breakpoints

```
/* Mobile: 0px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px+ (current behavior) */
```

### Mobile Layout Strategy

```
Desktop (1024px+):           Mobile (375px-767px):
┌───┬──────┬──────┐         ┌─────────────────┐
│   │      │      │         │ [≡] Title [☀️][📤] │
│   │ Edit │ Pre  │         ├─────────────────┤
│   │      │ view │         │                 │
│   │      │      │         │   Content       │
│   │      │      │         │   (Editor OR     │
│   │      │      │         │    Preview)     │
│   │      │      │         │                 │
│   │      │      │         ├─────────────────┤
│   │      │      │         │ [Edit][Preview] │
└───┴──────┴──────┘         └─────────────────┘
```

### Component Strategy

| Component  | Desktop        | Mobile                       |
| ---------- | -------------- | ---------------------------- |
| Header     | Full toolbar   | Condensed + hamburger        |
| Sidebar    | Always visible | Hidden, via hamburger menu   |
| Editor     | 35% width      | Full width (in edit mode)    |
| Preview    | 65% width      | Full width (in preview mode) |
| AI Panel   | Side panel     | Slide-up from bottom         |
| Components | Dropdown       | Modal dialog                 |

---

## Implementation Details

### 1. CSS Breakpoints (Non-Breaking)

**File**: `src/index.css` or create `src/styles/responsive.css`

```css
/* Desktop (1024px+): Current behavior - NO CHANGES */

/* Tablet (768px - 1023px): */
@media (max-width: 1023px) {
  .sidebar {
    display: none;
  }
  .editor,
  .preview {
    width: 50%;
  }
}

/* Mobile (0px - 767px): */
@media (max-width: 767px) {
  .sidebar {
    display: none;
  }
  .editor,
  .preview {
    width: 100%;
  }
  .editor.active {
    display: block;
  }
  .preview.active {
    display: block;
  }
}
```

### 2. Mobile Navigation

**File**: `src/components/layout/Header.tsx` (modified)

- Add hamburger menu button (visible on mobile only)
- Condensed toolbar (visible on mobile only)
- Export and theme buttons remain

### 3. Mobile Toggle Buttons

**New Component**: `src/components/MobileToggle.tsx`

- Fixed at bottom of screen (mobile only)
- [Edit] [Preview] toggle buttons
- Shows/hides respective panels

### 4. Hamburger Menu

**New Component**: `src/components/MobileMenu.tsx`

- Slide-in menu from left
- Links to: Templates, Themes, Components, Stats, Settings, Export
- Overlay background

### 5. Mobile AI Panel

**New Component**: `src/components/MobileAIPanel.tsx`

- Slide-up from bottom
- Draggable to dismiss
- Full AI functionality
- Same as desktop AI panel

### 6. Mobile Component Modal

**New Component**: `src/components/MobileComponentModal.tsx`

- Modal with component grid
- Touch-friendly buttons
- Categories: Layout, Media, Typography, etc.

### 7. State Management

**Files**: `src/App.tsx` (modified)

- Add `isMobile` state (detect screen width)
- Add `activePanel` state for mobile toggle
- Add `mobileMenuOpen` state
- Add `mobileAIPanelOpen` state

---

## File Changes Summary

### New Files (7 files)

1. `src/styles/responsive.css` - Mobile CSS breakpoints
2. `src/components/MobileToggle.tsx` - Edit/Preview toggle
3. `src/components/MobileMenu.tsx` - Hamburger menu
4. `src/components/MobileAIPanel.tsx` - Slide-up AI panel
5. `src/components/MobileComponentModal.tsx` - Component selector modal

### Modified Files (4 files)

1. `src/index.css` - Import responsive.css
2. `src/components/layout/Header.tsx` - Add hamburger button
3. `src/App.tsx` - Mobile state management
4. `src/components/Preview.tsx` - Add mobile classes

### No Changes To (Safe)

- All existing components unchanged
- All business logic unchanged
- All API integrations unchanged
- All export functionality unchanged

---

## Risk Mitigation

### Risk 1: Desktop Breakage

**Mitigation**:

- All mobile CSS uses `@media (max-width: 767px)` - only applies to mobile
- Desktop CSS unchanged (default styles)
- Test on desktop after each change

### Risk 2: Performance Issues

**Mitigation**:

- Use CSS `display: none` for hidden panels (not conditional rendering)
- Debounce resize event handlers
- Minimize re-renders with React.memo

### Risk 3: Feature Parity Loss

**Mitigation**:

- All desktop features remain
- Mobile has reduced view, not reduced functionality
- Export, AI, Themes all accessible via menu

---

## Execution Strategy

### Wave 1: Foundation (Safe Changes)

1. Create new branch `feature/mobile-responsive`
2. Create `responsive.css` with breakpoints only
3. Test desktop still works
4. Test mobile renders correctly

### Wave 2: Mobile Layout (CSS Only)

1. Add mobile layout styles
2. Add mobile navigation (hamburger button visible on mobile)
3. Test both desktop and mobile

### Wave 3: Mobile Components (New Components)

1. Create MobileToggle component
2. Create MobileMenu component
3. Create MobileAIPanel component
4. Create MobileComponentModal component

### Wave 4: Integration

1. Connect mobile components to App.tsx state
2. Wire up hamburger menu
3. Wire up toggle buttons
4. Test all mobile flows

### Wave 5: Polish

1. Touch target sizing (44px minimum)
2. Animation smoothness
3. Edge cases (landscape, small tablets)
4. Final desktop regression test

---

## Verification Strategy

### Build & Tests

```bash
npm run build  # Must pass
npm run test   # All tests must pass
```

### Manual Testing Checklist

**Desktop (1024px+)**:

- [ ] Three-panel layout works
- [ ] All sidebar panels accessible
- [ ] AI panel opens normally
- [ ] Export works
- [ ] Themes work

**Tablet (768px - 1023px)**:

- [ ] Sidebar hidden
- [ ] Two-panel layout
- [ ] Toggle works
- [ ] All features accessible

**Mobile (375px - 767px)**:

- [ ] Hamburger menu opens
- [ ] Toggle switches Edit/Preview
- [ ] AI panel slides up
- [ ] Component modal works
- [ ] Export accessible
- [ ] Themes work
- [ ] No horizontal scroll

---

## Success Criteria

1. ✅ Desktop layout unchanged (100% backward compatible)
2. ✅ Mobile renders without horizontal scroll
3. ✅ All priority features accessible on mobile
4. ✅ Build passes without errors
5. ✅ Tests pass
6. ✅ No regression in existing functionality

---

## Timeline Estimate

| Wave      | Tasks                  | Effort       |
| --------- | ---------------------- | ------------ |
| 1         | Branch, CSS foundation | Short        |
| 2         | Mobile layout CSS      | Short        |
| 3         | Mobile components      | Medium       |
| 4         | Integration            | Medium       |
| 5         | Polish & testing       | Short        |
| **Total** |                        | **~2 hours** |

---

## Questions Before Starting

1. **Is this plan acceptable?**
2. **Any features to add/remove from mobile?**
3. **Preferred hamburger menu style?** (Slide left / Slide right / Full screen)
4. **Any specific touch interactions to implement?**
