export class StateManager {
  constructor() {
    if (StateManager.instance) {
      return StateManager.instance;
    }
    this.generalSearchText = ""; // Texte dans le champ de recherche

    this.ingredientsSearchText = ""; // Texte dans le champ de recherche des ingrédients
    this.appliancesSearchText = ""; // Texte dans le champ de recherche des appareils
    this.utensilsSearchText = ""; // Texte dans le champ de recherche des ustensiles

    this.selectedIngredients = []; // Liste des ingrédients sélectionnés
    this.selectedAppliances = []; // Liste des appareils sélectionnés
    this.selectedUtensils = []; // Liste des ustensiles sélectionnés

    StateManager.instance = this;
  }

  setSearchText(text) {
    this.searchText = text.toLowerCase(); // Pas forcément !!!
  }

  addIngredient(ingredient) {
    if (!this.selectedIngredients.includes(ingredient)) {
      this.selectedIngredients.push(ingredient);
    }
  }

  removeIngredient(ingredient) {
    this.selectedIngredients = this.selectedIngredients.filter(
      (i) => i !== ingredient
    );
  }

  addAppliance(appliance) {
    if (!this.selectedAppliances.includes(appliance)) {
      this.selectedAppliances.push(appliance);
    }
  }

  removeAppliance(appliance) {
    this.selectedAppliances = this.selectedAppliances.filter(
      (a) => a !== appliance
    );
  }

  addUtensil(utensil) {
    if (!this.selectedUtensils.includes(utensil)) {
      this.selectedUtensils.push(utensil);
    }
  }

  removeUtensil(utensil) {
    this.selectedUtensils = this.selectedUtensils.filter((u) => u !== utensil);
  }

  resetState() {
    this.searchText = "";
    this.selectedIngredients = [];
    this.selectedAppliances = [];
    this.selectedUtensils = [];
  }
}
