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

    // Remplacement de includes et push
    var alreadyInFilters = false;
    for (var i = 0; i < stateManager.activeFilters.length; i++) {
      if (stateManager.activeFilters[i] === filteringOption) {
        alreadyInFilters = true;
        break;
      }
    }

    if (!alreadyInFilters) {
      // Ajout sans push
      stateManager.activeFilters[stateManager.activeFilters.length] = filteringOption;

      // Afficher le tag dans le conteneur principal
      const filteringOptionTag = view.displayFilterTag(filteringOption);

      // Afficher le tag dans le conteneur spécifique
      const selectedFilteringOptionElement = view.displaySelectedFilterElement(
        filteringOption,
        tagContainer
      );

      // Gestion de la suppression du tag
      const removeFilter = () => {
        // Remplacement de filter
        var newActiveFilters = [];
        for (var j = 0; j < stateManager.activeFilters.length; j++) {
          if (stateManager.activeFilters[j] !== filteringOption) {
            newActiveFilters[newActiveFilters.length] = stateManager.activeFilters[j];
          }
        }
        stateManager.activeFilters = newActiveFilters;

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
      // Remplacement de removeChild par une boucle pour trouver l'élément
      var children = tagContainer.childNodes;
      for (var i = 0; i < children.length; i++) {
        if (children[i] === optionTagElement) {
          tagContainer.removeChild(optionTagElement);
          break;
        }
      }
    }

    if (specificTagsContainerElement) {
      var children2 = specificTagsContainerElement.childNodes;
      for (var j = 0; j < children2.length; j++) {
        if (children2[j] === selectedFilteringOptionElement) {
          specificTagsContainerElement.removeChild(selectedFilteringOptionElement);
          break;
        }
      }
    }
  }

  static handleEraseButtonClick(input, controller, key) {
    function toArray(setLike) {
      var arr = [];
      // Remplacement de for...of par une boucle classique
      var iterator = setLike[Symbol.iterator]();
      var step = iterator.next();
      while (!step.done) {
        arr[arr.length] = step.value;
        step = iterator.next();
      }
      return arr;
    }
    const containerIdMap = {
      "main-search-icon": function () {
        // Correction de la récupération de tous les IDs de recettes
        var allIds = [];
        var recipes = controller.model.allRecipes;
        if (recipes && typeof recipes.length === "number") {
          for (var i = 0; i < recipes.length; i++) {
            if (recipes[i] && recipes[i].id !== undefined) {
              allIds[allIds.length] = recipes[i].id;
            }
          }
        }
        controller.displayRecipesByIds(
          controller.appStateManager.filterRecipesBySelectedFilters(allIds)
        );
      },
      "ingredients-search-icon": function () {
        var arr = toArray(controller.model.allIngredients);
        controller.appStateManager.renderFilteredOptions(
          "ingredients",
          arr
        );
      },
      "appliances-search-icon": function () {
        var arr = toArray(controller.model.allAppliances);
        controller.appStateManager.renderFilteredOptions(
          "appliances",
          arr
        );
      },
      "utensils-search-icon": function () {
        var arr = toArray(controller.model.allUtensils);
        controller.appStateManager.renderFilteredOptions(
          "utensils",
          arr
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
