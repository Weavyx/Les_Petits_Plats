export class TextUtils {
  /**
   * Normalise un texte en supprimant les accents, les caractères spéciaux et les espaces multiples.
   *
   * @param {string} text - Le texte à normaliser.
   * @returns {string} Le texte normalisé.
   */
  static normalizeText(text) {
    let result = "";
    let lower = text.toLowerCase();
    let normalized = lower.normalize("NFD");
    let noDiacritics = "";
    for (let i = 0; i < normalized.length; i++) {
      let char = normalized[i];
      let code = normalized.charCodeAt(i);
      if (code < 0x300 || code > 0x036f) {
        noDiacritics += char;
      }
    }
    let noSpecial = "";
    for (let i = 0; i < noDiacritics.length; i++) {
      let char = noDiacritics[i];
      let code = noDiacritics.charCodeAt(i);
      if (
        (code >= 97 && code <= 122) ||
        (code >= 48 && code <= 57) ||
        code === 32
      ) {
        noSpecial += char;
      }
    }
    // Réduire les espaces multiples à un seul espace
    let trimmed = "";
    let lastWasSpace = false;
    for (let i = 0; i < noSpecial.length; i++) {
      let char = noSpecial[i];
      if (char === " ") {
        if (!lastWasSpace) {
          trimmed += char;
          lastWasSpace = true;
        }
      } else {
        trimmed += char;
        lastWasSpace = false;
      }
    }
    result = trimmed.trim();
    return result;
  }

  /**
   * Utilitaire pour factoriser la tokenisation d'une recherche.
   * @param {string} text
   * @returns {{tokensWithSpaces: string[], tokens: string[]}}
   */
  static processTokens(text) {
    // tokensWithSpaces : découpe le texte en conservant les espaces à la fin de chaque token
    let tokensWithSpaces = [];
    let current = "";
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      current += char;
      if (char === " ") {
        tokensWithSpaces.push(current);
        current = "";
      }
    }
    if (current.length > 0) {
      tokensWithSpaces.push(current);
    }
    // tokens : texte normalisé puis découpé par espace unique
    let normalizedText = TextUtils.normalizeText(text);
    let tokens = [];
    let token = "";
    for (let i = 0; i < normalizedText.length; i++) {
      let char = normalizedText[i];
      if (char === " ") {
        if (token.length > 0) {
          tokens.push(token);
          token = "";
        }
      } else {
        token += char;
      }
    }
    if (token.length > 0) {
      tokens.push(token);
    }
    return { tokensWithSpaces, tokens };
  }
}
