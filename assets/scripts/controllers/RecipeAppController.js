import { RecipeDataModel } from "../models/RecipeDataModel.js";
import { AppView } from "../views/AppView.js";
import { SearchAndFilterStateManager } from "../state/SearchAndFilterStateManager.js";
import { StringProcessor } from "../utils/StringProcessor.js";
import { EventDelegationSystem } from "../utils/EventDelegationSystem.js";
import { UIEventHandler } from "../utils/UIEventHandler.js";

/**
 * @class RecipeAppController
 * @description Contrôleur principal implémentant le pattern MVC pour l'application de recettes.
 * Coordonne les interactions entre le modèle de données, la vue utilisateur et le gestionnaire d'état.
 * Responsable de :
 * - L'initialisation de l'application
 * - La gestion des recettes et leur affichage
 * - La coordination des filtres de recherche
 * - L'optimisation des performances
 * @implements {Singleton}
 */
export class RecipeAppController {
  /**
   * Crée une instance unique du contrôleur principal.
   * @constructor
   * @param {RecipeDataModel} model - Instance du modèle gérant les données des recettes
   * @param {AppView} view - Instance de la vue gérant l'interface utilisateur
   * @param {SearchAndFilterStateManager} appStateManager - Instance du gestionnaire d'état
   * @returns {RecipeAppController} L'instance unique du contrôleur
   * @throws {Error} Si les dépendances requises ne sont pas fournies
   */
  constructor(model, view, appStateManager) {
    if (RecipeAppController.instance) {
      return RecipeAppController.instance;
    }
    this.model = model;
    this.view = view;
    this.appStateManager = appStateManager;

    // Liaison des composants entre eux
    this.view.appStateManager = this.appStateManager;
    this.view.controller = this;
    this.appStateManager.controller = this;
    this.appStateManager.model = this.model;
    this.appStateManager.view = this.view;

    RecipeAppController.instance = this;
  }

  /**
   * Initialise l'application et configure tous ses composants.
   * @async
   * @method
   * @returns {Promise<void>}
   * @throws {Error} Si l'initialisation échoue
   * @description
   * Effectue les opérations suivantes dans l'ordre :
   * 1. Configure les optimisations de performance
   * 2. Charge les données des recettes
   * 3. Construit les index de recherche et de filtrage
   * 4. Initialise l'interface utilisateur
   * 5. Configure les gestionnaires d'événements
   */
  async initializeApp() {
    try {
      // Initialiser les systèmes d'optimisation
      this.setupPerformanceOptimizations();
      const recipes = await this.model.fetchRecipes();
      this._buildSearchAndFilterIndexes(recipes);
      this._displayFilterDropdowns();
      this.configureFilterToggles();
      this.configureSearchEventHandlers();
      this.view.renderRecipes(this.model.allRecipes);
    } catch (error) {
      console.error(
        "Erreur lors du rendu de la page d'accueil :",
        error.message
      );
    }
  }
  setupPerformanceOptimizations() {
    // Précharger les éléments fréquemment utilisés
    this.view.preloadElements();
    this.view.eventDelegator = EventDelegationSystem.getInstance();
  } // Construction des index de recherche et structures de données pour les filtres
  _buildSearchAndFilterIndexes(recipes) {
    const allIngredientsSet = new Set();
    const allAppliancesSet = new Set();
    const allUtensilsSet = new Set();
    const allRecipesByFilters = new Map();
    const prefixIndex = {};
    const invertedIndex = {};
    for (let recipe of recipes) {
      // Extraction et normalisation des données pour les index
      const normalizedIngredients = recipe.ingredients.map((i) =>
        StringProcessor.normalizeText(i.ingredient)
      );
      const normalizedAppliance = StringProcessor.normalizeText(
        recipe.appliance
      );
      normalizedIngredients.forEach((ingredient) =>
        allIngredientsSet.add(ingredient)
      );
      allAppliancesSet.add(normalizedAppliance);
      const utensilsArray = Array.isArray(recipe.ustensils)
        ? recipe.ustensils
        : [];
      utensilsArray
        .map(StringProcessor.normalizeText)
        .forEach((u) => allUtensilsSet.add(u));
      // Indexation pour les filtres (on garde appareils et ustensiles ici)
      normalizedIngredients.forEach((ingredient) => {
        if (!allRecipesByFilters.has(ingredient))
          allRecipesByFilters.set(ingredient, []);
        allRecipesByFilters.get(ingredient).push(recipe.id);
      });
      if (!allRecipesByFilters.has(normalizedAppliance))
        allRecipesByFilters.set(normalizedAppliance, []);
      allRecipesByFilters.get(normalizedAppliance).push(recipe.id);
      utensilsArray.map(StringProcessor.normalizeText).forEach((u) => {
        if (!allRecipesByFilters.has(u)) allRecipesByFilters.set(u, []);
        allRecipesByFilters.get(u).push(recipe.id);
      });
      // --- Indexation avancée pour la recherche ---
      // Indexation uniquement sur nom, description et ingrédients
      const fields = [
        recipe.name,
        recipe.description,
        ...recipe.ingredients.map((i) => i.ingredient),
      ];
      fields.forEach((field) => {
        if (!field) return;
        const normalized = StringProcessor.normalizeText(field);
        if (!normalized) return;
        const words = normalized
          .split(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæœ]+/)
          .filter(Boolean);
        words.forEach((word) => {
          if (!word) return;
          // Inverted index : mot complet
          if (!invertedIndex[word]) invertedIndex[word] = new Set();
          invertedIndex[word].add(recipe.id);
          // Prefix index : tous les préfixes du mot
          for (let i = 1; i <= word.length; i++) {
            const prefix = word.slice(0, i);
            if (!prefixIndex[prefix]) prefixIndex[prefix] = new Set();
            prefixIndex[prefix].add(recipe.id);
          }
        });
      });
    }
    // Conversion des Set en Array pour compatibilité
    const prefixIndexArr = {};
    for (const k in prefixIndex) prefixIndexArr[k] = Array.from(prefixIndex[k]);
    const invertedIndexArr = {};
    for (const k in invertedIndex)
      invertedIndexArr[k] = Array.from(invertedIndex[k]);
    Object.assign(this.model, {
      prefixIndex: prefixIndexArr,
      invertedIndex: invertedIndexArr,
      allRecipesByFilters,
      allIngredients: Array.from(allIngredientsSet),
      allAppliances: Array.from(allAppliancesSet),
      allUtensils: Array.from(allUtensilsSet),
      allRecipes: recipes,
    });

