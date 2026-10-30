# UI/UX & Accessibility Portfolio Demo

**Standalone demonstration project** for showcasing front-end implementation and accessibility-aware design. This was created as a portfolio sample; it is **not client code, not an NCDOT/Iowa project, and not a certified WCAG-compliant product**. All services/data are fictional.

## Open the demo

Download or open [index.html](index.html) in a modern web browser. No build tools or dependencies are required.

## Front-end and UI/UX work demonstrated

- Responsive desktop/mobile layout with CSS Grid and media queries
- Consistent visual hierarchy, navigation, cards, search controls, and accessible interaction states
- Client-side keyword and category filtering using vanilla JavaScript
- Basic reusable service data rendering

## Accessibility techniques implemented

- Semantic headings, `main`, `nav`, `section`, `article`, and `form`
- Keyboard-accessible native controls and a visible focus indicator
- Skip-to-content link
- Form labels and descriptive help text using `aria-describedby`
- `role="status"` and `aria-live="polite"` to announce search-result counts
- Mobile-responsive layout and no mouse-only interactions

## Validation / limitations

Manual keyboard testing, screen reader testing (NVDA/JAWS), automated axe checks, color-contrast measurement, and WCAG 2.1 AA audit should be completed before asserting conformance. No automated audit or certification is claimed here.

## Positioning for recruiters

Sample front-end source code showing UI/UX and accessibility-oriented implementation. For evidence of actual client delivery, use approved and sanitized examples from projects you personally worked on. Never upload employer-owned or sensitive application code.
