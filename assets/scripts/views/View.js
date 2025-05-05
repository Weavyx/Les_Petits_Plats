import { TemplateManager } from "../utils/TemplateManager.js";
import { recipeCardTemplate } from "./templates/recipeCardTemplate.js";
import { filteringOptionTemplate } from "./templates/filteringOptionTemplate.js";
import { EventManager } from "../utils/EventManager.js";

export class AppView {
  constructor() {
    if (AppView.instance) {
      return AppView.instance;

      this.stateManager = null; // Instancié par le contrôleur
    }

    TemplateManager.registerFactories({
      createRecipeCardElement: recipeCardTemplate,
      createFilteringOptionElement: filteringOptionTemplate,
      createSelectedFilteringOptionElement: filteringOptionTemplate,
      createfilteringOptionTag: filteringOptionTemplate,
    });

    AppView.instance = this;
  }

  renderRecipeCard(recipe, containerElement) {
    const recipeCardElement = containerElement.appendChild(
      TemplateManager.create(
        "createRecipeCardElement",
        recipe
      ).createRecipeCardElement()
    );

    EventManager.addEvent(recipeCardElement, "click", () => {
      this.toggleRecipeVisibility(recipeCardElement);
    });
  }

  handleFilteringOptionClick(e, filteringOption, key) {
    // Ajouter l'option de filtrage sélectionnée à l'état de l'application
    switch (key) {
      case "ingredients":
        if (!this.stateManager.selectedIngredients.includes(filteringOption)) {
          this.stateManager.selectedIngredients.push(filteringOption);
        }
        break;
      case "appliances":
        if (!this.stateManager.selectedAppliances.includes(filteringOption)) {
          this.stateManager.selectedAppliances.push(filteringOption);
        }
        break;
      case "utensils":
        if (!this.stateManager.selectedUtensils.includes(filteringOption)) {
          this.stateManager.selectedUtensils.push(filteringOption);
        }
        break;
      default:
        console.warn(`Clé inconnue pour filteringOptionType : ${key}`);
        return;
    }

    //  Mettre à jour les recettes en fonction du nouveau filtre

    // Récupérer l'ensemble des recettes qui contiennent l'entièreté des filtres
    const filteredRecipes = this.stateManager.getRecipesFromFilters();
    // Rendre les recettes filtrées
    this.renderRecipes(filteredRecipes);

    // Récupérer l'élément de conteneur de tags sélectionnés du formulaire
    const searchTagContainerElement = document.getElementById(
      "search-tag-container"
    );

    // Créer un élément de tag de filtrage et l'ajouter au conteneur de tags sélectionnés du formulaire
    const filteringOptionTag = TemplateManager.create(
      "createfilteringOptionTag",
      filteringOption
    ).createFilteringOptionTag();

    searchTagContainerElement.appendChild(filteringOptionTag);

    // Récupérer l'élément de conteneur de tags sélectionnés du formulaire
    const selectedFilteringOptionContainerFormElement =
      e.target.parentNode.parentNode.firstElementChild;

    // Créer un élément de filtrage sélectionné et l'ajouter au conteneur de tags sélectionnés du formulaire
    const selectedfilteringFormElement = TemplateManager.create(
      "createSelectedFilteringOptionElement",
      filteringOption
    ).createSelectedFilteringOptionElement();

    selectedFilteringOptionContainerFormElement.appendChild(
      selectedfilteringFormElement
    );

    e.target.classList.add("hidden");

    // Ajouter un événement de clic sur le tag de filtrage pour le supprimer (dans la liste d'options aussi)
    EventManager.addEvent(filteringOptionTag, "click", (e) => {
      // Supprimer l'élément de filtrage dans le conteneur de tags sélectionnés du formulaire
      searchTagContainerElement.removeChild(filteringOptionTag);

      // Réafficher l'élément de filtrage dans le conteneur de filtrage
      const filteringOptionElement = Array.from(
        selectedfilteringFormElement.parentNode.parentNode.parentNode.lastElementChild.lastElementChild.querySelectorAll(
          "p"
        )
      ).find((p) => p.textContent.includes(filteringOption));

      filteringOptionElement.classList.remove("hidden");

      // Supprimer le tag de filtrage dans le conteneur de tags sélectionnés
      selectedFilteringOptionContainerFormElement.removeChild(
        selectedfilteringFormElement
      );

      // Supprimer l'élément de filtrage sélectionné dans les données de l'application
      switch (key) {
        case "ingredients":
          this.stateManager.selectedIngredients =
            this.stateManager.selectedIngredients.filter(
              (item) => item !== filteringOption
            );
          break;
        case "appliances":
          this.stateManager.selectedAppliances =
            this.stateManager.selectedAppliances.filter(
              (item) => item !== filteringOption
            );
          break;
        case "utensils":
          this.stateManager.selectedUtensils =
            this.stateManager.selectedUtensils.filter(
              (item) => item !== filteringOption
            );
          break;
        default:
          console.warn(`Clé inconnue pour filteringOptionType : ${key}`);
          return;
      }
    });

    // Ajouter un événement de clic sur l'élément de filtrage sélectionné pour le supprimer (dans la liste de tags aussi)
    EventManager.addEvent(selectedfilteringFormElement, "click", (e) => {
      // Réafficher l'élément de filtrage dans le conteneur de filtrage
      const filteringOptionElement = Array.from(
        selectedfilteringFormElement.parentNode.parentNode.lastElementChild.querySelectorAll(
          "p"
        )
      ).find((p) => p.textContent.includes(filteringOption));

      filteringOptionElement.classList.remove("hidden");

      // Supprimer un élément de filtrage dans le conteneur de tags sélectionnés du formulaire
      selectedFilteringOptionContainerFormElement.removeChild(
        selectedfilteringFormElement
      );

      // Supprimer le tag de filtrage dans le conteneur de tags sélectionnés
      const searchTagContainerElement = document.getElementById(
        "search-tag-container"
      );
      const filteringOptionTag = Array.from(
        searchTagContainerElement.querySelectorAll("p")
      ).find((p) => p.textContent.includes(filteringOption));

      searchTagContainerElement.removeChild(filteringOptionTag);

      // Supprimer l'élément de filtrage sélectionné dans les données de l'application
      switch (key) {
        case "ingredients":
          this.stateManager.selectedIngredients =
            this.stateManager.selectedIngredients.filter(
              (item) => item !== filteringOption
            );
          break;
        case "appliances":
          this.stateManager.selectedAppliances =
            this.stateManager.selectedAppliances.filter(
              (item) => item !== filteringOption
            );
          break;
        case "utensils":
          this.stateManager.selectedUtensils =
            this.stateManager.selectedUtensils.filter(
              (item) => item !== filteringOption
            );
          break;
        default:
          console.warn(`Clé inconnue pour filteringOptionType : ${key}`);
          return;
      }
    });
  }

