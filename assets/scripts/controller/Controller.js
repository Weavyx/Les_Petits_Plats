import { EventManager } from "../utils/EventManager.js";
import { TextUtils } from "../utils/TextUtils.js";

/**
 * Classe principale du contrôleur de l'application.
 * Gère la logique entre le modèle, la vue et le gestionnaire d'état.
 */
export class AppController {
  /**
   * Constructeur de la classe AppController.
   * Implémente un singleton pour garantir une seule instance.
   *
   * @param {object} model - Le modèle de données.
   * @param {object} view - La vue pour le rendu.
   * @param {object} appStateManager - Le gestionnaire d'état.
   */
  constructor(model, view, appStateManager) {
    if (AppController.instance) {
      return AppController.instance;
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

    AppController.instance = this;
  }

  /**
   * Méthode principale pour rendre la page d'accueil.
   * Récupère les recettes, met à jour les index et affiche les options de filtrage.
   *
   * @async
   * @returns {Promise<void>} Une promesse qui se résout une fois la page rendue.
   */
  initializeHomePage() {
    try {
      var self = this;
      this.model.fetchRecipes().then(function (recipes) {
        // Récupération des conteneurs DOM
        const recipeCardsContainer =
          document.getElementById("recipes-container");
        const ingredientsContainer = document.getElementById(
          "ingredients-container"
        );
        const appliancesContainer = document.getElementById(
          "appliances-container"
        );
        const utensilsContainer = document.getElementById("utensils-container");

        // Réinitialisation du conteneur des cartes de recettes
        recipeCardsContainer.innerHTML = "";

        // Initialisation des structures de données
        const allIngredientsSet = new Set();
        const allAppliancesSet = new Set();
        const allUtensilsSet = new Set();
        const allRecipesByFilters = new Map();
        const prefixIndex = {};
        const invertedIndex = {};

        // Parcours des recettes pour les afficher et collecter les données
        for (let r = 0; r < recipes.length; r++) {
          let recipe = recipes[r];
          // Affichage de la carte de recette
          self.view.displayRecipeCard(recipe, recipeCardsContainer);

          // Normalisation des données
          var normalizedIngredients = [];
          for (let i = 0; i < recipe.ingredients.length; i++) {
            normalizedIngredients.push(
              TextUtils.normalizeText(recipe.ingredients[i].ingredient)
            );
          }
          var normalizedAppliance = TextUtils.normalizeText(recipe.appliance);
          var normalizedUtensils = [];
          for (let u = 0; u < recipe.ustensils.length; u++) {
            normalizedUtensils.push(TextUtils.normalizeText(recipe.ustensils[u]));
          }

          // Mise à jour des ensembles uniques
          for (let i = 0; i < normalizedIngredients.length; i++) {
            allIngredientsSet.add(normalizedIngredients[i]);
          }
          allAppliancesSet.add(normalizedAppliance);
          for (let u = 0; u < normalizedUtensils.length; u++) {
            allUtensilsSet.add(normalizedUtensils[u]);
          }

          // Mise à jour des filtres
          var filterValues = [];
          for (let i = 0; i < normalizedIngredients.length; i++) {
            filterValues.push(normalizedIngredients[i]);
          }
          filterValues.push(normalizedAppliance);
          for (let i = 0; i < normalizedUtensils.length; i++) {
            filterValues.push(normalizedUtensils[i]);
          }
          for (let v = 0; v < filterValues.length; v++) {
            let value = filterValues[v];
            if (!allRecipesByFilters.has(value)) {
              allRecipesByFilters.set(value, []);
            }
            allRecipesByFilters.get(value).push(recipe.id);
          }

          // Création des index pour la recherche
          var fullText =
            recipe.name +
            " " +
            recipe.description +
            " " +
            normalizedIngredients.join(" ");
          var tokens = TextUtils.normalizeText(fullText).split(" ");

          for (let t = 0; t < tokens.length; t++) {
            let token = tokens[t];
            if (!token) continue;

            // Index inversé
            if (!invertedIndex[token]) {
              invertedIndex[token] = new Set();
            }
            invertedIndex[token].add(recipe.id);

            // Index des préfixes
            for (let i = 1; i <= token.length; i++) {
              const prefix = token.slice(0, i);
              if (!prefixIndex[prefix]) {
                prefixIndex[prefix] = new Set();
              }
              prefixIndex[prefix].add(recipe.id);
            }
          }
        }

        // Mise à jour du modèle et de l'état
        Object.assign(self.model, {
          prefixIndex: prefixIndex,
          invertedIndex: invertedIndex,
          allRecipesByFilters: allRecipesByFilters,
          allIngredients: allIngredientsSet,
          allAppliances: allAppliancesSet,
          allUtensils: allUtensilsSet,
        });

        var recipeIds = [];
        for (let i = 0; i < recipes.length; i++) {
          recipeIds.push(recipes[i].id);
        }
        self.appStateManager.currentFilteredRecipeIds = recipeIds; // Ne conserver que les IDs des recettes
        self.model.allRecipes = recipes;

        // Affichage des options de filtrage
        self.view.displayFilteringOptions(
          allIngredientsSet,
          ingredientsContainer,
          "ingredients"
        );
        self.view.displayFilteringOptions(
          allAppliancesSet,
          appliancesContainer,
          "appliances"
        );
        self.view.displayFilteringOptions(
          allUtensilsSet,
          utensilsContainer,
          "utensils"
        );

        // Configuration des formulaires et des champs de recherche
        self.configureFilteringForms();
        self.configureSearchInputs(); // Vide les champs de recherche et attache les événements de récupération de saisie

        // Afficher le nombre de recettes
        self.view.updateRecipeCount(recipes.length);
      });
    } catch (error) {
      console.error(
        "Erreur lors du rendu de la page d'accueil :",
        error.message
      );
    }
  }

  /**
   * Configure la visibilité des formulaires de filtrage lors des clics sur les boutons.
   */
  configureFilteringForms() {
    var configs = [
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
    ];
    for (let i = 0; i < configs.length; i++) {
      let config = configs[i];
      EventManager.setupFilterFormToggle(
        config.button,
        config.form,
        config.dropdownSvg,
        this.view
      );
    }
  }

  /**
   * Configure les champs de recherche pour mettre à jour le texte de recherche dans le gestionnaire d'état.
   */
  configureSearchInputs() {
    var configs = [
      { id: "main-search-input", key: "mainSearchQuery" },
      { id: "ingredients-input", key: "ingredientsQuery" },
      { id: "appliances-input", key: "appliancesQuery" },
      { id: "utensils-input", key: "utensilsQuery" },
    ];
    for (let i = 0; i < configs.length; i++) {
      let config = configs[i];
      const input = document.getElementById(config.id);
      input.value = "";
      EventManager.attachEventListener(input, "input", (e) => {
        // Met à jour la requête de recherche dans le gestionnaire d'état
        this.appStateManager.updateSearchQuery(config.key, e.target);
      });
    }
    const mainSearchButton = document.getElementById("main-search-button");
    mainSearchButton.addEventListener("click", function (e) {
      e.preventDefault(); // Empêche le rechargement de la page
    });
  }

  /**
   * Rend une carte de recette dans le conteneur spécifié.
   *
   * @param {Array} recipesIds - Liste des IDs des recettes à afficher.
   */
  displayRecipesByIds(recipesIds) {
    var recipes = [];
    for (let i = 0; i < recipesIds.length; i++) {
      recipes.push(this.model.recipesMap.get(recipesIds[i]));
    }
    this.view.renderRecipes(recipes);
  }
}
