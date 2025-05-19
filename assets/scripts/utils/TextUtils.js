export class TextUtils {
  /**
   * Normalise un texte en supprimant les accents, les caractères spéciaux et les espaces multiples.
   *
   * @param {string} text - Le texte à normaliser.
   * @returns {string} Le texte normalisé.
   */
  static normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFD") // enlève les accents
      .replace(/[\u0300-\u036f]/g, "") // caractères diacritiques
      .replace(/[^a-z0-9\s]/g, "") // ponctuation, symboles
      .replace(/\s+/g, " ") // espaces multiples
      .trim();
  }

  /**
   * Utilitaire pour factoriser la tokenisation d'une recherche.
   * @param {string} text
   * @returns {{tokensWithSpaces: string[], tokens: string[]}}
   */
  static processTokens(text) {
    const tokensWithSpaces = text.match(/[^ ]+ ?/g) || [];
    const normalizedText = TextUtils.normalizeText(text);
    const tokens = normalizedText.split(" ");
    return { tokensWithSpaces, tokens };
  }
}
