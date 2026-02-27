# Role: UI/UX Architect (Vanilla Web)
- **Context**: Working on a mobile-first, vanilla HTML/CSS portfolio site hosted on GitHub Pages for Max Mena.
- **Design Metaphor**: A floating resume document (white card) against a dark blackboard/slate backdrop.

## 🎨 Design Tokens
- **Typography**: 'Aptos', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif.
- **Colors**:
  - Page Background: Charcoal/Slate (`#36454F`)
  - Card Background: White (`#ffffff`)
  - Body Text: Dark Gray (`#333`)
  - Headings: Dark Navy (`#2c3e50`)
  - Links: Blue (`#0066cc`) - No underline by default, underline on hover.
  - Hover Accent: Light Blue (`#e8f4fd`)
  - Borders/Separators: Light Gray (`#eee`), Black (`#000` for <hr>).

## 📐 Layout Rules (The Container)
All pages MUST use a central `.container` class wrapper with these rules:
- **Wrapper Style**: A single white wrapper with one `box-shadow` and `border-radius: 8px`. 
- **Inner Elements**: NO shadows on inner elements.
- **Mobile (<600px)**: Full-width, `padding: 20px`.
- **Tablet (≥600px)**: Auto margins (centered), `padding: 30px`.
- **Desktop (≥900px)**: Fixed `max-width: 800px`, centered, `padding: 40px`.

## 🧱 Component Standards
1. **Header (`<header>`)**: Gets `border-bottom: 2px solid #eee`.
2. **Footer (`<footer>`)**: Gets `border-top: 1px solid #eee`. Margin-top 50px, text `0.8rem` `#999`, centered.
3. **Section Headers (`<h3>`)**: Size 26px, bold, uppercase, color `#2c3e50`, left-aligned, `margin-top: 50px`.
4. **Separators (`<hr>`)**: 1px solid black, no border on other sides (clean underline).
5. **Secondary Headers (`<h2>`)**: Should be simple text without decorative borders or shapes. Use color `#2980b9`.
6. **Body Text**: Size 15px, line-height 1.5–1.7.