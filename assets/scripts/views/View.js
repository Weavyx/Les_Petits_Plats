import { TemplateManager } from "../utils/TemplateManager.js";
import { recipeCardTemplate } from "./templates/recipeCardTemplate.js";
import { filteringOptionTemplate } from "./templates/filteringOptionTemplate.js";
import { EventManager } from "../utils/EventManager.js";

export class AppView {
  constructor() {
    if (AppView.instance) {
      return AppView.instance;
    }
    this.controller = null; // Instancié par le contrôleur
    this.appStateManager = null; // Instancié par le contrôleur

    TemplateManager.registerFactories({
      createRecipeCardElement: recipeCardTemplate,
      createFilteringOptionElement: filteringOptionTemplate,
      createSelectedFilteringOptionElement: filteringOptionTemplate,
      createfilteringOptionTag: filteringOptionTemplate,
    });

    AppView.instance = this;
  }

  displayRecipeCard(recipe, containerElement) {
    let recipeCardElement = TemplateManager.create(
      "createRecipeCardElement",
      recipe
    ).createRecipeCardElement();

    containerElement.appendChild(recipeCardElement);

    EventManager.attachEventListener(recipeCardElement, "click", () => {
      this.toggleRecipeDetailsVisibility(recipeCardElement);
    });
  }

  displayFilteringOptions(options, container, type) {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    // Remplir le conteneur avec les options de filtrage
    for (let i = 0; i < options.length; i++) {
      const filteringOption = options[i];
      // Créer un élément de filtrage
      const filteringElement = TemplateManager.create(
        "createFilteringOptionElement",
        filteringOption
      ).createFilteringOptionElement();

      // Ajouter un événement de clic sur l'élément de filtrage
      filteringElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Empêcher la propagation de l'événement

        EventManager.handleFilterOptionClick(
          filteringElement,
          filteringOption,
          this,
          this.appStateManager,
          this.controller,
          type
        );
      });

      // Ajouter l'élément de filtrage au fragment
      fragment.appendChild(filteringElement);
    }

    // Ajouter le fragment au conteneur
    container.appendChild(fragment);
  }

  toggleFilterFormVisibility(buttonElement, formElement, svgElement) {
    // Logique pour basculer la visibilité du formulaire
    const isVisible = !formElement.classList.contains("hidden");

    formElement.classList.toggle("hidden", isVisible);
    buttonElement.classList.toggle("rounded-[11px]", isVisible);
    buttonElement.classList.toggle("rounded-t-[11px]", !isVisible);
    svgElement.classList.toggle("rotate-180", !isVisible);
  }

  toggleRecipeDetailsVisibility(recipeCardElement) {
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

  updateRecipeCount(recipeCounter) {
    const recipesNumberElement = document.getElementById("recipes-number");
    recipesNumberElement.textContent = `${recipeCounter}`;
  }

  renderRecipes(recipes) {
    const recipeCardsContainer = document.getElementById("recipes-container");
    recipeCardsContainer.innerHTML = ""; // Vider le conteneur avant d'ajouter les nouvelles recettes

    for (let i = 0; i < recipes.length; i++) {
      this.displayRecipeCard(recipes[i], recipeCardsContainer);
    }

    this.updateRecipeCount(recipes.length);
  }

  displayFilterTag(filteringOption) {
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

    return filteringOptionTag;
  }

  displaySelectedFilterElement(
    filteringOption,
    selectedFilteringContainerElement
  ) {
    // Créer un élément de filtrage sélectionné et l'ajouter au conteneur de tags sélectionnés du formulaire
    const selectedFilteringFormElement = TemplateManager.create(
      "createSelectedFilteringOptionElement",
      filteringOption
    ).createSelectedFilteringOptionElement();

    selectedFilteringContainerElement.appendChild(selectedFilteringFormElement);

    return selectedFilteringFormElement;
  }

  toggleEraseButtonVisibility(isToShow, searchIcon, eraseButton, input) {
    const searchIconElement = document.getElementById(searchIcon);
    const eraseButtonElement = document.getElementById(eraseButton);
    if (isToShow) {
      searchIconElement.classList.add("hidden");
      eraseButtonElement.classList.remove("hidden");
      EventManager.attachEventListener(eraseButtonElement, "click", () => {
        EventManager.handleEraseButtonClick(input, this.controller, searchIcon);
      });
    } else {
      searchIconElement.classList.remove("hidden");
      eraseButtonElement.classList.add("hidden");
      EventManager.detachEventListener(eraseButtonElement, "click");
    }
  }
}
