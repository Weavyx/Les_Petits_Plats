import { AppModel } from "./models/Model.js";
import { AppView } from "./views/View.js";
import { AppController } from "./controller/Controller.js";
import { StateManager } from "./utils/StateManager.js";
import { EventManager } from "./utils/EventManager.js";

// Initialisation des singletons
const app = new AppController(
  new AppModel(),
  new AppView(),
  new StateManager(),
  new EventManager()
);

// Détection de la page actuelle
const CURRENT_PAGE = window.location.pathname;

/**
 * Initialise l'application.
 */
function initializeApp() {
  try {
    if (CURRENT_PAGE.includes("index.html") || CURRENT_PAGE === "/") {
      app.renderHomePage();
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de l'application :",
      error.message
    );
  }
}

/**
 * Exécute le code après le chargement complet du DOM.
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});
