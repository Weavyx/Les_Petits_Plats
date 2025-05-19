export class EventManager {
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
    const form = button.parentNode?.querySelector(formSelector);
    const svg = button.querySelector(svgSelector);
    if (!form || !svg) {
      console.warn(
        `[setupFilterFormToggle] Sélecteur(s) manquant(s) pour ${buttonId}`
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
   * @param {object} stateManager - Gestionnaire d'état pour suivre les données de l'application.
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

    if (!stateManager.activeFilters.includes(filteringOption)) {
      stateManager.activeFilters.push(filteringOption);

      // Afficher le tag dans le conteneur principal
      const filteringOptionTag = view.displayFilterTag(filteringOption);

      // Afficher le tag dans le conteneur spécifique
      const selectedFilteringOptionElement = view.displaySelectedFilterElement(
        filteringOption,
        tagContainer
      );

      // Gestion de la suppression du tag
      const removeFilter = () => {
        stateManager.activeFilters = stateManager.activeFilters.filter(
          (item) => item !== filteringOption
        );

        // Supprimer les tags des conteneurs
        if (filteringOptionTag.parentNode) {
          filteringOptionTag.parentNode.removeChild(filteringOptionTag);
        }

        if (selectedFilteringOptionElement.parentNode) {
          selectedFilteringOptionElement.parentNode.removeChild(
            selectedFilteringOptionElement
          );
        }

        e.classList.remove("hidden");

        // Mettre à jour les recettes affichées
        controller.displayRecipesByIds(stateManager.updateRecipesWithFilters());
      };

      // Ajouter les événements de suppression
      filteringOptionTag.addEventListener("click", removeFilter);
      selectedFilteringOptionElement.addEventListener("click", removeFilter);
    }

    // Mettre à jour les recettes affichées
    controller.displayRecipesByIds(
      stateManager.filterRecipesByNewFilter(filteringOption)
    );
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
      "main-search-icon": () => {
        controller.displayRecipesByIds(
          controller.appStateManager.filterRecipesBySelectedFilters(
            Array.from(controller.model.allRecipes.lenght, (_, i) => i + 1)
          )
        );
      },
      "ingredients-search-icon": () => {
        controller.appStateManager.renderFilteredOptions(
          "ingredients",
          Array.from(controller.model.allIngredients)
        );
      },
      "appliances-search-icon": () => {
        controller.appStateManager.renderFilteredOptions(
          "appliances",
          Array.from(controller.model.allAppliances)
        );
      },
      "utensils-search-icon": () => {
        controller.appStateManager.renderFilteredOptions(
          "utensils",
          Array.from(controller.model.allUtensils)
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
}
