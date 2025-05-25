import { AppView } from "../views/AppView.js";
import { RecipeAppController } from "../controllers/RecipeAppController.js";
import { SearchAndFilterStateManager } from "../state/SearchAndFilterStateManager.js";
import { UIEventHandler } from "../utils/UIEventHandler.js";

/**
 * Système de délégation d'événements optimisé pour les performances.
 * Gère la propagation et la capture d'événements de manière centralisée.
 */
export class EventDelegationSystem {
  constructor() {
    this.delegatedEvents = new Map();
    this.setupGlobalDelegation();
  }

  static getInstance() {
    if (!EventDelegationSystem.instance) {
      EventDelegationSystem.instance = new EventDelegationSystem();
    }
    return EventDelegationSystem.instance;
  }

  setupGlobalDelegation() {
    // Délégation pour les clics
    document.addEventListener(
      "click",
      (e) => {
        this.handleDelegatedEvent("click", e);
      },
      { passive: false }
    );

    // Délégation pour les changements d'input
    document.addEventListener(
      "input",
      (e) => {
        this.handleDelegatedEvent("input", e);
      },
      { passive: true }
    );

    // Délégation pour les focus/blur
    document.addEventListener(
      "focusin",
      (e) => {
        this.handleDelegatedEvent("focusin", e);
      },
      { passive: true }
    );

    document.addEventListener(
      "focusout",
      (e) => {
        this.handleDelegatedEvent("focusout", e);
      },
      { passive: true }
    );
  }

  handleDelegatedEvent(eventType, event) {
    let target = event.target;

    // Remonter dans l'arbre DOM pour trouver un élément avec un handler
    while (target && target !== document) {
      const handlers = this.getHandlersForElement(target, eventType);
      if (handlers.length > 0) {
        handlers.forEach((handler) => {
          try {
            // Utiliser le contexte correct pour les handlers
            if (typeof handler === "function") {
              handler.call(this, event);
            }
          } catch (error) {
            console.error(
              "Erreur dans le gestionnaire d'événements:",
              error,
              handler
            );
          }
        });

        // Arrêter la propagation si demandé
        if (event.defaultPrevented) {
          return;
        }
      }

      target = target.parentElement;
    }
  }

  getHandlersForElement(element, eventType) {
    const handlers = [];

    // Vérifier les attributs data-*
    if (element.dataset.clickHandler && eventType === "click") {
      const handlerName = element.dataset.clickHandler;
      const handler = this.getGlobalHandler(handlerName);
      if (handler) handlers.push(handler);
    }

    if (element.dataset.inputHandler && eventType === "input") {
      const handlerName = element.dataset.inputHandler;
      const handler = this.getGlobalHandler(handlerName);
      if (handler) handlers.push(handler);
    } // Vérifier les classes spécifiques
    if (element.classList.contains("recipe-card") && eventType === "click") {
      handlers.push(this.handleRecipeCardClick.bind(this));
    }

    if (element.classList.contains("filter-option") && eventType === "click") {
      handlers.push(this.handleFilterOptionClick.bind(this));
    }

    if (element.classList.contains("search-input") && eventType === "input") {
      handlers.push(this.handleSearchInput.bind(this));
    }

    return handlers;
  }

  getGlobalHandler(handlerName) {
    // Registre des handlers globaux
    const globalHandlers = {
      toggleRecipeDetails: this.handleRecipeCardClick.bind(this),
      selectFilter: this.handleFilterOptionClick.bind(this),
      removeFilter: this.handleRemoveFilter.bind(this),
      searchInput: this.handleSearchInput.bind(this),
    };

    return globalHandlers[handlerName];
  }

  // Handlers spécifiques
  handleRecipeCardClick(event) {
    const recipeCard = event.target.closest(".recipe-card");
    if (recipeCard) {
      const view = AppView.instance;
      if (view) {
        // Utilisation directe de l'animation JavaScript, sans passer par les classes CSS
        const recipeCardDescriptionElement = recipeCard.querySelector(
          "#recipe-card-description"
        );
        const recipeCardIngredientsContainerElement = recipeCard.querySelector(
          "#recipe-card-ingredients-container"
        );

        if (
          recipeCardDescriptionElement &&
          recipeCardIngredientsContainerElement
        ) {
          view.animateRecipeDescriptionToggle(
            recipeCardDescriptionElement,
            recipeCardIngredientsContainerElement
          );
        }
      }
    }
  }
  handleFilterOptionClick(event) {
    const filterElement = event.target.closest(".filter-option");
    if (filterElement) {
      const filterType = filterElement.dataset.filterType;
      const filterValue = filterElement.dataset.filterValue;
      const view = AppView.instance;
      const stateManager = SearchAndFilterStateManager.instance;
      const controller = RecipeAppController.instance;

      if (view && stateManager && controller) {
        UIEventHandler.handleFilterOptionClick(
          filterElement,
          filterValue,
          view,
          stateManager,
          controller,
          filterType
        );
      }
    }
  }

  handleSearchInput(event) {
    const input = event.target;
    if (
      input.classList.contains("search-input") ||
      input.id.includes("search") ||
      input.id.includes("input")
    ) {
      const stateManager = SearchAndFilterStateManager.instance;
      if (stateManager) {
        // Déterminer le type de recherche basé sur l'ID
        let searchType = "mainSearchQuery";
        if (input.id.includes("ingredients")) searchType = "ingredientsQuery";
        else if (input.id.includes("appliances"))
          searchType = "appliancesQuery";
        else if (input.id.includes("utensils")) searchType = "utensilsQuery";

        stateManager.processSearchQueryUpdate(searchType, input);
      }
    }
  }

  handleRemoveFilter(event) {
    const filterElement = event.target.closest(".filter-tag, .selected-filter");
    if (filterElement) {
      const filterType = filterElement.dataset.filterType;
      const filterValue = filterElement.dataset.filterValue;
      const view = AppView.instance;
      const stateManager = SearchAndFilterStateManager.instance;
      const controller = RecipeAppController.instance;

      if (view && stateManager && controller) {
        // Implémenter la logique de suppression de filtre
        // Cette partie devrait être connectée aux méthodes existantes d'EventManager
        console.log("Suppression du filtre:", filterType, filterValue);
      }
    }
  }

  // Méthodes utilitaires
  addHandler(selector, eventType, handler) {
    if (!this.delegatedEvents.has(selector)) {
      this.delegatedEvents.set(selector, new Map());
    }

    const selectorEvents = this.delegatedEvents.get(selector);
    if (!selectorEvents.has(eventType)) {
      selectorEvents.set(eventType, []);
    }

    selectorEvents.get(eventType).push(handler);
  }

  removeHandler(selector, eventType, handler) {
    if (this.delegatedEvents.has(selector)) {
      const selectorEvents = this.delegatedEvents.get(selector);
      if (selectorEvents.has(eventType)) {
        const handlers = selectorEvents.get(eventType);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }
}
