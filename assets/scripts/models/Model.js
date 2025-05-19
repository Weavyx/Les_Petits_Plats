import recipesData from "../../data/recipes.js";

export class AppModel {
  /**
   * Singleton de la classe AppModel.
   * @type {AppModel}
   */
  constructor() {
    if (AppModel.instance) {
      return AppModel.instance;
    }
    this.recipesData = recipesData;
    // Remplacement de map par une boucle for classique
    this.recipesMap = new Map();
    for (let i = 0; i < recipesData.length; i++) {
      const r = recipesData[i];
      this.recipesMap.set(r.id, r);
    }

    this.prefixIndex = {}; // Index inversé pour la recherche, initialisé au chargement de la page
    this.invertedIndex = {}; // Index inversé pour la recherche, initialisé au chargement de la page

    this.allRecipes = []; // Liste de toutes les recettes
    this.allRecipesByFilters = {}; // Objet pour stocker les recettes par filtre

    this.allIngredients = []; // Liste de tous les ingrédients
    this.allAppliances = []; // Liste de tous les appareils
    this.allUtensils = []; // Liste de tous les ustensiles

    AppModel.instance = this;
  }

  async fetchRecipes() {
    return this.recipesData;
  }
}
