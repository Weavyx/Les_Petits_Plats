import { ObjectPool } from "../utils/ObjectPool.js";
import { TemplateCache } from "../utils/TemplateCache.js";
import { ComponentFactory } from "../utils/ComponentFactory.js";
import { EventDelegationSystem } from "../utils/EventDelegationSystem.js";
import { recipeCardTemplate } from "../components/RecipeCard.js";
import { filteringOptionTemplate } from "../components/FilteringOption.js";

/** * Classe de vue principale de l'application.
 * Gère l'affichage des recettes, des options de filtrage et des interactions utilisateur.
 * */
export class AppView {
  constructor() {
    if (AppView.instance) {
      return AppView.instance;
    }
    this.controller = null; // Instancié par le contrôleur
    this.appStateManager = null; // Instancié par le contrôleur
    this.objectPool = ObjectPool.getInstance();
    this.templateCache = TemplateCache.getInstance();
    this.eventDelegator = EventDelegationSystem.getInstance();

    // Cache pour les éléments fréquemment accédés
    this.elementCache = new Map();

    ComponentFactory.registerFactories({
      createRecipeCardElement: recipeCardTemplate,
      createFilteringOptionElement: filteringOptionTemplate,
      createSelectedFilteringOptionElement: filteringOptionTemplate,
      createfilteringOptionTag: filteringOptionTemplate,
    });

    AppView.instance = this;
  }
  getIngredientsContainer() {
    return this.getCachedElement("ingredients-container");
  }
  getAppliancesContainer() {
    return this.getCachedElement("appliances-container");
  }
  getUtensilsContainer() {
    return this.getCachedElement("utensils-container");
  }

  getInputById(id) {
    return this.getCachedElement(id);
  }

  getCachedElement(id) {
    if (!this.elementCache.has(id)) {
      const element = document.getElementById(id);
      if (element) {
        this.elementCache.set(id, element);
      }
      return element;
    }
    return this.elementCache.get(id);
  }

  // Méthode pour nettoyer le cache d'éléments
  clearElementCache() {
    this.elementCache.clear();
  }

  // Méthode pour précharger les éléments fréquemment utilisés
  preloadElements() {
    const frequentIds = [
      "recipes-container",
      "ingredients-container",
      "appliances-container",
      "utensils-container",
      "main-search-input",
      "search-tag-container",
    ];

    frequentIds.forEach((id) => {
      this.getCachedElement(id);
    });
  }

  displayRecipeCard(recipe, containerElement) {
    let recipeCardElement = ComponentFactory.create(
      "createRecipeCardElement",
      recipe
    ).createRecipeCardElement();

    containerElement.appendChild(recipeCardElement);

    UIEventHandler.attachEventListener(recipeCardElement, "click", () => {
      this.toggleRecipeDetailsVisibility(recipeCardElement);
    });
  }
  displayFilteringOptions(options, container, type) {
    container.innerHTML = "";

    // Optimisation : utiliser requestAnimationFrame pour les grandes listes
    if (options.length > 50) {
      this.renderFilterOptionsInBatches(container, options, type);
    } else {
      this.renderFilterOptionsTraditional(container, options, type);
    }
  }

  renderFilterOptionsInBatches(container, options, type, batchSize = 20) {
    let index = 0;

    const processBatch = () => {
      const fragment = document.createDocumentFragment();
      const endIndex = Math.min(index + batchSize, options.length);

      for (let i = index; i < endIndex; i++) {
        const filteringOption = options[i];
        const filteringElement = this.createOptimizedFilterOption(
          filteringOption,
          type
        );
        fragment.appendChild(filteringElement);
      }

      container.appendChild(fragment);
      index = endIndex;

      if (index < options.length) {
        requestAnimationFrame(processBatch);
      }
    };

    requestAnimationFrame(processBatch);
  }

  renderFilterOptionsTraditional(container, options, type) {
    const fragment = document.createDocumentFragment();
    options.forEach((filteringOption) => {
      const filteringElement = this.createOptimizedFilterOption(
        filteringOption,
        type
      );
      fragment.appendChild(filteringElement);
    });
    container.appendChild(fragment);
  }

  createOptimizedFilterOption(filteringOption, type) {
    // Vérifier le cache
    const cached = this.templateCache.get("filterOption", filteringOption);
    if (cached) {
      return cached;
    }

    // Créer un nouvel élément
    const filteringElement = ComponentFactory.create(
      "createFilteringOptionElement",
      filteringOption
    ).createFilteringOptionElement();

    // Ajouter des attributs pour l'event delegation
    filteringElement.classList.add("filter-option");
    filteringElement.dataset.filterType = type;
    filteringElement.dataset.filterValue = filteringOption;
    filteringElement.dataset.clickHandler = "selectFilter"; // Mettre en cache
    this.templateCache.set("filterOption", filteringOption, filteringElement);
    return filteringElement;
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

    // Priorité JavaScript : contrôle total via l'EventManager optimisé
    this.animateRecipeDescriptionToggle(
      recipeCardDescriptionElement,
      recipeCardIngredientsContainerElement
    );
  }

