import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * This should be used for all user-generated content that will be displayed
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "ol", "ul", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "a", "blockquote", "code", "pre",
      "span", "div"
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover"],
  });
}

/**
 * Sanitizes plain text content
 * This removes any HTML tags and entities
 */
export function sanitizeText(text: string): string {
  if (typeof text !== "string") return "";
  
  // Remove HTML tags
  const sanitized = text.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  const textArea = document.createElement("textarea");
  textArea.innerHTML = sanitized;
  return textArea.value;
}

/**
 * Sanitizes user input for form fields
 * This is a more aggressive sanitization for names, emails, etc.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>]/g, "");
  
  return sanitized;
}

/**
 * Sanitizes URLs to prevent javascript: and other dangerous protocols
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== "string") return "";
  
  try {
    const parsed = new URL(url);
    
    // Only allow safe protocols
    const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return "";
    }
    
    return url;
  } catch {
    return "";
  }
}
