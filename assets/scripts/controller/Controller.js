export class AppController {
  constructor(model, view, stateManager, eventManager) {
    if (AppController.instance) {
      return AppController.instance;
    }
    this.model = model;
    this.view = view;
    this.stateManager = stateManager;
    this.eventManager = eventManager;

    this.eventManager.view = this.view; // Passer la vue à l'EventManager
    this.view.eventManager = this.eventManager; // Passer l'EventManager à la vue

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

        let recipeCounter = 0; // Compteur de recettes

        recipes.forEach((recipe) => {
          this.view.renderRecipeCard(recipe, recipeCardsContainer);

          // Remplir les listes d'ingrédients, appareils et ustensiles
          recipe.ingredients.forEach((ingredient) => {
            allIngredientsSet.add(ingredient.ingredient);
          });
          allAppliancesSet.add(recipe.appliance);

          recipe.ustensils.forEach((utensil) => {
            allUtensilsSet.add(utensil);
          });

          recipeCounter++; // Incrémenter le compteur de recettes
        });

        const allIngredientsArray = Array.from(allIngredientsSet);
        const allAppliancesArray = Array.from(allAppliancesSet);
        const allUtensilsArray = Array.from(allUtensilsSet);

        const ingredientOptionsContainer = document.getElementById(
          "ingredients-container"
        );

        this.view.renderFilteringOptions(
          allIngredientsArray,
          ingredientOptionsContainer
        );

        const appliancesOptionsContainer = document.getElementById(
          "appliances-container"
        );
        this.view.renderFilteringOptions(
          allAppliancesArray,
          appliancesOptionsContainer
        );

        const utensilsOptionsContainer =
          document.getElementById("utensils-container");
        this.view.renderFilteringOptions(
          allUtensilsArray,
          utensilsOptionsContainer
        );

        // Appliquer les événements
        // Ouverture et fermeture des formulaires de filtrage
        const ingredientsButton = document.getElementById("ingredients-button");
        const ingredientForm =
          ingredientsButton.parentNode.querySelector("#ingredients-form");
        const ingredientsSVG =
          ingredientsButton.querySelector("#ingredients-svg");
        this.eventManager.addEvent(ingredientsButton, "click", () => {
          this.view.toggleFilteringFormVisibility(
            ingredientsButton,
            ingredientForm,
            ingredientsSVG
          );
        });

        const appliancesButton = document.getElementById("appliances-button");
        const appliancesForm =
          appliancesButton.parentNode.querySelector("#appliances-form");
        const appliancesSVG = appliancesButton.querySelector("#appliances-svg");
        this.eventManager.addEvent(appliancesButton, "click", () => {
          this.view.toggleFilteringFormVisibility(
            appliancesButton,
            appliancesForm,
            appliancesSVG
          );
        });

        const utensilsButton = document.getElementById("utensils-button");
        const utensilsForm =
          utensilsButton.parentNode.querySelector("#utensils-form");
        const utensilsSVG = utensilsButton.querySelector("#utensils-svg");
        this.eventManager.addEvent(utensilsButton, "click", () => {
          this.view.toggleFilteringFormVisibility(
            utensilsButton,
            utensilsForm,
            utensilsSVG
          );
        });

        // Nombre de recettes
        const recipesNumberElement = document.getElementById("recipes-number");
        recipesNumberElement.textContent = `${recipeCounter}`;
        // à supprimer si jamais utilisés
        this.model.allIngredients = allIngredientsArray;
        this.model.allAppliances = allAppliancesArray;
        this.model.allUtensils = allUtensilsArray;
      });
    } catch (error) {
      console.error(
        "Erreur lors du rendu de la page d'accueil :",
        error.message
      );
    }
  }
}
