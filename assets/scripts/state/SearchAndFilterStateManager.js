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
   * Filtre les recettes en fonction de la recherche principale avec optimisations de performance.
   * @method searchRecipesByMainQuery
   * @param {string} value - Texte de la recherche principale saisi par l'utilisateur
   * @description
   * Cette méthode implémente un algorithme de recherche optimisé avec les caractéristiques suivantes :
   *
   * **Comportement selon la longueur de la recherche :**
   * - Si `value` est vide : affiche toutes les recettes avec filtres actifs
   * - Si `value` a 3+ caractères : effectue une recherche textuelle optimisée
   *
   * **Optimisations de performance :**
   * - Tokenisation de la requête pour recherche multi-mots
   * - Pré-calcul des longueurs de tokens pour éviter les recalculs
   * - Cache des textes normalisés pour éviter les re-normalisations
   * - Algorithme de recherche avec saut de caractères (Boyer-Moore simplifié)
   * - Vérification des limites de mots pour correspondances exactes
   *
   * **Champs de recherche (dans l'ordre) :**
   * 1. Nom de la recette (`recipe.name`)
   * 2. Description de la recette (`recipe.description`)
   * 3. Ingrédients de la recette (`recipe.ingredients[].ingredient`)
   *
   * **Processus de filtrage :**
   * 1. Tokenise la requête de recherche
   * 2. Pour chaque recette, vérifie si tous les tokens sont présents dans au moins un champ
   * 3. Applique les filtres actifs supplémentaires
   * 4. Met à jour l'affichage des recettes et des options de filtres disponibles
   *
   * @fires SearchAndFilterStateManager#recipesFiltered
   * @see StringProcessor.processTokens - Pour la tokenisation de la recherche
   * @see SearchAndFilterStateManager#_searchTokenInField - Pour l'algorithme de recherche optimisé
   * @see SearchAndFilterStateManager#applyActiveFilters - Pour l'application des filtres
   *
   * @example
   * // Recherche simple
   * stateManager.searchRecipesByMainQuery("chocolat");
   *
   * @example
   * // Recherche multi-mots
   * stateManager.searchRecipesByMainQuery("tarte aux pommes");
   *
   * @example
   * // Effacement de la recherche
   * stateManager.searchRecipesByMainQuery("");
   *
   * @performance
   * - Complexité temporelle : O(n*m*k) où n=nombre de recettes, m=nombre de champs, k=longueur moyenne des champs
   * - Optimisations : cache de normalisation, saut de caractères, arrêt précoce
   * - Mémoire : utilisation d'un cache temporaire pour les textes normalisés
   */ searchRecipesByMainQuery(value) {
    if (value.length === 0) {
      // Construction manuelle du tableau des IDs pour éviter map()
      let allRecipeIds = [];
      for (let i = 0; i < this.model.allRecipes.length; i++) {
        allRecipeIds[i] = this.model.allRecipes[i].id;
      }

      this.currentFilteredRecipeIds = this.applyActiveFilters(allRecipeIds);
      this.controller.renderRecipesByIds(this.currentFilteredRecipeIds);
      // Mettre à jour les filtres avec les options disponibles
      this.updateAllFiltersWithAvailableOptions(this.currentFilteredRecipeIds);
      return;
    } // Étape 1 : Tokenisation de la requête de recherche (logique de searchWithoutSetOrArrayMethod)
    // Sépare le terme en tokens individuels avec informations sur les espaces
    const { tokensWithSpaces, tokens } = StringProcessor.processTokens(value);

    // Étape 2 : Initialisation avec l'ensemble complet des recettes
    // Construction manuelle du tableau des IDs pour éviter map()
    let recipeIds = [];
    for (let i = 0; i < this.model.allRecipes.length; i++) {
      recipeIds[i] = this.model.allRecipes[i].id;
    }

    // Étape 3 : Filtrage progressif par intersection de tokens
    // Chaque token réduit l'ensemble des résultats possibles
    const tokensLength = tokens.length;
    const allRecipes = this.model.allRecipes;
    const normalizedCache = {};

    for (
      let tokenIndex = 0;
      tokenIndex < tokensLength && recipeIds.length > 0;
      tokenIndex++
    ) {
      const token = tokens[tokenIndex];

      // Sélection du type de recherche selon le contexte du token
      // Si le token se termine par un espace, c'est un mot complet
      const isCompleteWord = tokensWithSpaces[tokenIndex]?.endsWith(" ");

      // Collecte des IDs de recettes correspondant au token actuel
      const idsForToken = [];
      let idsCount = 0;

      // Recherche dans toutes les recettes pour le token actuel
      for (let i = 0; i < allRecipes.length; i++) {
        const recipe = allRecipes[i];
        let recipeMatches = false; // 1. Recherche dans le nom
        if (
          recipe.name &&
          this._searchTokenInField(
            recipe.name,
            token,
            normalizedCache,
            isCompleteWord
          )
        ) {
          recipeMatches = true;
        }

        // 2. Recherche dans la description (seulement si pas déjà trouvé)
        if (
          !recipeMatches &&
          recipe.description &&
          this._searchTokenInField(
            recipe.description,
            token,
            normalizedCache,
            isCompleteWord
          )
        ) {
          recipeMatches = true;
        }

        // 3. Recherche dans les ingrédients (seulement si pas déjà trouvé)
        if (!recipeMatches && recipe.ingredients) {
          const ingredients = recipe.ingredients;
          const ingredientsLength = ingredients.length;
          for (let j = 0; j < ingredientsLength; j++) {
            const ingredient = ingredients[j].ingredient;
            if (
              ingredient &&
              this._searchTokenInField(
                ingredient,
                token,
                normalizedCache,
                isCompleteWord
              )
            ) {
              recipeMatches = true;
              break; // Sortie précoce dès qu'un ingrédient correspond
            }
          }
        }

        // Si la recette correspond au token, l'ajouter aux résultats
        if (recipeMatches) {
          idsForToken[idsCount++] = recipe.id;
        }
      }

      // Optimisation : arrêt précoce si aucun résultat pour ce token
      if (idsCount === 0) {
        recipeIds = [];
        break;
      }

      // INTERSECTION MANUELLE AVEC BOUCLES NATIVES
      // Alternative performante aux méthodes filter() et includes()
      const intersectionResult = [];
      let intersectionIndex = 0;

      // Pour chaque ID de recette actuel, vérifier s'il existe dans les résultats du token
      for (let j = 0; j < recipeIds.length; j++) {
        const recipeId = recipeIds[j];

        // Recherche linéaire dans idsForToken (remplace includes())
        let found = false;
        for (let k = 0; k < idsCount; k++) {
          if (idsForToken[k] === recipeId) {
            found = true;
            break; // Optimisation : sortie précoce dès que trouvé
          }
        }

        // Si l'ID est trouvé, l'ajouter au résultat de l'intersection
        if (found) {
          intersectionResult[intersectionIndex] = recipeId;
          intersectionIndex++;
        }
      }

      // Mise à jour de la liste des IDs pour la prochaine itération
      recipeIds = intersectionResult;
    }

    const filteredRecipes = this.applyActiveFilters(recipeIds);
    this.currentFilteredRecipeIds = filteredRecipes;
    this.controller.renderRecipesByIds(this.currentFilteredRecipeIds);
    // Mettre à jour les filtres avec les options disponibles
    this.updateAllFiltersWithAvailableOptions(this.currentFilteredRecipeIds);
  }
  /**   * Fonction interne optimisée pour la recherche d'un seul token dans un champ avec boucles natives
   * @param {string} field - Champ de texte à analyser
   * @param {string} token - Token de recherche unique
   * @param {Object} cache - Cache des textes normalisés
   * @param {boolean} isCompleteWord - True si le token doit être recherché comme mot complet, false pour recherche de préfixe
   * @returns {boolean} - True si le token est trouvé
   */
  _searchTokenInField(field, token, cache, isCompleteWord) {
    // Utilisation du cache pour éviter les re-normalisations
    let normalized = cache[field];
    if (normalized === undefined) {
      normalized = StringProcessor.normalizeText(field);
      cache[field] = normalized;
    }

    const normalizedLength = normalized.length;
    const tokenLength = token.length;

    // Optimisation : si le champ est plus court que le token, skip
    if (normalizedLength < tokenLength) {
      return false;
    }

    // Recherche de sous-chaîne avec boucles natives (Boyer-Moore simplifié)
    const maxPos = normalizedLength - tokenLength;
    let pos = 0;

    while (pos <= maxPos) {
      // Vérification caractère par caractère
      let match = true;
      for (let i = 0; i < tokenLength; i++) {
        if (normalized[pos + i] !== token[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        if (isCompleteWord) {
          // Mot complet : recherche exacte avec vérification des limites de mots
          const isStartOfWord =
            pos === 0 || !/[a-zA-Z0-9]/.test(normalized[pos - 1]);
          const isEndOfWord =
            pos + tokenLength === normalizedLength ||
            !/[a-zA-Z0-9]/.test(normalized[pos + tokenLength]);

          if (isStartOfWord && isEndOfWord) {
            return true;
          }
        } else {
          // Préfixe : recherche par autocomplétion (correspond au début d'un mot)
          const isStartOfWord =
            pos === 0 || !/[a-zA-Z0-9]/.test(normalized[pos - 1]);

          if (isStartOfWord) {
            return true;
          }
        }
      }

      // Avancement simple (peut être optimisé avec Boyer-Moore complet)
      pos++;
    }

    return false;
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
      // Recherche principale avec boucles natives - MÊME LOGIQUE QUE searchRecipesByMainQuery
      const { tokensWithSpaces, tokens } = StringProcessor.processTokens(
        this.mainSearchQuery
      );

      // Construction manuelle du tableau des IDs pour éviter map()
      let recipeIds = [];
      for (let i = 0; i < this.model.allRecipes.length; i++) {
        recipeIds[i] = this.model.allRecipes[i].id;
      }

      // Filtrage progressif par intersection de tokens
      const tokensLength = tokens.length;
      const allRecipes = this.model.allRecipes;
      const normalizedCache = {};

      for (
        let tokenIndex = 0;
        tokenIndex < tokensLength && recipeIds.length > 0;
        tokenIndex++
      ) {
        const token = tokens[tokenIndex];
        const isCompleteWord = tokensWithSpaces[tokenIndex]?.endsWith(" ");

        // Collecte des IDs de recettes correspondant au token actuel
        const idsForToken = [];
        let idsCount = 0;

        // Recherche dans toutes les recettes pour le token actuel
        for (let i = 0; i < allRecipes.length; i++) {
          const recipe = allRecipes[i];
          let recipeMatches = false;

          // 1. Recherche dans le nom
          if (
            recipe.name &&
            this._searchTokenInField(
              recipe.name,
              token,
              normalizedCache,
              isCompleteWord
            )
          ) {
            recipeMatches = true;
          }

          // 2. Recherche dans la description (seulement si pas déjà trouvé)
          if (
            !recipeMatches &&
            recipe.description &&
            this._searchTokenInField(
              recipe.description,
              token,
              normalizedCache,
              isCompleteWord
            )
          ) {
            recipeMatches = true;
          }

          // 3. Recherche dans les ingrédients (seulement si pas déjà trouvé)
          if (!recipeMatches && recipe.ingredients) {
            const ingredients = recipe.ingredients;
            const ingredientsLength = ingredients.length;
            for (let j = 0; j < ingredientsLength; j++) {
              const ingredient = ingredients[j].ingredient;
              if (
                ingredient &&
                this._searchTokenInField(
                  ingredient,
                  token,
                  normalizedCache,
                  isCompleteWord
                )
              ) {
                recipeMatches = true;
                break;
              }
            }
          }

          // Si la recette correspond au token, l'ajouter aux résultats
          if (recipeMatches) {
            idsForToken[idsCount++] = recipe.id;
          }
        }

        // Optimisation : arrêt précoce si aucun résultat pour ce token
        if (idsCount === 0) {
          recipeIds = [];
          break;
        }

        // INTERSECTION MANUELLE AVEC BOUCLES NATIVES
        const intersectionResult = [];
        let intersectionIndex = 0;

        // Pour chaque ID de recette actuel, vérifier s'il existe dans les résultats du token
        for (let j = 0; j < recipeIds.length; j++) {
          const recipeId = recipeIds[j];

          // Recherche linéaire dans idsForToken (remplace includes())
          let found = false;
          for (let k = 0; k < idsCount; k++) {
            if (idsForToken[k] === recipeId) {
              found = true;
              break;
            }
          }

          // Si l'ID est trouvé, l'ajouter au résultat de l'intersection
          if (found) {
            intersectionResult[intersectionIndex] = recipeId;
            intersectionIndex++;
          }
        }

        // Mise à jour de la liste des IDs pour la prochaine itération
        recipeIds = intersectionResult;
      }

      recipes = new Set(recipeIds);
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
