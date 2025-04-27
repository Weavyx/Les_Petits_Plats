import recipesData from "../../data/recipes.js";

export class AppModel {
  /**
   * Singleton de la classe AppModel.
   * @type {AppModel}
   */
  constructor() {
    if (AppModel.instance) {
      return AppModel.instance;
    }
    this.recipesData = recipesData;

    this.allIngredients = []; // Liste de tous les ingrédients
    this.allAppliances = []; // Liste de tous les appareils
    this.allUtensils = []; // Liste de tous les ustensiles

    AppModel.instance = this;
  }

  async fetchRecipes() {
    return this.recipesData;
  }

  // addIngredients(ingredients) {
  //   ingredients.forEach((ingredient) => {
  //     if (!this.selectedIngredients.includes(ingredient.ingredient)) {
  //       this.selectedIngredients.push(ingredient.ingredient);
  //     }
  //   });
  // }
}
