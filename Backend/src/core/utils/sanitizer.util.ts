import sanitizeHtml from 'sanitize-html';

/**
 * Configure allowed tags and attributes for sanitization
 * More strict than default to prevent XSS
 */
const SANITIZE_OPTIONS = {
  allowedTags: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'img'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'style'] // Allow class and basic style, but be careful
  },
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false
};

/**
 * Sanitize user input to prevent XSS
 * @param input The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;
  return sanitizeHtml(input, SANITIZE_OPTIONS);
}

/**
 * Strip all HTML tags from input (for plain text fields)
 * @param input The string to sanitize
 * @returns The sanitized string with no HTML tags
 */
export function stripHtml(input: string): string {
  if (!input) return input;
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
}
