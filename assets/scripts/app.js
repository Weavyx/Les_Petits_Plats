import { AppModel } from "./models/Model.js";
import { AppView } from "./views/View.js";
import { AppController } from "./controller/Controller.js";
import { StateManager } from "./stateManager/StateManager.js";

// Détection de la page actuelle
const CURRENT_PAGE = window.location.pathname;

/**
 * Vérifie si la page actuelle correspond à la page d'accueil.
 * @returns {boolean} True si la page est l'index, sinon false.
 */
const isHomePage = () =>
  CURRENT_PAGE.includes("index.html") || CURRENT_PAGE === "/";

/**
 * Initialise l'application.
 * @param {AppController} appController - Instance du contrôleur de l'application.
 */
const initializeApp = (appController) => {
  try {
    if (isHomePage()) {
      appController.initializeHomePage();
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de l'application :",
      error.message
    );
  }
};

// Appel de la fonction d'initialisation
document.addEventListener("DOMContentLoaded", () => {
  // Initialisation de l'application après le chargement complet du DOM
  const appController = new AppController(
    new AppModel(),
    new AppView(),
    new StateManager()
  );
  initializeApp(appController);
});
