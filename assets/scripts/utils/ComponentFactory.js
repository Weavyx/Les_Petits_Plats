import { recipeCardTemplate } from "../components/RecipeCard.js";
import { filteringOptionTemplate } from "../components/FilteringOption.js";

/**
 * Gestionnaire de composants d'interface réutilisables basé sur le pattern Factory.
 * Permet la création d'éléments DOM complexes à partir de templates.
 */
export class ComponentFactory {
  static componentBuilders = {};

  /**
   * Enregistre un constructeur de composant avec un identifiant unique.
   * @param {string} key - L'identifiant du composant.
   * @param {Function} factory - La fonction de création du composant.
   */ static registerFactory(key, factory) {
    if (this.componentBuilders[key]) {
      console.warn(`La factory avec la clé "${key}" est déjà enregistrée.`);
    }
    this.componentBuilders[key] = factory;
  }

  /**
   * Enregistre plusieurs factories à la fois.
   * @param {Object} factories - Un objet contenant des paires clé-valeur où la clé est l'identifiant de la factory et la valeur est la factory elle-même.
   * @param {Function} factories.createRecipeCardElement - La factory pour créer un élément de carte de recette.
   * @param {Function} factories.createFilteringOptionElement - La factory pour créer un élément d'option de filtrage.
   * @param {Function} factories.createSelectedFilteringOptionElement - La factory pour créer un élément d'option de filtrage sélectionné.
   * @param {Function} factories.createfilteringOptionTag - La factory pour créer un tag d'option de filtrage.
   */
  static registerFactories(factories) {
    for (const [key, factory] of Object.entries(factories)) {
      this.registerFactory(key, factory);
    }
  }

  /**
   * Récupère une factory enregistrée.
   * @param {string} key - L'identifiant de la factory.
   * @returns {Function} La factory correspondante.
   */ static getFactory(key) {
    const factory = this.componentBuilders[key];
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
  static create(key, data) {
    const factory = this.getFactory(key);
    return factory(data);
  }
}