  /**
   * Gère les animations des cartes de recettes via JavaScript pur
   * Remplace les animations CSS pour un contrôle total
   */
  animateRecipeDescriptionToggle(descriptionElement, ingredientsElement) {
    // Vérifier si une animation est déjà en cours
    if (descriptionElement.dataset.animating === "true") {
      return; // Éviter les animations simultanées
    }

    const isExpanded = !descriptionElement.classList.contains("shortened");

    // Marquer le début de l'animation
    descriptionElement.dataset.animating = "true";

    if (isExpanded) {
      // Rétracter la description
      this.animateDescriptionShrink(descriptionElement);
      this.animateElementFadeIn(ingredientsElement);
      descriptionElement.classList.add("shortened");
    } else {
      // Étendre la description
      this.animateDescriptionGrow(descriptionElement);
      this.animateElementFadeOut(ingredientsElement);
      descriptionElement.classList.remove("shortened");
    }

    // Libérer le verrou d'animation après la fin des transitions
    setTimeout(() => {
      descriptionElement.dataset.animating = "false";
    }, 1850); // 1850ms pour couvrir la durée de l'animation la plus longue
  }

  /**
   * Animation JavaScript pour l'expansion de la description
   */
  animateDescriptionGrow(element) {
    const startHeight = 76;
    const endHeight = 298;

    // Réinitialiser l'état
    element.style.transition = "none";
    element.style.height = `${startHeight}px`;
    element.style.webkitLineClamp = "4";

    // Forcer un reflow pour appliquer les changements immédiats
    element.offsetHeight;

    // Démarrer l'animation après un petit délai
    setTimeout(() => {
      element.style.transition = `height 1s ease-in-out, -webkit-line-clamp 1s ease-in-out`;
      element.style.height = `${endHeight}px`;
      element.style.webkitLineClamp = "17";
    }, 50);
  }

  /**
   * Animation JavaScript pour la rétraction de la description
   */
  animateDescriptionShrink(element) {
    const startHeight = 298;
    const endHeight = 76;

    // Réinitialiser l'état
    element.style.transition = "none";
    element.style.height = `${startHeight}px`;
    element.style.webkitLineClamp = "17";

    // Forcer un reflow
    element.offsetHeight;

    // Démarrer l'animation immédiatement
    requestAnimationFrame(() => {
      element.style.transition = `height 1s ease-in-out, -webkit-line-clamp 1s ease-in-out`;
      element.style.height = `${endHeight}px`;
      element.style.webkitLineClamp = "4";
    });
  }

  /**
   * Animation JavaScript pour le fade out
   */
  animateElementFadeOut(element) {
    element.style.transition = "opacity 0.4s ease-out";
    element.style.opacity = "1";

    requestAnimationFrame(() => {
      element.style.opacity = "0";
      setTimeout(() => {
        element.style.display = "none";
      }, 1000);
    });
  }

  /**
   * Animation JavaScript pour le fade in
   */
  animateElementFadeIn(element) {
    element.style.display = "block";
    element.style.transition = "0.1s opacity 0.5s ease-in";
    element.style.opacity = "0";

    setTimeout(() => {
      element.style.opacity = "1";
    }, 500); // délai de 0.5s avant de commencer le fade in
  }

  updateRecipeCount(recipeCounter) {
    const recipesNumberElement = document.getElementById("recipes-number");
    recipesNumberElement.textContent = `${recipeCounter}`;
  }
  renderRecipes(recipes) {
    const recipeCardsContainer = this.getCachedElement("recipes-container");
    this.renderRecipesTraditional(recipeCardsContainer, recipes);
    this.updateRecipeCount(recipes.length);
  }
  renderRecipesTraditional(container, recipes) {
    container.innerHTML = ""; // Vider le conteneur avant d'ajouter les nouvelles recettes

    if (recipes.length === 0) {
      this.displayNoRecipesMessage(container);
      return;
    }

    // Rendu traditionnel avec DocumentFragment
    const fragment = document.createDocumentFragment();
    recipes.forEach((recipe) => {
      const card = this.createOptimizedRecipeCard(recipe);
      fragment.appendChild(card);
    });
    container.appendChild(fragment);
  }

  createOptimizedRecipeCard(recipe) {
    // Vérifier le cache de templates
    const cached = this.templateCache.get("recipeCard", recipe);
    if (cached) {
      return cached;
    }

    // Créer une nouvelle carte
    const card = ComponentFactory.create(
      "createRecipeCardElement",
      recipe
    ).createRecipeCardElement();

    // Ajouter des attributs pour l'event delegation
    card.classList.add("recipe-card");
    card.dataset.recipeId = recipe.id;
    card.dataset.clickHandler = "toggleRecipeDetails";

    // Mettre en cache
    this.templateCache.set("recipeCard", recipe, card);
    return card;
  }

