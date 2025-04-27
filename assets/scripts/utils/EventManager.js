export class EventManager {
  constructor() {
    if (EventManager.instance) {
      return EventManager.instance;
    }

    this.view = null; // Référence à la vue, définie dans le constructeur du contrôleur

    EventManager.instance = this;
  }

  /**
   * Ajoute un gestionnaire d'événements générique.
   *
   * @param {HTMLElement} element - L'élément cible.
   * @param {string} eventType - Le type d'événement (par ex. "click", "keydown").
   * @param {Function} callback - La fonction à exécuter lors de l'événement.
   */
  addEvent(element, eventType, callback) {
    element.addEventListener(eventType, callback);
  }
}
