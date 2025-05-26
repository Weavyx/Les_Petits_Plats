import recipesData from "../../data/recipes.js";

/**
 * @class RecipeDataModel
 * @description Modèle de données implémentant le pattern Singleton pour gérer les recettes.
 * Responsable de :
 * - Stockage et accès aux données des recettes
 * - Gestion des index de recherche et de filtrage
 * - Optimisation des performances de recherche
 * @property {Recipe[]} recipesData - Données brutes des recettes
 * @property {Map<number, Recipe>} recipesMap - Map des recettes indexées par ID
 * @property {Object} prefixIndex - Index inversé pour la recherche par préfixe
 * @property {Object} invertedIndex - Index inversé pour la recherche exacte
 * @property {Recipe[]} allRecipes - Liste complète des recettes
 * @property {Object} allRecipesByFilters - Recettes indexées par critère de filtrage
 * @implements {Singleton}
 */
export class RecipeDataModel {
  /**
   * Singleton de la classe RecipeDataModel.
   * @type {RecipeDataModel}
   */
  constructor() {
    if (RecipeDataModel.instance) {
      return RecipeDataModel.instance;
    }
    this.recipesData = recipesData;
    this.recipesMap = new Map(recipesData.map((r) => [r.id, r]));

    this.prefixIndex = {}; // Index inversé pour la recherche, initialisé au chargement de la page
    this.invertedIndex = {}; // Index inversé pour la recherche, initialisé au chargement de la page

    this.allRecipes = []; // Liste de toutes les recettes
    this.allRecipesByFilters = {}; // Objet pour stocker les recettes par filtre

    this.allIngredients = []; // Liste de tous les ingrédients
    this.allAppliances = []; // Liste de tous les appareils
    this.allUtensils = []; // Liste de tous les ustensiles

    RecipeDataModel.instance = this;
  }

  async fetchRecipes() {
    return this.recipesData;
  }
}