  displayNoRecipesMessage(container) {
    const messageElement = this.objectPool.getElement(
      "div",
      "no-recipes-message"
    );

    // Récupérer le terme de recherche depuis le StateManager
    let searchTerm = "";
    if (this.controller && this.controller.appStateManager) {
      searchTerm = this.controller.appStateManager.mainSearchQuery;
    }

    // Construire le message en fonction de la présence d'un terme de recherche
    let mainMessage, suggestionMessage;

    if (searchTerm && searchTerm.length >= 3) {
      mainMessage = `Aucune recette ne contient « ${searchTerm} »`;
      suggestionMessage = `Vous pouvez chercher « tarte aux pommes », « poisson », etc.`;
    } else {
      mainMessage = "Aucune recette trouvée";
      suggestionMessage = "Essayez de modifier vos critères de recherche";
    }

    messageElement.innerHTML = `
                    <div class="text-center py-8">
                        <p class="text-gray-500 text-lg">${mainMessage}</p>
                        <p class="text-gray-400 text-sm mt-2">${suggestionMessage}</p>
                    </div>
                `;
    container.appendChild(messageElement);
  }

  displayFilterTag(filteringOption) {
    // Récupérer l'élément de conteneur de tags sélectionnés du formulaire
    const searchTagContainerElement = document.getElementById(
      "search-tag-container"
    );

    // Créer un élément de tag de filtrage et l'ajouter au conteneur de tags sélectionnés du formulaire
    const filteringOptionTag = ComponentFactory.create(
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
    const selectedFilteringFormElement = ComponentFactory.create(
      "createSelectedFilteringOptionElement",
      filteringOption
    ).createSelectedFilteringOptionElement();

    selectedFilteringContainerElement.appendChild(selectedFilteringFormElement);

    return selectedFilteringFormElement;
  }

  /**
   * Met à jour l'état d'affichage du bouton d'effacement et de l'icône de recherche pour un champ donné.
   * Ajoute dynamiquement l'écouteur de reset approprié.
   * @param {HTMLInputElement} input - L'input concerné.
   * @param {string} eraseButtonId - L'id du bouton d'effacement.
   * @param {string} searchIconId - L'id de l'icône de recherche (peut être null).
   */
  updateEraseButtonState(input, eraseButtonId, searchIconId = null) {
    const eraseButtonElement = document.getElementById(eraseButtonId);
    const searchIconElement = searchIconId
      ? document.getElementById(searchIconId)
      : null;
    const hasValue = input.value.length > 0;

    // Pour le bouton de reset principal, vérifier aussi s'il y a des filtres actifs
    const hasActiveFilters =
      eraseButtonId === "main-delete-search-icon" &&
      this.controller &&
      this.controller.appStateManager &&
      this.controller.appStateManager.activeFilters.size > 0;

    const shouldShowButton = hasValue || hasActiveFilters;

    // Nettoyage de l'ancien écouteur
    if (eraseButtonElement._eraseListener) {
      eraseButtonElement.removeEventListener(
        "click",
        eraseButtonElement._eraseListener
      );
      eraseButtonElement._eraseListener = null;
    }

    if (shouldShowButton) {
      eraseButtonElement.classList.remove("hidden");
      if (searchIconElement) searchIconElement.classList.add("hidden");
      // Ajout du bon comportement selon le champ
      let listener;
      if (eraseButtonId === "main-delete-search-icon") {
        listener = (e) => {
          this.controller.resetApplicationState();
          eraseButtonElement.classList.add("hidden");
        };
      } else {
        listener = (e) => {
          input.value = "";
          input.dispatchEvent(new Event("input"));
          eraseButtonElement.classList.add("hidden");
        };
      }
      eraseButtonElement.addEventListener("click", listener);
      eraseButtonElement._eraseListener = listener;
    } else {
      eraseButtonElement.classList.add("hidden");
      if (searchIconElement) searchIconElement.classList.remove("hidden");
    }
  }

  /**
   * Met à jour spécifiquement l'état du bouton de reset principal en tenant compte des filtres actifs
   */
  updateMainResetButtonState() {
    const mainInput = document.getElementById("main-search-input");
    if (mainInput) {
      this.updateEraseButtonState(mainInput, "main-delete-search-icon");
    }
  }

  removeAllTags() {
    const searchTagContainerElement = document.getElementById(
      "search-tag-container"
    );
    const ingredientTagsContainerElement = document.getElementById(
      "ingredient-tags-container"
    );
    const applianceTagsContainerElement = document.getElementById(
      "appliance-tags-container"
    );
    const utensilTagsContainerElement = document.getElementById(
      "utensil-tags-container"
    );
    searchTagContainerElement.innerHTML = "";
    ingredientTagsContainerElement.innerHTML = "";
    applianceTagsContainerElement.innerHTML = "";
    utensilTagsContainerElement.innerHTML = "";
  }
}
