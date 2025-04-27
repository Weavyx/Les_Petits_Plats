import { TemplateManager } from "../utils/TemplateManager.js";
import { recipeCardTemplate } from "./templates/recipeCardTemplate.js";
import { filteringOptionTemplate } from "./templates/filteringOptionTemplate.js";

export class AppView {
  constructor() {
    if (AppView.instance) {
      return AppView.instance;
    }
    const templateManager = new TemplateManager();
    templateManager.registerFactory(
      "createRecipeCardElement",
      recipeCardTemplate
    );
    templateManager.registerFactory(
      "createFilteringOptionElement",
      filteringOptionTemplate
    );
    templateManager.registerFactory(
      "createSelectedFilteringOptionElement",
      filteringOptionTemplate
    );
    templateManager.registerFactory(
      "createfilteringOptionTag",
      filteringOptionTemplate
    );
    AppView.instance = this;
    this.templateManager = templateManager;
    this.eventManager = null; // Placeholder pour l'instance d'EventManager
  }

  renderRecipeCard(recipe, containerElement) {
    const recipeCardElement = containerElement.appendChild(
      this.templateManager
        .create("createRecipeCardElement", recipe)
        .createRecipeCardElement()
    );
    this.eventManager.addEvent(recipeCardElement, "click", () => {
      this.toggleRecipeVisibility(recipeCardElement);
    });
  }

  handleFilteringOptionClick(e, filteringOption) {
    const searchTagContainerElement = document.getElementById(
      "search-tag-container"
    );

    const filteringOptionTag = this.templateManager
      .create("createfilteringOptionTag", filteringOption)
      .createFilteringOptionTag();

    searchTagContainerElement.appendChild(filteringOptionTag);

    const selectedFilteringOptionContainerFormElement =
      e.target.parentNode.parentNode.firstElementChild;

    const selectedfilteringFormElement = this.templateManager
      .create("createSelectedFilteringOptionElement", filteringOption)
      .createSelectedFilteringOptionElement();

    selectedFilteringOptionContainerFormElement.appendChild(
      selectedfilteringFormElement
    );

    e.target.classList.add("hidden");

    this.eventManager.addEvent(filteringOptionTag, "click", (e) => {
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
    });

    this.eventManager.addEvent(selectedfilteringFormElement, "click", (e) => {
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
    });
  }

  renderFilteringOptions(filteringOptions, containerElement) {
    containerElement.innerHTML = "";
    const fragment = document.createDocumentFragment();

    filteringOptions.forEach((filteringOption) => {
      const filteringElement = this.templateManager
        .create("createFilteringOptionElement", filteringOption)
        .createFilteringOptionElement();
      this.eventManager.addEvent(filteringElement, "click", (e) => {
        this.handleFilteringOptionClick(e, filteringOption);
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
    console.log(recipeCardElement);
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
}
