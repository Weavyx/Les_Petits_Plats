import { RecipeAppController } from "./controllers/RecipeAppController.js";
import { RecipeDataModel } from "./models/RecipeDataModel.js";
import { AppView } from "./views/AppView.js";
import { SearchAndFilterStateManager } from "./state/SearchAndFilterStateManager.js";

// Détection de la page actuelle
const CURRENT_PAGE = window.location.pathname;

/**
 * Vérifie si la page actuelle correspond à la page d'accueil.
 * @returns {boolean} True si la page est l'index, sinon false.
 */
const isHomePage = () =>
  CURRENT_PAGE.includes("index.html") || CURRENT_PAGE === "/";

// Appel de la fonction d'initialisation
document.addEventListener("DOMContentLoaded", () => {
  // Initialisation de l'application après le chargement complet du DOM
  const appController = new RecipeAppController(
    new RecipeDataModel(),
    new AppView(),
    new SearchAndFilterStateManager()
  );

  try {
    if (isHomePage()) {
      appController.initializeApp();
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de l'application :",
      error.message
    );
  }
});
