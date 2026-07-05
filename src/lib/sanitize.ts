const dangerousTags = /<\/?(script|style|iframe|object|embed|link|meta)[^>]*>/gi;
const eventAttributes = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const dangerousProtocols = /\s+(href|src)\s*=\s*("|')?\s*(javascript:|data:text\/html)/gi;

export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";
  return html
    .replace(dangerousTags, "")
    .replace(eventAttributes, "")
    .replace(dangerousProtocols, " $1=\"#");
}

export function sanitizeText(text: string): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol) ? url : "";
  } catch {
    return "";
  }
}