  renderFilteringOptions(filteringOptions, containerElement, key) {
    containerElement.innerHTML = "";
    const fragment = document.createDocumentFragment();

    filteringOptions.forEach((filteringOption) => {
      const filteringElement = TemplateManager.create(
        "createFilteringOptionElement",
        filteringOption
      ).createFilteringOptionElement();
      EventManager.addEvent(filteringElement, "click", (e) => {
        this.handleFilteringOptionClick(e, filteringOption, key);
      });
      fragment.appendChild(filteringElement);
    });

    containerElement.appendChild(fragment);
  }

  toggleFilteringFormVisibility(butttonElement, formElement, svgElement) {
    const toggleVisibility = () => {
      formElement.classList.toggle("hidden");
      butttonElement.classList.toggle("rounded-b-[0]");
      svgElement.classList.toggle("rotate-180");
    };

    const handleClickOutside = (event) => {
      if (
        !formElement.contains(event.target) &&
        !butttonElement.contains(event.target)
      ) {
        formElement.classList.add("hidden");
        butttonElement.classList.remove("rounded-b-[0]");
        svgElement.classList.remove("rotate-180");
        document.removeEventListener("click", handleClickOutside);
      }
    };

    toggleVisibility();

    if (!formElement.classList.contains("hidden")) {
      document.addEventListener("click", handleClickOutside);
    }
  }

  toggleRecipeVisibility(recipeCardElement) {
    const recipeCardDescriptionElement = recipeCardElement.querySelector(
      "#recipe-card-description"
    );
    const recipeCardIngredientsContainerElement =
      recipeCardElement.querySelector("#recipe-card-ingredients-container");

    if (recipeCardDescriptionElement.classList.contains("shortened")) {
      recipeCardDescriptionElement.classList.toggle("shortened");

      recipeCardDescriptionElement.classList.toggle(
        "animate-recipeDescriptionGrow"
      );
      recipeCardIngredientsContainerElement.classList.toggle("animate-fadeOut");
    } else {
      recipeCardDescriptionElement.classList.toggle(
        "animate-recipeDescriptionShrink"
      );
      recipeCardIngredientsContainerElement.classList.toggle("animate-fadeIn");
    }
  }

  renderRecipesNumber(recipeCounter) {
    const recipesNumberElement = document.getElementById("recipes-number");
    recipesNumberElement.textContent = `${recipeCounter}`;
  }

  renderRecipes(recipes) {
    const recipeCardsContainer = document.getElementById("recipes-container");
    recipeCardsContainer.innerHTML = ""; // Vider le conteneur avant d'ajouter les nouvelles recettes

    recipes.forEach((recipe) => {
      this.renderRecipeCard(recipe, recipeCardsContainer);
    });

    this.renderRecipesNumber(recipes.length);
  }
}
