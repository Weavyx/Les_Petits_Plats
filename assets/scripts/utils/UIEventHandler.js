/**
 * Gestionnaire d'événements pour l'interface utilisateur, centralisé et optimisé.
 * Gère la mise en place et la délégation des événements pour les filtres et recherches.
 */
export class UIEventHandler {
  /**
   * Ajoute un gestionnaire d'événements générique.
   *
   * @param {HTMLElement} element - L'élément cible.
   * @param {string} eventType - Le type d'événement (par ex. "click", "keydown").
   * @param {Function} callback - La fonction à exécuter lors de l'événement.
   */
  static attachEventListener(element, eventType, callback) {
    element.addEventListener(eventType, callback);
  }

  static detachEventListener(element, eventType, callback) {
    element.removeEventListener(eventType, callback);
  }

  /**
   * Configure le basculement de visibilité du formulaire de filtrage.
   *
   * @param {string} buttonId - L'ID du bouton.
   * @param {string} formSelector - Le sélecteur du formulaire.
   * @param {string} svgSelector - Le sélecteur du SVG.
   * @param {object} view - Instance de la vue pour manipuler l'interface utilisateur.
   */
  static setupFilterFormToggle(buttonId, formSelector, svgSelector, view) {
    const button = document.getElementById(buttonId);
    if (!button) {
      console.warn(`[setupFilterFormToggle] Bouton introuvable : ${buttonId}`);
      return;
    }
    // Optimisation : recherche du form comme frère du bouton
    const form = button.parentNode
      ? button.parentNode.querySelector(formSelector)
      : null;
    const svg = button.querySelector(svgSelector);
    if (!form) {
      console.warn(
        `[setupFilterFormToggle] Sélecteur(s) form manquant(s) pour ${buttonId}`
      );
      return;
    }
    if (!svg) {
      console.warn(
        `[setupFilterFormToggle] Sélecteur(s) svg manquant(s) pour ${buttonId}`
      );
      return;
    }
    this.attachEventListener(button, "click", (event) => {
      view.toggleFilterFormVisibility(button, form, svg);
      // Ajout d'un gestionnaire pour fermer en cliquant en dehors
      const handleClickOutside = (e) => {
        if (!form.contains(e.target) && !button.contains(e.target)) {
          view.toggleFilterFormVisibility(button, form, svg);
          document.removeEventListener("mousedown", handleClickOutside);
        }
      };
      // On attend un tick pour éviter la fermeture immédiate lors du clic sur le bouton
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    });
  }

  /**
   * Gère le clic sur une option de filtrage.
   *
   * @param {Event} e - Événement déclenché par le clic.
   * @param {string} filteringOption - Option de filtrage sélectionnée.
   * @param {object} view - Instance de la vue pour manipuler l'interface utilisateur.
   * @param {object} stateManager - Gestionnaire d'état des recherches et filtres pour suivre les données de l'application.
   * @param {object} controller - Instance du contrôleur pour gérer la logique de l'application.
   * @param {string} key - Clé pour identifier le type d'option de filtrage (ingredients, appliances, utensils).
   */
  static handleFilterOptionClick(
    e,
    filteringOption,
    view,
    stateManager,
    controller,
    key
  ) {
    const containerIdMap = {
      ingredients: "ingredient-tags-container",
      appliances: "appliance-tags-container",
      utensils: "utensil-tags-container",
    };

    e.classList.add("hidden");

    const containerId = containerIdMap[key];
    const tagContainer = document.getElementById(containerId);
    if (!stateManager.activeFilters.has(filteringOption)) {
      stateManager.activeFilters.add(filteringOption);

      // Mettre à jour l'état du bouton de reset principal
      view.updateMainResetButtonState();

      // Afficher le tag dans le conteneur principal
      const filteringOptionTag = view.displayFilterTag(filteringOption);

      // Afficher le tag dans le conteneur spécifique
      const selectedFilteringOptionElement = view.displaySelectedFilterElement(
        filteringOption,
        tagContainer
      ); // Gestion de la suppression du tag
      const removeFilter = () => {
        stateManager.activeFilters.delete(filteringOption);

        // Mettre à jour l'état du bouton de reset principal
        view.updateMainResetButtonState();

        // Supprimer les tags des conteneurs
        if (filteringOptionTag.parentNode) {
          filteringOptionTag.parentNode.removeChild(filteringOptionTag);
        }

        if (selectedFilteringOptionElement.parentNode) {
          selectedFilteringOptionElement.parentNode.removeChild(
            selectedFilteringOptionElement
          );
        }

        e.classList.remove("hidden"); // Mettre à jour les recettes affichées
        const filteredRecipes = stateManager.updateRecipesWithFilters();
        controller.renderRecipesByIds(filteredRecipes);
        // Déclencher la mise à jour des filtres avec les nouvelles recettes
        stateManager.updateAllFiltersWithAvailableOptions(filteredRecipes);
      };

      // Ajouter les événements de suppression
      filteringOptionTag.addEventListener("click", removeFilter);
      selectedFilteringOptionElement.addEventListener("click", removeFilter);
    } // Mettre à jour les recettes affichées
    const filteredRecipes = stateManager.updateRecipesWithFilters();
    controller.renderRecipesByIds(filteredRecipes);
    // Déclencher la mise à jour des filtres avec les nouvelles recettes
    stateManager.updateAllFiltersWithAvailableOptions(filteredRecipes);
  }

