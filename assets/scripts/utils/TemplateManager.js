/*
 * TemplateManager.js
 * Gère l'enregistrement et la création d'éléments HTML à partir de templates.
 * Utilisé pour créer des éléments de manière dynamique en fonction des données fournies.
 */
export class TemplateManager {
  constructor() {
    if (TemplateManager.instance) {
      return TemplateManager.instance;
    }
    this.factories = {};
    TemplateManager.instance = this;
  }

  /**
   * Enregistre une factory avec un identifiant unique.
   * @param {string} key - L'identifiant de la factory.
   * @param {Function} factory - La fonction ou classe factory.
   */
  registerFactory(key, factory) {
    if (this.factories[key]) {
      console.warn(`La factory avec la clé "${key}" est déjà enregistrée.`);
    }
    this.factories[key] = factory;
  }

  /**
   * Récupère une factory enregistrée.
   * @param {string} key - L'identifiant de la factory.
   * @returns {Function} La factory correspondante.
   */
  getFactory(key) {
    const factory = this.factories[key];
    if (!factory) {
      throw new Error(`Aucune factory trouvée pour la clé "${key}".`);
    }
    return factory;
  }

  /**
   * Crée un élément en utilisant une factory enregistrée.
   * @param {string} key - L'identifiant de la factory.
   * @param {Object} data - Les données nécessaires pour créer l'élément.
   * @returns {HTMLElement} L'élément créé.
   */
  create(key, data) {
    const factory = this.getFactory(key);
    return factory(data);
  }
}