    this.appStateManager.currentFilteredRecipeIds = recipes.map((r) => r.id);
  } // Affiche les options de filtrage dans les dropdowns
  _displayFilterDropdowns() {
    this.view.displayFilteringOptions(
      this.model.allIngredients,
      this.view.getIngredientsContainer(),
      "ingredients"
    );
    this.view.displayFilteringOptions(
      this.model.allAppliances,
      this.view.getAppliancesContainer(),
      "appliances"
    );
    this.view.displayFilteringOptions(
      this.model.allUtensils,
      this.view.getUtensilsContainer(),
      "utensils"
    );
  }
  /**
   * Configure l'ouverture/fermeture des formulaires de filtrage.
   */
  configureFilterToggles() {
    [
      {
        button: "ingredients-button",
        form: "#ingredients-form",
        dropdownSvg: "#ingredients-dropdown-svg",
      },
      {
        button: "appliances-button",
        form: "#appliances-form",
        dropdownSvg: "#appliances-dropdown-svg",
      },
      {
        button: "utensils-button",
        form: "#utensils-form",
        dropdownSvg: "#utensils-dropdown-svg",
      },
    ].forEach(({ button, form, dropdownSvg }) => {
      UIEventHandler.setupFilterFormToggle(
        button,
        form,
        dropdownSvg,
        this.view
      );
    });
  }
  /**
   * Configure les gestionnaires d'événements pour tous les champs de recherche.
   */
  configureSearchEventHandlers() {
    [
      { id: "main-search-input", key: "mainSearchQuery" },
      { id: "ingredients-input", key: "ingredientsQuery" },
      { id: "appliances-input", key: "appliancesQuery" },
      { id: "utensils-input", key: "utensilsQuery" },
    ].forEach(({ id, key }) => {
      const input = this.view.getInputById(id);
      if (input) {
        input.addEventListener("input", (e) => {
          this.appStateManager.processSearchQueryUpdate(key, e.target);
        });
      }
    });
    const mainSearchButton = this.view.getInputById("main-search-button");
    if (mainSearchButton) {
      mainSearchButton.addEventListener("click", (e) => {
        e.preventDefault();
      });
    }
  }
  /**
   * Affiche les recettes correspondant aux IDs fournis.
   * @param {Array} recipesIds - Liste des IDs des recettes à afficher.
   */
  renderRecipesByIds(recipesIds) {
    const recipes = recipesIds.map((recipeId) => {
      return this.model.recipesMap.get(recipeId);
    });
    this.view.renderRecipes(recipes);
  }
  /**
   * Remet à zéro tous les filtres et l'état de recherche.
   */
  resetApplicationState() {
    this.appStateManager.resetApplicationState();
    this.view.renderRecipes(this.model.allRecipes);
    this.view.removeAllTags();
    this._displayFilterDropdowns();

    // S'assurer que les boutons d'effacement sont cachés après le reset
    const mainSearchInput = this.view.getInputById("main-search-input");
    if (mainSearchInput) {
      this.view.updateEraseButtonState(
        mainSearchInput,
        "main-delete-search-icon"
      );
    }
  }
}
