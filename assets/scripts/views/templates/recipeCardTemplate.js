export function recipeCardTemplate(data) {
  const { name, description, ingredients, time, image } = data;

  function createRecipeCardElement() {
    // Création de l'élément principal de la carte
    const recipeCardElement = document.createElement("div");
    recipeCardElement.setAttribute(
      "class",
      "w-[380px] h-[731px] bg-white rounded-[21px] flex flex-col items-center justify-start relative"
    );

    // Ajout de l'image de la recette
    const imageElement = document.createElement("img");
    imageElement.setAttribute("src", `./assets/media/img/${image}`);
    imageElement.setAttribute("alt", "Recette 1");
    imageElement.setAttribute(
      "class",
      "w-full h-[253px] object-cover rounded-t-[21px]"
    );

    // Création du conteneur principal pour le contenu de la carte
    const contentContainer = document.createElement("div");
    contentContainer.setAttribute(
      "class",
      "w-full h-[478px] flex flex-col items-start justify-start gap-[29px] px-[25px] pt-[32px] pb-[61px]"
    );

    // Ajout du titre de la recette
    const titleElement = document.createElement("h2");
    titleElement.setAttribute(
      "class",
      "font-anton font-normal text-[18px] leading-[27px] tracking-[0]"
    );
    titleElement.textContent = name;

    // Création de la section description
    const descriptionContainer = document.createElement("div");
    descriptionContainer.setAttribute(
      "class",
      "w-full mt-[-3px] flex flex-col items-start justify-start gap-[0]"
    );

    const descriptionTitle = document.createElement("p");
    descriptionTitle.setAttribute(
      "class",
      "font-Manrope font-bold text-[12px] leading-[16px] tracking-9 uppercase text-grey"
    );
    descriptionTitle.textContent = "Recette";

    const descriptionText = document.createElement("p");
    descriptionText.setAttribute(
      "class",
      "shortened h-[76px] w-full font-Manrope font-normal text-[14px] leading-[19px] tracking-[0] text-dark mt-[15px] text-ellipsis  line-clamp-4"
    );
    descriptionText.setAttribute("id", "recipe-card-description");
    descriptionText.textContent = description;

    descriptionContainer.appendChild(descriptionTitle);
    descriptionContainer.appendChild(descriptionText);

    // Création de la section des ingrédients
    const ingredientsContainer = document.createElement("div");
    ingredientsContainer.setAttribute("class", "w-full h-[190px]");
    ingredientsContainer.setAttribute(
      "id",
      "recipe-card-ingredients-container"
    );

    const ingredientsTitle = document.createElement("p");
    ingredientsTitle.setAttribute(
      "class",
      "font-Manrope font-bold text-[12px] leading-[16px] tracking-9 uppercase text-grey"
    );
    ingredientsTitle.textContent = "Ingrédients";

    const ingredientsGrid = document.createElement("div");
    ingredientsGrid.setAttribute(
      "class",
      "grid grid-cols-2 mt-[15px] gap-y-[21px] gap-x-[14px]"
    );

    // Ajout des ingrédients un par un dans la grille (remplacement de forEach par une boucle for)
    if (ingredients && ingredients.length) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredientElement = createIngredientElement(ingredients[i]);
        ingredientsGrid.appendChild(ingredientElement);
      }
    }

    ingredientsContainer.appendChild(ingredientsTitle);
    ingredientsContainer.appendChild(ingredientsGrid);

    // Ajout de l'élément pour le temps de préparation
    const timeElement = document.createElement("p");
    timeElement.setAttribute(
      "class",
      "absolute top-[21px] right-[22px] rounded-[14px] bg-yellow text-dark font-Manrope font-normal text-[12px] leading-[16px] py-[5px] px-[15px] tracking-[0]"
    );
    timeElement.textContent = `${time}min`;

    // Assemblage des différentes sections dans le conteneur principal
    contentContainer.appendChild(titleElement);
    contentContainer.appendChild(descriptionContainer);
    contentContainer.appendChild(ingredientsContainer);

    // Ajout des éléments principaux à la carte
    recipeCardElement.appendChild(imageElement);
    recipeCardElement.appendChild(contentContainer);
    recipeCardElement.appendChild(timeElement);

    return recipeCardElement;
  }

  function createIngredientElement(ingredient) {
    // Création du conteneur pour un ingrédient
    const ingedientsTemplate = document.createElement("div");
    ingedientsTemplate.setAttribute(
      "class",
      "flex flex-col items-start justify-start gap-[0] pl-[1px]"
    );

    // Ajout du nom de l'ingrédient
    const ingredientName = document.createElement("p");
    ingredientName.setAttribute(
      "class",
      "font-Manrope font-normal text-[14px] leading-[19px] tracking-[0] text-dark"
    );
    ingredientName.textContent = ingredient.ingredient;

    // Ajout des détails de l'ingrédient (quantité et unité)
    const ingredientDetails = document.createElement("p");
    ingredientDetails.setAttribute(
      "class",
      "font-Manrope font-normal text-[14px] leading-[19px] tracking-[0] text-grey"
    );
    ingredientDetails.textContent = `${ingredient.quantity || "-"} ${
      ingredient.unit || ""
    }`;

    // Assemblage des informations de l'ingrédient
    ingedientsTemplate.appendChild(ingredientName);
    ingedientsTemplate.appendChild(ingredientDetails);

    return ingedientsTemplate;
  }

  return { createRecipeCardElement };
}
