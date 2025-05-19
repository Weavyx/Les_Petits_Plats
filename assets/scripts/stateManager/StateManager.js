import { TextUtils } from "../utils/TextUtils.js";

/**
 * Classe gérant l'état de l'application, incluant les recherches et les filtres.
 */
export class StateManager {
  /**
   * Constructeur de la classe StateManager.
   * Implémente le pattern Singleton pour garantir une seule instance.
   */
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }
    this.controller = null; // Instancié par le contrôleur
    this.model = null; // Instancié par le contrôleur
    this.view = null; // Instancié par le contrôleur

    this.mainSearchInputElement = document.getElementById("main-search-input");
    this.ingredientsSearchInputElement =
      document.getElementById("ingredients-input");
    this.appliancesSearchInputElement =
      document.getElementById("appliances-input");
    this.utensilsSearchInputElement = document.getElementById("utensils-input");

    this.mainSearchQuery = ""; // Texte dans le champ de recherche principal

    this.ingredientsQuery = ""; // Texte dans le champ de recherche des ingrédients
    this.appliancesQuery = ""; // Texte dans le champ de recherche des appareils
    this.utensilsQuery = ""; // Texte dans le champ de recherche des ustensiles

    this.activeFilters = []; // Liste des filtres actifs

    this.currentFilteredRecipeIds = []; // Liste des IDs des recettes filtrées

    StateManager.instance = this;
  }

  /**
   * Met à jour la requête de recherche en fonction de la clé et de la valeur fournies.
   * @param {string} key - Clé identifiant le type de recherche (ex. "mainSearchQuery").
   * @param {string} value - Valeur de la recherche.
   */
  updateSearchQuery(key, target) {
    const value = target.value;
    const searchMapping = {
      mainSearchQuery: () => {
        this.mainSearchQuery = value;
        if (value.length > 0) {
          this.view.toggleEraseButtonVisibility(
            true,
            "main-search-icon",
            "main-delete-search-icon",
            target
          );
          if (value.length >= 3) {
            this.filterRecipesByMainSearch(value);
          }
        } else if (value.length === 0) {
          this.view.toggleEraseButtonVisibility(
            false,
            "main-search-icon",
            "main-delete-search-icon",
            target
          );
        }
      },
      ingredientsQuery: () => {
        if (value.length > 0) {
          this.view.toggleEraseButtonVisibility(
            true,
            "ingredients-search-icon",
            "ingredients-delete-search-icon",
            target
          );
          this.filterOptionsAndRender(
            "ingredients",
            value,
            Array.from(this.model.allIngredients)
          );
        } else if (value.length === 0) {
          this.view.toggleEraseButtonVisibility(
            false,
            "ingredients-search-icon",
            "ingredients-delete-search-icon",
            target
          );
          this.renderFilteredOptions(
            "ingredients",
            Array.from(this.model.allIngredients)
          );
        }
      },

      appliancesQuery: () => {
        if (value.length > 0) {
          this.view.toggleEraseButtonVisibility(
            true,
            "appliances-search-icon",
            "appliances-delete-search-icon",
            target
          );
          this.filterOptionsAndRender(
            "appliances",
            value,
            Array.from(this.model.allAppliances)
          );
        } else if (value.length === 0) {
          this.view.toggleEraseButtonVisibility(
            false,
            "appliances-search-icon",
            "appliances-delete-search-icon",
            target
          );
          this.renderFilteredOptions(
            "appliances",
            Array.from(this.model.allAppliances)
          );
        }
      },

      utensilsQuery: () => {
        if (value.length > 0) {
          this.view.toggleEraseButtonVisibility(
            true,
            "utensils-search-icon",
            "utensils-delete-search-icon",
            target
          );
          this.filterOptionsAndRender(
            "utensils",
            value,
            Array.from(this.model.allUtensils)
          );
        } else if (value.length === 0) {
          this.view.toggleEraseButtonVisibility(
            false,
            "utensils-search-icon",
            "utensils-delete-search-icon",
            target
          );
          this.renderFilteredOptions(
            "utensils",
            Array.from(this.model.allUtensils)
          );
        }
      },
    };

    if (searchMapping[key]) {
      searchMapping[key]();
    } else {
      console.warn(`Clé de recherche inconnue : ${key}`);
    }
  }

  /**
   * Filtre les options et met à jour l'affichage.
   * @param {string} key - Clé identifiant le type d'option (ex. "ingredients").
   * @param {string} value - Valeur de recherche pour filtrer les options.
   * @param {Array<string>} dataSet - Ensemble de données à filtrer.
   */
  filterOptionsAndRender(key, value, dataSet) {
    const normalizedValue = TextUtils.normalizeText(value);
    const filteredOptions = dataSet.filter((item) =>
      TextUtils.normalizeText(item).includes(normalizedValue)
    );
    this.renderFilteredOptions(key, filteredOptions);
  }

  /**
   * Met à jour l'affichage des options filtrées.
   * @param {string} key - Clé identifiant le type d'option (ex. "ingredients").
   * @param {Array<string>} options - Liste des options filtrées.
   */
  renderFilteredOptions(key, options) {
    const containerIds = {
      ingredients: "ingredients-container",
      appliances: "appliances-container",
      utensils: "utensils-container",
    };
    const optionsContainer = document.getElementById(containerIds[key]);
    this.view.displayFilteringOptions(options, optionsContainer, key);
  }

  /**
   * Filtre les recettes en fonction des filtres actifs.
   * @param {Array<number>} filteredRecipes - Liste des IDs des recettes à filtrer.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */
  filterRecipesBySelectedFilters(filteredRecipes) {
    if (this.activeFilters.length === 0) return filteredRecipes;
    return this.activeFilters.reduce((filtered, filter) => {
      const recipesByFilter = this.model.allRecipesByFilters.get(filter) || [];
      return filtered.filter((id) => recipesByFilter.includes(id));
    }, filteredRecipes);
  }

  /**
   * Filtre les recettes en fonction d'un nouveau filtre.
   * @param {string} newFilter - Nouveau filtre à appliquer.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */
  filterRecipesByNewFilter(newFilter) {
    const recipesByFilterIds =
      this.model.allRecipesByFilters.get(newFilter) || [];

    // Filtrer les recettes par celles qui sont déjà sélectionnées
    const filteredRecipes = recipesByFilterIds.filter((id) =>
      this.currentFilteredRecipeIds.includes(id)
    );

    this.currentFilteredRecipeIds = filteredRecipes; // Mettre à jour les recettes sélectionnées
    return this.currentFilteredRecipeIds; // Retourner les recettes filtrées
  }

  /**
   * Filtre les recettes en fonction de la recherche principale.
   * @param {string} value - Texte de la recherche principale.
   */
  filterRecipesByMainSearch(value) {
    const { tokensWithSpaces, tokens } = TextUtils.processTokens(value);
    let recipes = new Set(this.model.allRecipes.map((recipe) => recipe.id));
    const { prefixIndex, invertedIndex } = this.model;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const useInvertedIndex = tokensWithSpaces[i]?.endsWith(" ");
      const idsForToken = useInvertedIndex
        ? new Set(invertedIndex[token] || [])
        : new Set(prefixIndex[token] || []);
      if (idsForToken.size === 0) {
        recipes.clear();
        break;
      }
      recipes = new Set(
        [...recipes].filter((recipeId) => idsForToken.has(recipeId))
      );
    }
    const filteredRecipes = this.filterRecipesBySelectedFilters(
      Array.from(recipes)
    );
    this.currentFilteredRecipeIds = filteredRecipes;
    this.controller.displayRecipesByIds(this.currentFilteredRecipeIds);
  }

  /**
   * Met à jour les recettes en fonction des filtres actifs et de la recherche principale.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */
  updateRecipesWithFilters() {
    let recipes;
    if (this.mainSearchQuery === "") {
      // Si la recherche principale est vide, prendre toutes les recettes
      recipes = new Set(this.model.allRecipes.map((recipe) => recipe.id));
    } else if (this.mainSearchQuery.length >= 3) {
      // Si la recherche principale a 3 caractères ou plus, appliquer le tri
      const { tokensWithSpaces, tokens } = TextUtils.processTokens(
        this.mainSearchQuery
      );
      recipes = new Set(this.model.allRecipes.map((recipe) => recipe.id));
      const { prefixIndex, invertedIndex } = this.model;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const useInvertedIndex = tokensWithSpaces[i]?.endsWith(" ");
        const idsForToken = useInvertedIndex
          ? new Set(invertedIndex[token] || [])
          : new Set(prefixIndex[token] || []);
        if (idsForToken.size === 0) {
          recipes.clear();
          break;
        }
        recipes = new Set(
          [...recipes].filter((recipeId) => idsForToken.has(recipeId))
        );
      }
    } else {
      // Si la recherche principale est trop courte, aucune recette n'est sélectionnée
      recipes = new Set();
    }
    // Appliquer un second filtrage avec les filtres actifs
    const filteredRecipes = this.filterRecipesBySelectedFilters(
      Array.from(recipes)
    );
    this.currentFilteredRecipeIds = filteredRecipes;
    return Array.from(this.currentFilteredRecipeIds);
  }
}
