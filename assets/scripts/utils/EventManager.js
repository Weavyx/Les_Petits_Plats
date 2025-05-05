export class EventManager {
  /**
   * Ajoute un gestionnaire d'événements générique.
   *
   * @param {HTMLElement} element - L'élément cible.
   * @param {string} eventType - Le type d'événement (par ex. "click", "keydown").
   * @param {Function} callback - La fonction à exécuter lors de l'événement.
   */
  static addEvent(element, eventType, callback) {
    element.addEventListener(eventType, callback);
  }

  /**
   * Ajoute un gestionnaire d'événements pour le clic sur un bouton de filtrage.
   *
   * @param {HTMLElement} element - L'élément cible.
   * @param {Function} callback - La fonction à exécuter lors du clic.
   */
  static setupFilteringFormVisibilityOnClick(
    buttonId,
    formSelector,
    svgSelector,
    view
  ) {
    const button = document.getElementById(buttonId);
    const form = button.parentNode.querySelector(formSelector);
    const svg = button.querySelector(svgSelector);
    this.addEvent(button, "click", () => {
      view.toggleFilteringFormVisibility(button, form, svg);
    });
  }
}
