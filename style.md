# Swift Trust Bank - Design System

## Premium Color Palette

### Primary Colors
- **Deep Blue**: `#0A2463` - Primary brand color, trust and stability
- **Ocean Blue**: `#1E3A8A` - Interactive elements, buttons
- **Sky Blue**: `#3B82F6` - Links, accents
- **Light Blue**: `#DBEAFE` - Backgrounds, subtle highlights

### Secondary Colors
- **Emerald Green**: `#059669` - Success states, positive actions
- **Forest Green**: `#047857` - Success hover states
- **Mint**: `#D1FAE5` - Success backgrounds

### Accent Colors
- **Amber Gold**: `#F59E0B` - Warnings, important notices
- **Deep Gold**: `#D97706` - Hover states for warnings
- **Light Amber**: `#FEF3C7` - Warning backgrounds

### Error Colors
- **Crimson Red**: `#DC2626` - Errors, destructive actions
- **Deep Red**: `#B91C1C` - Error hover states
- **Light Red**: `#FEE2E2` - Error backgrounds

### Neutral Colors
- **Charcoal**: `#1F2937` - Primary text
- **Slate**: `#475569` - Secondary text
- **Gray**: `#64748B` - Tertiary text, disabled states
- **Light Gray**: `#E2E8F0` - Borders, dividers
- **Off White**: `#F8FAFC` - Background alternates
- **Pure White**: `#FFFFFF` - Main backgrounds

## Typography

### Font Family
- **Primary**: Inter, system-ui, -apple-system, sans-serif
- **Monospace**: 'Courier New', Courier, monospace (for account numbers)

### Font Sizes
- **Heading 1**: 32px / 2rem (Mobile: 28px / 1.75rem)
- **Heading 2**: 24px / 1.5rem (Mobile: 22px / 1.375rem)
- **Heading 3**: 20px / 1.25rem (Mobile: 18px / 1.125rem)
- **Body Large**: 18px / 1.125rem
- **Body**: 16px / 1rem
- **Body Small**: 14px / 0.875rem
- **Caption**: 12px / 0.75rem

### Line Heights
- **Headings**: 120%
- **Body**: 150%

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System (8px base)
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

## Border Radius
- **Small**: 4px - Input fields, small buttons
- **Medium**: 8px - Cards, larger buttons
- **Large**: 12px - Modals, containers
- **XL**: 16px - Hero sections
- **Full**: 9999px - Pill buttons, avatars

## Shadows
- **Small**: 0 1px 3px rgba(0, 0, 0, 0.12)
- **Medium**: 0 4px 6px rgba(0, 0, 0, 0.1)
- **Large**: 0 10px 25px rgba(0, 0, 0, 0.15)
- **XL**: 0 20px 40px rgba(0, 0, 0, 0.2)

## Component Styles

### Buttons
- **Primary**: Deep Blue background, white text, medium border radius
- **Secondary**: White background, Deep Blue border and text
- **Success**: Emerald Green background, white text
- **Danger**: Crimson Red background, white text
- **Padding**: 12px 24px (mobile: 10px 20px)
- **Hover**: Slightly darker shade with subtle shadow

### Input Fields
- **Border**: 1px solid Light Gray
- **Focus**: 2px solid Sky Blue
- **Padding**: 12px 16px
- **Border Radius**: Small (4px)
- **Background**: Pure White
- **Error State**: 2px solid Crimson Red

### Cards
- **Background**: Pure White
- **Border**: 1px solid Light Gray
- **Border Radius**: Medium (8px)
- **Shadow**: Small
- **Padding**: 24px (mobile: 16px)
- **Hover**: Medium shadow transition

### Transaction Items
- **Background**: Pure White
- **Border Bottom**: 1px solid Light Gray
- **Padding**: 16px
- **Hover**: Off White background

## Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## Design Principles

### Mobile First
- All designs start with mobile viewports
- Progressive enhancement for larger screens
- Touch-friendly tap targets (minimum 44px)
- Readable text without zooming

### Visual Hierarchy
- Clear distinction between primary and secondary actions
- Important information uses larger, bolder typography
- Strategic use of color to guide attention
- Consistent spacing to create visual groupings

### Accessibility
- WCAG AA contrast ratios minimum
- Focus states visible on all interactive elements
- Proper semantic HTML
- Screen reader friendly labels

### Animations
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: cubic-bezier(0.4, 0.0, 0.2, 1) for most animations
- **Usage**: Button hovers, modal appearances, page transitions
- Respects prefers-reduced-motion

### White Space
- Generous padding around content areas
- Consistent margins between sections
- Breathing room improves readability and reduces cognitive load

## Status Colors
- **Pending**: Amber Gold
- **Completed**: Emerald Green
- **Failed**: Crimson Red
- **Disputed**: Deep Blue
