export class StateManager {
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }
    this.model = null; // Instancié par le contrôleur
    this.view = null; // Instancié par le contrôleur

    this.MainSearchInput = document.getElementById("main-search-input");
    this.IngredientsSearchInput = document.getElementById("ingredients-input");
    this.AppliancesSearchInput = document.getElementById("appliances-input");
    this.UtensilsSearchInput = document.getElementById("utensils-input");

    this.mainSearchText = ""; // Texte dans le champ de recherche

    this.ingredientsSearchText = ""; // Texte dans le champ de recherche des ingrédients
    this.appliancesSearchText = ""; // Texte dans le champ de recherche des appareils
    this.utensilsSearchText = ""; // Texte dans le champ de recherche des ustensiles

    this.selectedIngredients = []; // Liste des ingrédients sélectionnés
    this.selectedAppliances = []; // Liste des appareils sélectionnés
    this.selectedUtensils = []; // Liste des ustensiles sélectionnés

    StateManager.instance = this;
  }

  setSearchText(key, value) {
    let filteredOptions = [];

    switch (key) {
      case "mainSearchText":
        this.mainSearchText = value;
        break;
      case "ingredientsSearchText":
        this.ingredientsSearchText = value;
        // Filtrer les ingrédients en fonction de la recherche
        filteredOptions = [...this.model.allIngredients].filter((ingredient) =>
          ingredient.includes(value.toLowerCase())
        );
        this.updateFilteringOptions("ingredients", filteredOptions);

        this.selectedIngredients = filteredOptions; // Mettre à jour la liste des ingrédients sélectionnés
        break;
      case "appliancesSearchText":
        this.appliancesSearchText = value;
        // Filtrer les appareils en fonction de la recherche
        filteredOptions = [...this.model.allAppliances].filter((appliance) =>
          appliance.includes(value.toLowerCase())
        );
        this.updateFilteringOptions("appliances", filteredOptions);

        this.selectedAppliances = filteredOptions; // Mettre à jour la liste des appareils sélectionnés
        break;
      case "utensilsSearchText":
        this.utensilsSearchText = value;
        // Filtrer les ustensiles en fonction de la recherche
        filteredOptions = [...this.model.allUtensils].filter((utensil) =>
          utensil.includes(value.toLowerCase())
        );
        this.updateFilteringOptions("utensils", filteredOptions);

        this.selectedUtensils = filteredOptions; // Mettre à jour la liste des ustensiles sélectionnés
        break;
      default:
        console.warn(`Clé de recherche inconnue : ${key}`);
    }
  }

  updateFilteringOptions(key, options) {
    let optionsContainer = null;

    switch (key) {
      case "ingredients":
        optionsContainer = document.getElementById("ingredients-container");
        break;
      case "appliances":
        optionsContainer = document.getElementById("appliances-container");
        break;
      case "utensils":
        optionsContainer = document.getElementById("utensils-container");
        break;
      default:
        console.warn(`Clé inconnue pour updateFilteringOptions : ${key}`);
        return;
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = ""; // Vider le conteneur avant d'ajouter les nouvelles options
      this.view.renderFilteringOptions(options, optionsContainer);
    }
  }

  resetState() {
    this.searchText = "";
    this.selectedIngredients = [];
    this.selectedAppliances = [];
    this.selectedUtensils = [];
  }

  getRecipesFromFilters() {
    const filteredRecipes = new Set();

    this.selectedIngredients.forEach((selectedIngredient) => {
      const recipesByIngredient =
        this.model.allRecipesByIngredient[selectedIngredient];
      if (recipesByIngredient) {
        recipesByIngredient.forEach((recipe) => {
          filteredRecipes.add(recipe);
        });
      }
    });

    this.selectedAppliances.forEach((selectedAppliance) => {
      const recipesByAppliance =
        this.model.allRecipesByAppliance[selectedAppliance];
      if (recipesByAppliance) {
        recipesByAppliance.forEach((recipe) => {
          filteredRecipes.add(recipe);
        });
      }
    });

    this.selectedUtensils.forEach((selectedUtensil) => {
      const recipesByUtensil = this.model.allRecipesByUtensil[selectedUtensil];
      if (recipesByUtensil) {
        recipesByUtensil.forEach((recipe) => {
          filteredRecipes.add(recipe);
        });
      }
    });

    return Array.from(filteredRecipes);
  }
}