  /**
   * Supprime une option de filtrage sélectionnée.
   *
   * @param {HTMLElement} hiddenFilteringOptionElement - Élément de l'option de filtrage masquée.
   * @param {HTMLElement} optionTagElement - Élément du tag de l'option.
   * @param {HTMLElement} specificTagsContainerElement - Conteneur des tags spécifiques.
   * @param {HTMLElement} selectedFilteringOptionElement - Élément de l'option de filtrage sélectionnée.
   */
  static removeFilterOption(
    hiddenFilteringOptionElement,
    optionTagElement,
    specificTagsContainerElement,
    selectedFilteringOptionElement
  ) {
    hiddenFilteringOptionElement.classList.remove("hidden");

    const tagContainer = document.getElementById("search-tag-container");
    if (tagContainer) {
      tagContainer.removeChild(optionTagElement);
    }

    if (specificTagsContainerElement) {
      specificTagsContainerElement.removeChild(selectedFilteringOptionElement);
    }
  }
  static handleEraseButtonClick(input, controller, key) {
    const containerIdMap = {
      "ingredients-search-icon": () => {
        // Utiliser les options disponibles basées sur les recettes actuelles au lieu de toutes les options
        const availableOptions =
          controller.appStateManager.getAvailableOptionsFromRecipes(
            controller.appStateManager.currentFilteredRecipeIds
          );
        controller.appStateManager.updateFilterDropdownContent(
          "ingredients",
          availableOptions.ingredients
        );
      },
      "appliances-search-icon": () => {
        const availableOptions =
          controller.appStateManager.getAvailableOptionsFromRecipes(
            controller.appStateManager.currentFilteredRecipeIds
          );
        controller.appStateManager.updateFilterDropdownContent(
          "appliances",
          availableOptions.appliances
        );
      },
      "utensils-search-icon": () => {
        const availableOptions =
          controller.appStateManager.getAvailableOptionsFromRecipes(
            controller.appStateManager.currentFilteredRecipeIds
          );
        controller.appStateManager.updateFilterDropdownContent(
          "utensils",
          availableOptions.utensils
        );
      },
    };
    input.value = "";
    input.dispatchEvent(new Event("input")); // Déclenche l'événement d'entrée pour mettre à jour l'état

    if (containerIdMap[key]) {
      containerIdMap[key]();
    } else {
      console.warn(`Clé de recherche inconnue : ${key}`);
    }
  }

  static delegateEvent(parent, selector, eventType, handler) {
    parent.addEventListener(eventType, function (event) {
      const target = event.target.closest(selector);
      if (target && parent.contains(target)) {
        handler(event, target);
      }
    });
  }
}
