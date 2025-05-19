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
    const filteredOptions = [];
    for (let i = 0; i < dataSet.length; i++) {
      const item = dataSet[i];
      if (TextUtils.normalizeText(item).includes(normalizedValue)) {
        filteredOptions.push(item);
      }
    }
    console.log("Filtered options:", filteredOptions);
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
    let filtered = filteredRecipes;
    for (let i = 0; i < this.activeFilters.length; i++) {
      const filter = this.activeFilters[i];
      const recipesByFilter = this.model.allRecipesByFilters.get(filter) || [];
      const nextFiltered = [];
      for (let j = 0; j < filtered.length; j++) {
        const id = filtered[j];
        // On remplace includes par une boucle
        let found = false;
        for (let k = 0; k < recipesByFilter.length; k++) {
          if (recipesByFilter[k] === id) {
            found = true;
            break;
          }
        }
        if (found) {
          nextFiltered.push(id);
        }
      }
      filtered = nextFiltered;
    }
    return filtered;
  }

  /**
   * Filtre les recettes en fonction d'un nouveau filtre.
   * @param {string} newFilter - Nouveau filtre à appliquer.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */
  filterRecipesByNewFilter(newFilter) {
    const recipesByFilterIds =
      this.model.allRecipesByFilters.get(newFilter) || [];
    const filteredRecipes = [];
    for (let i = 0; i < recipesByFilterIds.length; i++) {
      const id = recipesByFilterIds[i];
      // Remplacer includes par une boucle
      let found = false;
      for (let j = 0; j < this.currentFilteredRecipeIds.length; j++) {
        if (this.currentFilteredRecipeIds[j] === id) {
          found = true;
          break;
        }
      }
      if (found) {
        filteredRecipes.push(id);
      }
    }
    this.currentFilteredRecipeIds = filteredRecipes;
    return this.currentFilteredRecipeIds;
  }

  /**
   * Filtre les recettes en fonction de la recherche principale.
   * @param {string} value - Texte de la recherche principale.
   */
  filterRecipesByMainSearch(value) {
    const { tokensWithSpaces, tokens } = TextUtils.processTokens(value);
    let recipes = [];
    // Récupérer tous les IDs de recettes
    for (let i = 0, len = this.model.allRecipes.length; i < len; i++) {
      recipes[i] = this.model.allRecipes[i].id;
    }
    const prefixIndex = this.model.prefixIndex;
    const invertedIndex = this.model.invertedIndex;
    let i = 0;
    let tokensLen = tokens.length;
    while (i < tokensLen) {
      const token = tokens[i];
      const useInvertedIndex = tokensWithSpaces[i] && tokensWithSpaces[i].endsWith(" ");
      let idsArray = useInvertedIndex ? invertedIndex[token] || [] : prefixIndex[token] || [];
      // Toujours convertir en tableau si c'est un Set
      if (!Array.isArray(idsArray)) {
        let arr = [];
        let it = idsArray.values();
        let next = it.next();
        while (!next.done) {
          arr[arr.length] = next.value;
          next = it.next();
        }
        idsArray = arr;
      }
      if (idsArray.length === 0) {
        recipes = [];
        break;
      }
      // Intersection manuelle entre recipes et idsArray
      let newRecipes = [];
      for (let j = 0, rLen = recipes.length; j < rLen; j++) {
        let recipeId = recipes[j];
        let found = false;
        for (let k = 0, idLen = idsArray.length; k < idLen; k++) {
          if (idsArray[k] === recipeId) {
            found = true;
            break;
          }
        }
        if (found) {
          newRecipes[newRecipes.length] = recipeId;
        }
      }
      recipes = newRecipes;
      i++;
    }
    const filteredRecipes = this.filterRecipesBySelectedFilters(recipes);
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
      recipes = new Set();
      for (let i = 0; i < this.model.allRecipes.length; i++) {
        recipes.add(this.model.allRecipes[i].id);
      }
    } else if (this.mainSearchQuery.length >= 3) {
      // Si la recherche principale a 3 caractères ou plus, appliquer le tri
      const { tokensWithSpaces, tokens } = TextUtils.processTokens(
        this.mainSearchQuery
      );
      recipes = new Set();
      for (let i = 0; i < this.model.allRecipes.length; i++) {
        recipes.add(this.model.allRecipes[i].id);
      }
      const { prefixIndex, invertedIndex } = this.model;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const useInvertedIndex = tokensWithSpaces[i] && tokensWithSpaces[i].endsWith(" ");
        let idsForTokenSet;
        if (useInvertedIndex) {
          idsForTokenSet = new Set(invertedIndex[token] || []);
        } else {
          idsForTokenSet = new Set(prefixIndex[token] || []);
        }
        if (idsForTokenSet.size === 0) {
          recipes.clear();
          break;
        }
        // Intersect recipes et idsForTokenSet sans Array.filter
        let newRecipes = new Set();
        for (let recipeId of recipes) {
          if (idsForTokenSet.has(recipeId)) {
            newRecipes.add(recipeId);
          }
        }
        recipes = newRecipes;
      }
    } else {
      // Si la recherche principale est trop courte, aucune recette n'est sélectionnée
      recipes = new Set();
    }
    // Appliquer un second filtrage avec les filtres actifs
    let recipesArray = [];
    for (let recipeId of recipes) {
      recipesArray.push(recipeId);
    }
    const filteredRecipes = this.filterRecipesBySelectedFilters(recipesArray);
    this.currentFilteredRecipeIds = filteredRecipes;
    let result = [];
    for (let i = 0; i < this.currentFilteredRecipeIds.length; i++) {
      result.push(this.currentFilteredRecipeIds[i]);
    }
    return result;
  }
}
