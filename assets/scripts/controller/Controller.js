import { EventManager } from "../utils/EventManager.js";

export class AppController {
  constructor(model, view, stateManager) {
    if (AppController.instance) {
      return AppController.instance;
    }
    this.model = model;
    this.view = view;
    this.stateManager = stateManager;

    this.view.stateManager = this.stateManager;
    this.stateManager.model = this.model;
    this.stateManager.view = this.view;

    AppController.instance = this;
  }

  renderHomePage() {
    try {
      this.model.fetchRecipes().then((recipes) => {
        // this.stateManager.resetState(); // Réinitialiser l'état avant le rendu

        // Récupérer les éléments du DOM
        const recipeCardsContainer =
          document.getElementById("recipes-container");
        recipeCardsContainer.innerHTML = "";

        // Créer des ensembles pour les ingrédients, appareils et ustensiles
        const allIngredientsSet = new Set();
        const allAppliancesSet = new Set();
        const allUtensilsSet = new Set();

        // Créer des objets pour stocker les recettes par ingrédient, appareil et ustensile
        const allRecipesByIngredient = {};
        const allRecipesByAppliance = {};
        const allRecipesByUtensil = {};

        let recipeCounter = 0; // Compteur de recettes

        // Parcourir les recettes, les afficher et enregistrer les ingrédients, appareils et ustensiles
        recipes.forEach((recipe) => {
          this.view.renderRecipeCard(recipe, recipeCardsContainer);

          // Remplir les listes d'ingrédients, appareils et ustensiles
          // Associer les ingrédients, appareils et ustensiles à chaque recette
          recipe.ingredients.forEach((ingredient) => {
            const ingredientKey = ingredient.ingredient.toLowerCase();
            allIngredientsSet.add(ingredientKey);

            // Ajouter la recette à l'objet allRecipesByIngredient
            if (!allRecipesByIngredient[ingredientKey]) {
              allRecipesByIngredient[ingredientKey] = [];
            }
            allRecipesByIngredient[ingredientKey].push(recipe);
          });

          const applianceKey = recipe.appliance.toLowerCase();
          allAppliancesSet.add(applianceKey);

          // Ajouter la recette à l'objet allRecipesByAppliance
          if (!allRecipesByAppliance[applianceKey]) {
            allRecipesByAppliance[applianceKey] = [];
          }
          allRecipesByAppliance[applianceKey].push(recipe);

          recipe.ustensils.forEach((utensil) => {
            const utensilKey = utensil.toLowerCase();
            allUtensilsSet.add(utensilKey);

            // Ajouter la recette à l'objet allRecipesByUtensil
            if (!allRecipesByUtensil[utensilKey]) {
              allRecipesByUtensil[utensilKey] = [];
            }
            allRecipesByUtensil[utensilKey].push(recipe);
          });

          recipeCounter++; // Incrémenter le compteur de recettes
          this.model.allRecipes.push(recipe); // Ajouter la recette au modèle
        });

        // Enregistrer les objets dans le modèle
        this.model.allRecipesByIngredient = allRecipesByIngredient;
        this.model.allRecipesByAppliance = allRecipesByAppliance;
        this.model.allRecipesByUtensil = allRecipesByUtensil;

        // Afficher tous les ingrédients, appareils et ustensiles dans les formulaires de filtrage
        const ingredientOptionsContainer = document.getElementById(
          "ingredients-container"
        );
        this.view.renderFilteringOptions(
          allIngredientsSet,
          ingredientOptionsContainer,
          "ingredients"
        );

        const appliancesOptionsContainer = document.getElementById(
          "appliances-container"
        );
        this.view.renderFilteringOptions(
          allAppliancesSet,
          appliancesOptionsContainer,
          "appliances"
        );

        const utensilsOptionsContainer =
          document.getElementById("utensils-container");
        this.view.renderFilteringOptions(
          allUtensilsSet,
          utensilsOptionsContainer,
          "utensils"
        );

        // Gestion de l'ouverture et de la fermeture des formulaires de filtrage (ingrédients, appareils et ustensiles)
        EventManager.setupFilteringFormVisibilityOnClick(
          "ingredients-button",
          "#ingredients-form",
          "#ingredients-svg",
          this.view
        );
        EventManager.setupFilteringFormVisibilityOnClick(
          "appliances-button",
          "#appliances-form",
          "#appliances-svg",
          this.view
        );
        EventManager.setupFilteringFormVisibilityOnClick(
          "utensils-button",
          "#utensils-form",
          "#utensils-svg",
          this.view
        );

        // Gestion de la récupération des différents textes de recherche
        const mainInput = document.getElementById("main-search-input");
        EventManager.addEvent(mainInput, "input", (e) => {
          this.stateManager.setSearchText("mainSearchText", e.target.value);
        });

        const ingredientsInput = document.getElementById("ingredients-input");
        EventManager.addEvent(ingredientsInput, "input", (e) => {
          this.stateManager.setSearchText(
            "ingredientsSearchText",
            e.target.value
          );
        });

        const appliancesInput = document.getElementById("appliances-input");
        EventManager.addEvent(appliancesInput, "input", (e) => {
          this.stateManager.setSearchText(
            "appliancesSearchText",
            e.target.value
          );
        });

        const utensilsInput = document.getElementById("utensils-input");
        EventManager.addEvent(utensilsInput, "input", (e) => {
          this.stateManager.setSearchText("utensilsSearchText", e.target.value);
        });

        // Enregistrer les listes d'ingrédients, appareils et ustensiles dans le modèle
        this.model.allIngredients = allIngredientsSet;
        this.model.allAppliances = allAppliancesSet;
        this.model.allUtensils = allUtensilsSet;
      });
    } catch (error) {
      console.error(
        "Erreur lors du rendu de la page d'accueil :",
        error.message
      );
    }
  }
}
