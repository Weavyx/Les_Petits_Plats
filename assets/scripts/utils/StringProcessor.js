/**
 * Utilitaire de traitement de texte pour la normalisation et la tokenisation.
 * Optimisé avec des mécanismes de cache pour les opérations fréquentes.
 */
export class StringProcessor {
  // Cache pour éviter de recalculer la normalisation
  static _normalizeCache = new Map();
  static _processTokensCache = new Map();

  /**
   * Normalise un texte en supprimant les accents, les caractères spéciaux et les espaces multiples.
   * @param {string} text - Le texte à normaliser.
   * @returns {string} Le texte normalisé.
   */ static normalizeText(text) {
    if (!text || typeof text !== "string") return "";

    // Vérifier le cache d'abord
    if (StringProcessor._normalizeCache.has(text)) {
      return StringProcessor._normalizeCache.get(text);
    }

    const normalized = text
      .toLowerCase()
      .normalize("NFD") // enlève les accents
      .replace(/[\u0300-\u036f]/g, "") // caractères diacritiques
      .replace(/[^a-z0-9\s]/g, "") // ponctuation, symboles
      .replace(/\s+/g, " ") // espaces multiples
      .trim(); // Limiter la taille du cache pour éviter les fuites mémoire
    if (StringProcessor._normalizeCache.size > 1000) {
      StringProcessor._normalizeCache.clear();
    }

    StringProcessor._normalizeCache.set(text, normalized);
    return normalized;
  }

  /**
   * Utilitaire pour factoriser la tokenisation d'une recherche.
   * @param {string} text
   * @returns {{tokensWithSpaces: string[], tokens: string[]}}
   */ static processTokens(text) {
    if (!text) return { tokensWithSpaces: [], tokens: [] };

    // Vérifier le cache
    if (StringProcessor._processTokensCache.has(text)) {
      return StringProcessor._processTokensCache.get(text);
    }

    const tokensWithSpaces = text.match(/[^ ]+ ?/g) || [];
    const normalizedText = StringProcessor.normalizeText(text);
    const tokens = normalizedText
      ? normalizedText.split(" ").filter(Boolean)
      : [];

    const result = { tokensWithSpaces, tokens };

    // Limiter la taille du cache
    if (StringProcessor._processTokensCache.size > 500) {
      StringProcessor._processTokensCache.clear();
    }

    StringProcessor._processTokensCache.set(text, result);
    return result;
  }

  /**
   * Nettoie les caches pour libérer la mémoire si nécessaire
   */
  static clearCaches() {
    this._normalizeCache.clear();
    this._processTokensCache.clear();
  }
}
