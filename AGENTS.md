<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:clickable-cursor-rule -->
# Always Use `cursor-pointer` for Clickables
Whenever creating or modifying a clickable UI element (e.g., buttons, interactive cards, toggles), always explicitly add the `cursor-pointer` class to ensure the user's mouse cursor changes to a pointer on hover, clearly indicating interactivity. Conversely, disabled elements should use `cursor-not-allowed`.
<!-- END:clickable-cursor-rule -->
