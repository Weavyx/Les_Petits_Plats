/**
 * Gestionnaire de templates avec cache pour éviter les recomputations
 */
export class TemplateCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 200;
  }

  static getInstance() {
    if (!TemplateCache.instance) {
      TemplateCache.instance = new TemplateCache();
    }
    return TemplateCache.instance;
  }

  get(key, data) {
    const cacheKey = `${key}_${this.hashData(data)}`;

    if (this.cache.has(cacheKey)) {
      // Cloner l'élément pour éviter les références partagées
      return this.cache.get(cacheKey).cloneNode(true);
    }

    return null;
  }

  set(key, data, element) {
    if (this.cache.size >= this.maxSize) {
      // Supprimer les anciens éléments (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const cacheKey = `${key}_${this.hashData(data)}`;
    this.cache.set(cacheKey, element.cloneNode(true));
  }

  hashData(data) {
    if (!data) return "";

    if (typeof data === "string") return data;
    if (typeof data === "number") return data.toString();

    // Hash simple pour les objets
    return JSON.stringify(data).substring(0, 50);
  }

  clear() {
    this.cache.clear();
  }
}
