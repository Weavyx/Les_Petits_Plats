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
      this.model.fetchRecipes().then((recipes) => {
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
        for (let recipe of recipes) {
          // Affichage de la carte de recette
          this.view.displayRecipeCard(recipe, recipeCardsContainer);

          // Normalisation des données
          const normalizedIngredients = recipe.ingredients.map((i) =>
            TextUtils.normalizeText(i.ingredient)
          );
          const normalizedAppliance = TextUtils.normalizeText(recipe.appliance);
          const normalizedUtensils = recipe.ustensils.map((u) =>
            TextUtils.normalizeText(u)
          );

          // Mise à jour des ensembles uniques
          for (let ingredient of normalizedIngredients) {
            allIngredientsSet.add(ingredient);
          }
          allAppliancesSet.add(normalizedAppliance);
          for (let utensil of normalizedUtensils) {
            allUtensilsSet.add(utensil);
          }

          // Mise à jour des filtres
          for (let value of [
            ...normalizedIngredients,
            normalizedAppliance,
            ...normalizedUtensils,
          ]) {
            if (!allRecipesByFilters.has(value)) {
              allRecipesByFilters.set(value, []);
            }
            allRecipesByFilters.get(value).push(recipe.id);
          }

          // Création des index pour la recherche
          const fullText = `${recipe.name} ${
            recipe.description
          } ${normalizedIngredients.join(" ")}`;
          const tokens = TextUtils.normalizeText(fullText).split(" ");

          for (let token of tokens) {
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
        Object.assign(this.model, {
          prefixIndex,
          invertedIndex,
          allRecipesByFilters,
          allIngredients: allIngredientsSet,
          allAppliances: allAppliancesSet,
          allUtensils: allUtensilsSet,
        });

        this.appStateManager.currentFilteredRecipeIds = recipes.map(
          (recipe) => recipe.id
        ); // Ne conserver que les IDs des recettes
        this.model.allRecipes = recipes;

        // Affichage des options de filtrage
        this.view.displayFilteringOptions(
          allIngredientsSet,
          ingredientsContainer,
          "ingredients"
        );
        this.view.displayFilteringOptions(
          allAppliancesSet,
          appliancesContainer,
          "appliances"
        );
        this.view.displayFilteringOptions(
          allUtensilsSet,
          utensilsContainer,
          "utensils"
        );

        // Configuration des formulaires et des champs de recherche
        this.configureFilteringForms();
        this.configureSearchInputs(); // Vide les champs de recherche et attache les événements de récupération de saisie

        // Afficher le nombre de recettes
        this.view.updateRecipeCount(recipes.length);
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
      EventManager.setupFilterFormToggle(button, form, dropdownSvg, this.view);
    });
  }

  /**
   * Configure les champs de recherche pour mettre à jour le texte de recherche dans le gestionnaire d'état.
   */
  configureSearchInputs() {
    [
      { id: "main-search-input", key: "mainSearchQuery" },
      { id: "ingredients-input", key: "ingredientsQuery" },
      { id: "appliances-input", key: "appliancesQuery" },
      { id: "utensils-input", key: "utensilsQuery" },
    ].forEach(({ id, key }) => {
      const input = document.getElementById(id);
      input.value = "";
      EventManager.attachEventListener(input, "input", (e) => {
        // Met à jour la requête de recherche dans le gestionnaire d'état
        this.appStateManager.updateSearchQuery(key, e.target);
      });
    });
    const mainSearchButton = document.getElementById("main-search-button");
    mainSearchButton.addEventListener("click", (e) => {
      e.preventDefault(); // Empêche le rechargement de la page
    });
  }

  /**
   * Rend une carte de recette dans le conteneur spécifié.
   *
   * @param {Array} recipesIds - Liste des IDs des recettes à afficher.
   */
  displayRecipesByIds(recipesIds) {
    const recipes = recipesIds.map((recipeId) => {
      return this.model.recipesMap.get(recipeId);
    });

    this.view.renderRecipes(recipes);
  }
}
