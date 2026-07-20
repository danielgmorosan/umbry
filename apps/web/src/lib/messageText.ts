// Strip message markdown to clean, readable plain text for copying.
//
// Messages are stored as raw markdown (**bold**, *italic*, `code`,
// @[Name](gossip1…) mentions, ```fenced``` blocks). Copying that verbatim pastes
// ugly literal syntax elsewhere. This converts it to what the eye actually reads.

export function toPlainText(md: string): string {
  return md
    // Fenced code blocks → the inner code (drop the ``` and language tag).
    .replace(/```[a-z0-9]*\n?([\s\S]*?)```/gi, (_m, code) => String(code).replace(/\n$/, ""))
    // Mentions @[Name](id) → @Name
    .replace(/@\[([^\]]+)\]\([^)]*\)/g, "@$1")
    // Inline code `x` → x
    .replace(/`([^`]+)`/g, "$1")
    // Bold **x** → x
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    // Italic *x* → x
    .replace(/\*([^*\n]+)\*/g, "$1")
    // Italic _x_ → x (word-bounded so it doesn't eat snake_case / URLs)
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$|[.,!?])/g, "$1$2")
    .trim();
}
