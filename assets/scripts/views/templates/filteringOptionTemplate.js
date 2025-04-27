export function filteringOptionTemplate(option) {
  function createFilteringOptionElement() {
    const filteringOptionElement = document.createElement("p");
    filteringOptionElement.setAttribute(
      "class",
      "flex flex-row gap-[60px] cursor-pointer items-center pl-[16px] pr-[21.5px] py-[4.5px] bg-white font-Manrope font-normal text-[14px] leading-[19px] tracking-[0] hover:bg-yellow"
    );
    filteringOptionElement.textContent = option;

    return filteringOptionElement;
  }

  function createSelectedFilteringOptionElement() {
    const filteringOptionContainer = document.createElement("div");
    filteringOptionContainer.setAttribute("class", "group flex flex-col");

    const filteringOptionElement = document.createElement("p");
    filteringOptionElement.setAttribute(
      "class",
      "relative flex flex-row cursor-pointer bg-yellow gap-[60px] items-center pl-[16px] pr-[21.5px] py-[9px] bg-white font-Manrope font-normal text-[14px] leading-[19px] tracking-[0] group-hover:font-bold"
    );
    filteringOptionElement.textContent = option;

    const deleteIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    deleteIcon.setAttribute(
      "class",
      "absolute top-[11px] right-[14px] text-yellow fill-[#ffd15b] group-hover:size-[16px]"
    );
    deleteIcon.setAttribute("width", "17");
    deleteIcon.setAttribute("height", "17");
    deleteIcon.setAttribute("viewBox", "0 0 17 17");
    deleteIcon.setAttribute("fill", "none");
    deleteIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute(
      "class",
      "fill-[#ffd15b] group-hover:fill-black group-hover:border-yellow"
    );
    circle.setAttribute("cx", "8.5");
    circle.setAttribute("cy", "8.5");
    circle.setAttribute("r", "8.5");
    circle.setAttribute("fill", "");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M11 11L8.5 8.5M8.5 8.5L6 6M8.5 8.5L11 6M8.5 8.5L6 11"
    );
    path.setAttribute("stroke", "#FFD15B");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    deleteIcon.appendChild(circle);
    deleteIcon.appendChild(path);
    filteringOptionElement.appendChild(deleteIcon);
    filteringOptionContainer.appendChild(filteringOptionElement);
    return filteringOptionContainer;
  }

  function createFilteringOptionTag() {
    const filteringOptionTag = document.createElement("p");
    filteringOptionTag.setAttribute(
      "class",
      "cursor-pointer relative bg-yellow flex flex-row pr-[88px] py-[17px] pl-[18px] rounded-[10px] font-Manrope font-normal text-[14px] leading[19px] tracking-[0]"
    );
    filteringOptionTag.textContent = option;

    const deleteIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    deleteIcon.setAttribute(
      "class",
      "absolute top-[21.5px] right-[18px] size-[10px]"
    );
    deleteIcon.setAttribute("width", "13");
    deleteIcon.setAttribute("height", "14");
    deleteIcon.setAttribute("viewBox", "0 0 13 14");
    deleteIcon.setAttribute("fill", "none");
    deleteIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M12 11.5L7 6.5M7 6.5L2 1.5M7 6.5L12 1.5M7 6.5L2 11.5"
    );
    path.setAttribute("stroke", "#1B1B1B");
    path.setAttribute("stroke-width", "2.16667");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    deleteIcon.appendChild(path);
    filteringOptionTag.appendChild(deleteIcon);

    return filteringOptionTag;
  }

  return {
    createFilteringOptionElement,
    createSelectedFilteringOptionElement,
    createFilteringOptionTag,
  };
}
