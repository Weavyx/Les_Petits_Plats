import { StringProcessor } from "../utils/StringProcessor.js";

/**
 * @class SearchAndFilterStateManager
 * @description Gestionnaire d'état implémentant le pattern Singleton pour la gestion des filtres et recherches.
 * Responsable de :
 * - Gestion de l'état des recherches et filtres
 * - Coordination des interactions entre composants
 * - Optimisation des performances de recherche
 * - Mise à jour de l'interface en temps réel
 * @property {string} mainSearchQuery - Texte de recherche principal
 * @property {Set<string>} activeFilters - Ensemble des filtres actifs
 * @property {number[]} currentFilteredRecipeIds - IDs des recettes actuellement filtrées
 */
export class SearchAndFilterStateManager {
  /**
   * Crée ou retourne l'instance unique du gestionnaire d'état.
   * @constructor
   * @returns {SearchAndFilterStateManager} L'instance unique du gestionnaire
   * @description
   * Initialise les propriétés suivantes :
   * - Références aux éléments du DOM pour les champs de recherche
   * - États des recherches pour chaque type de filtre
   * - Collection des filtres actifs
   * - Système de debounce pour les performances
   * @example
   * const stateManager = new SearchAndFilterStateManager();
   */
  constructor() {
    if (SearchAndFilterStateManager.instance) {
      return SearchAndFilterStateManager.instance;
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

    this.activeFilters = new Set(); // Utilisation d'un Set pour les filtres actifs

    this.currentFilteredRecipeIds = []; // Liste des IDs des recettes filtrées

    // Optimisation : Debounce pour la recherche principale
    this.searchDebounceTimeout = null;
    this.DEBOUNCE_DELAY = 300; // 300ms de délai

    SearchAndFilterStateManager.instance = this;
  }
  /**
   * Gère la mise à jour des recherches et l'application des filtres en temps réel.
   * @method
   * @param {string} key - Identifiant du type de recherche ('mainSearchQuery', 'ingredientsQuery', etc.)
   * @param {HTMLInputElement} target - Élément de formulaire ayant déclenché la mise à jour
   * @description
   * Processus de mise à jour :
   * 1. Récupère la nouvelle valeur de recherche
   * 2. Met à jour l'état des boutons d'effacement
   * 3. Applique la logique spécifique selon le type de recherche
   * 4. Déclenche la mise à jour de l'interface
   * @fires SearchAndFilterStateManager#searchStateChanged
   */
  processSearchQueryUpdate(key, target) {
    const value = target.value;

    // Configuration des IDs de boutons (peut être mis en cache statique)
    const eraseButtonIds = {
      mainSearchQuery: "main-delete-search-icon",
      ingredientsQuery: "ingredients-delete-search-icon",
      appliancesQuery: "appliances-delete-search-icon",
      utensilsQuery: "utensils-delete-search-icon",
    };

    const searchIconIds = {
      mainSearchQuery: null,
      ingredientsQuery: "ingredients-search-icon",
      appliancesQuery: "appliances-search-icon",
      utensilsQuery: "utensils-search-icon",
    };

    // Mise à jour de l'état du bouton d'effacement
    this.view.updateEraseButtonState(
      target,
      eraseButtonIds[key],
      searchIconIds[key]
    ); // Logique métier optimisée
    switch (key) {
      case "mainSearchQuery":
        this.mainSearchQuery = value;
        // Optimisation : Utilisation du debounce pour la recherche principale
        if (this.searchDebounceTimeout) {
          clearTimeout(this.searchDebounceTimeout);
        }
        this.searchDebounceTimeout = setTimeout(() => {
          if (value.length >= 3 || value.length === 0) {
            this.searchRecipesByMainQuery(value);
          }
        }, this.DEBOUNCE_DELAY);
        break;

      case "ingredientsQuery":
        this._processFilterDropdownSearch(
          "ingredients",
          value,
          this.model.allIngredients
        );
        break;

      case "appliancesQuery":
        this._processFilterDropdownSearch(
          "appliances",
          value,
          this.model.allAppliances
        );
        break;

      case "utensilsQuery":
        this._processFilterDropdownSearch(
          "utensils",
          value,
          this.model.allUtensils
        );
        break;

      default:
        console.warn(`Clé de recherche inconnue : ${key}`);
    }
  } // Traite les recherches dans les dropdowns de filtres
  _processFilterDropdownSearch(filterType, value, dataSet) {
    // Obtenir les options disponibles basées sur les recettes actuellement filtrées
    const availableOptions = this.getAvailableOptionsFromRecipes(
      this.currentFilteredRecipeIds
    );
    const availableDataSet = availableOptions[filterType] || [];
    if (value.length > 0) {
      this.filterDropdownOptionsAndUpdate(filterType, value, availableDataSet);
    } else {
      this.updateFilterDropdownContent(filterType, availableDataSet);
    }
  }
  /**
   * Filtre et met à jour les options d'un menu déroulant en temps réel.
   * @method
   * @param {string} key - Type de filtre ('ingredients', 'appliances', 'utensils')
   * @param {string} value - Terme de recherche à filtrer
   * @param {Array<string>} dataSet - Ensemble des options disponibles
   * @description
   * Processus de filtrage :
   * 1. Normalise le terme de recherche pour une comparaison insensible à la casse
   * 2. Filtre les options correspondant au terme de recherche
   * 3. Met à jour l'affichage du menu déroulant
   * @example
   * filterDropdownOptionsAndUpdate('ingredients', 'tom', ['Tomate', 'Pomme']);
   */
  filterDropdownOptionsAndUpdate(key, value, dataSet) {
    const normalizedValue = StringProcessor.normalizeText(value);

    // Optimisation : utiliser une boucle for au lieu de filter pour de meilleures performances
    const filteredOptions = [];
    for (const item of dataSet) {
      if (StringProcessor.normalizeText(item).includes(normalizedValue)) {
        filteredOptions.push(item);
      }
    }

    this.updateFilterDropdownContent(key, filteredOptions);
  }

  /**
   * Affiche les options d'un filtre dans son dropdown correspondant.
   * @param {string} key - Type de filtre (ex. "ingredients").
   * @param {Array<string>} options - Liste des options à afficher.
   */
  updateFilterDropdownContent(key, options) {
    const containerIds = {
      ingredients: "ingredients-container",
      appliances: "appliances-container",
      utensils: "utensils-container",
    };
    const optionsContainer = document.getElementById(containerIds[key]);
    this.view.displayFilteringOptions(options, optionsContainer, key);
  }
  /**
   * Calcule dynamiquement les options de filtrage disponibles.
   * @method
   * @param {Array<number>} recipeIds - IDs des recettes actuellement filtrées
   * @returns {Object} Options de filtrage disponibles
   * @property {string[]} ingredients - Liste des ingrédients disponibles
   * @property {string[]} appliances - Liste des appareils disponibles
   * @property {string[]} utensils - Liste des ustensiles disponibles
   * @description
   * Pour chaque recette filtrée :
   * 1. Collecte tous les ingrédients, appareils et ustensiles
   * 2. Normalise les valeurs pour la cohérence
   * 3. Exclut les options déjà sélectionnées
   * @example
   * const options = getAvailableOptionsFromRecipes([1, 2, 3]);
   */
  getAvailableOptionsFromRecipes(recipeIds) {
    const availableIngredients = new Set();
    const availableAppliances = new Set();
    const availableUtensils = new Set();

    // Pour chaque recette filtrée, collecter les ingrédients, appareils et ustensiles
    recipeIds.forEach((recipeId) => {
      const recipe = this.model.recipesMap.get(recipeId);
      if (recipe) {
        // Ajouter les ingrédients
        recipe.ingredients.forEach((ingredient) => {
          const normalizedIngredient = StringProcessor.normalizeText(
            ingredient.ingredient
          );
          availableIngredients.add(normalizedIngredient);
        });

        // Ajouter l'appareil
        if (recipe.appliance) {
          const normalizedAppliance = StringProcessor.normalizeText(
            recipe.appliance
          );
          availableAppliances.add(normalizedAppliance);
        }

        // Ajouter les ustensiles
        if (Array.isArray(recipe.ustensils)) {
          recipe.ustensils.forEach((utensil) => {
            const normalizedUtensil = StringProcessor.normalizeText(utensil);
            availableUtensils.add(normalizedUtensil);
          });
        }
      }
    });

    // Retirer les filtres déjà sélectionnés de la liste des options disponibles
    this.activeFilters.forEach((activeFilter) => {
      availableIngredients.delete(activeFilter);
      availableAppliances.delete(activeFilter);
      availableUtensils.delete(activeFilter);
    });

    return {
      ingredients: Array.from(availableIngredients),
      appliances: Array.from(availableAppliances),
      utensils: Array.from(availableUtensils),
    };
  }

  /**
   * Met à jour tous les filtres avec les options disponibles basées sur les recettes filtrées.
   * @param {Array<number>} recipeIds - Liste des IDs des recettes filtrées.
   */
  updateAllFiltersWithAvailableOptions(recipeIds) {
    const availableOptions = this.getAvailableOptionsFromRecipes(recipeIds);

    // Mettre à jour chaque conteneur de filtre avec les options disponibles
    this.updateFilterDropdownContent(
      "ingredients",
      availableOptions.ingredients
    );
    this.updateFilterDropdownContent("appliances", availableOptions.appliances);
    this.updateFilterDropdownContent("utensils", availableOptions.utensils);
  }
  /**
   * Applique tous les filtres actifs à la liste des recettes.
   * @param {Array<number>} recipeIds - Liste des IDs des recettes à filtrer.
   * @returns {Array<number>} Liste des IDs des recettes après filtrage.
   */ applyActiveFilters(recipeIds) {
    if (this.activeFilters.size === 0) return recipeIds;

    // Optimisation : utiliser reduce avec Set pour éviter les includes répétés
    const recipesSet = new Set(recipeIds);
    return Array.from(this.activeFilters).reduce((filtered, filter) => {
      const recipesByFilter = this.model.allRecipesByFilters.get(filter) || [];
      if (recipesByFilter.length === 0) return [];

      const filterSet = new Set(recipesByFilter);
      return filtered.filter((id) => filterSet.has(id));
    }, recipeIds);
  }

  /**
   * Filtre les recettes en fonction d'un nouveau filtre.
   * @param {string} newFilter - Nouveau filtre à appliquer.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */ applyFilterCriteria(newFilter) {
    const recipesByFilterIds =
      this.model.allRecipesByFilters.get(newFilter) || [];
    if (recipesByFilterIds.length === 0) {
      this.currentFilteredRecipeIds = [];
      return [];
    }

    // Optimisation : utiliser Set pour intersection plus rapide
    const filterSet = new Set(recipesByFilterIds);
    this.currentFilteredRecipeIds = this.currentFilteredRecipeIds.filter((id) =>
      filterSet.has(id)
    );

    return this.currentFilteredRecipeIds;
  }
  /**
   * Filtre les recettes en fonction de la recherche principale.
   * @param {string} value - Texte de la recherche principale.
   */ searchRecipesByMainQuery(value) {
    if (value.length === 0) {
      this.currentFilteredRecipeIds = this.applyActiveFilters(
        this.model.allRecipes.map((r) => r.id)
      );
      this.controller.renderRecipesByIds(this.currentFilteredRecipeIds);
      // Mettre à jour les filtres avec les options disponibles
      this.updateAllFiltersWithAvailableOptions(this.currentFilteredRecipeIds);
      return;
    }

    const { tokensWithSpaces, tokens } = StringProcessor.processTokens(value);
    let recipes = new Set(this.model.allRecipes.map((recipe) => recipe.id));
    const { prefixIndex, invertedIndex } = this.model;

    // Optimisation : sortir de la boucle dès qu'il n'y a plus de recettes
    for (let i = 0; i < tokens.length && recipes.size > 0; i++) {
      const token = tokens[i];
      const useInvertedIndex = tokensWithSpaces[i]?.endsWith(" ");
      const idsForToken = useInvertedIndex
        ? invertedIndex[token] || []
        : prefixIndex[token] || [];

      if (idsForToken.length === 0) {
        recipes.clear();
        break;
      }

      // Optimisation : intersection directe sans conversion en Set
      const idsSet = new Set(idsForToken);
      recipes = new Set([...recipes].filter((id) => idsSet.has(id)));
    }
    const filteredRecipes = this.applyActiveFilters(Array.from(recipes));
    this.currentFilteredRecipeIds = filteredRecipes;
    this.controller.renderRecipesByIds(this.currentFilteredRecipeIds);
    // Mettre à jour les filtres avec les options disponibles
    this.updateAllFiltersWithAvailableOptions(this.currentFilteredRecipeIds);
  }
  /**
   * Met à jour les recettes en fonction des filtres actifs et de la recherche principale.
   * @returns {Array<number>} Liste des IDs des recettes filtrées.
   */ updateRecipesWithFilters() {
    let recipes;
    if (this.mainSearchQuery === "" || this.mainSearchQuery.length < 3) {
      // Si la recherche principale est vide ou trop courte
      recipes =
        this.mainSearchQuery === ""
          ? new Set(this.model.allRecipes.map((recipe) => recipe.id))
          : new Set();
    } else {
      // Recherche principale avec 3+ caractères
      const { tokensWithSpaces, tokens } = StringProcessor.processTokens(
        this.mainSearchQuery
      );
      recipes = new Set(this.model.allRecipes.map((recipe) => recipe.id));
      const { prefixIndex, invertedIndex } = this.model;

      for (let i = 0; i < tokens.length && recipes.size > 0; i++) {
        const token = tokens[i];
        const useInvertedIndex = tokensWithSpaces[i]?.endsWith(" ");
        const idsForToken = useInvertedIndex
          ? invertedIndex[token] || []
          : prefixIndex[token] || [];

        if (idsForToken.length === 0) {
          recipes.clear();
          break;
        }

        const idsSet = new Set(idsForToken);
        recipes = new Set([...recipes].filter((id) => idsSet.has(id)));
      }
    }
    const filteredRecipes = this.applyActiveFilters(Array.from(recipes));
    this.currentFilteredRecipeIds = filteredRecipes;
    // Mettre à jour les filtres avec les options disponibles
    this.updateAllFiltersWithAvailableOptions(this.currentFilteredRecipeIds);
    return filteredRecipes;
  }
  resetApplicationState() {
    // Nettoyer les caches avant de réinitialiser
    this.cleanupOptimizations();

    this.mainSearchQuery = "";
    this.ingredientsQuery = "";
    this.appliancesQuery = "";
    this.utensilsQuery = "";
    this.activeFilters.clear(); // Utilisation de clear() pour Set
    this.currentFilteredRecipeIds = this.model.allRecipes.map((r) => r.id);

    // Effacer physiquement les valeurs dans les champs de saisie du DOM
    if (this.mainSearchInputElement) {
      this.mainSearchInputElement.value = "";
    }
    if (this.ingredientsSearchInputElement) {
      this.ingredientsSearchInputElement.value = "";
    }
    if (this.appliancesSearchInputElement) {
      this.appliancesSearchInputElement.value = "";
    }
    if (this.utensilsSearchInputElement) {
      this.utensilsSearchInputElement.value = "";
    }

    // Remettre tous les filtres à leur état initial (toutes les options disponibles)
    this.updateFilterDropdownContent(
      "ingredients",
      Array.from(this.model.allIngredients)
    );
    this.updateFilterDropdownContent(
      "appliances",
      Array.from(this.model.allAppliances)
    );
    this.updateFilterDropdownContent(
      "utensils",
      Array.from(this.model.allUtensils)
    );
  }

  // Méthodes de nettoyage pour optimiser la mémoire
  cleanupOptimizations() {
    // Nettoyer les timeouts de debounce
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
      this.searchDebounceTimeout = null;
    }

    // Nettoyer les caches StringProcessor périodiquement
    if (Math.random() < 0.1) {
      // 10% de chance à chaque reset
      StringProcessor.clearCaches();
    }
  }
}
