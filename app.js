/* ==================================
   AFRICONNECT - FONCTIONS COMMUNES
================================== */

// Afficher un message dans la page
function afficherMessage(message, type = "info") {
  let zone = document.getElementById("appMessage");

  if (!zone) {
    zone = document.createElement("div");
    zone.id = "appMessage";
    zone.setAttribute("role", "status");
    zone.setAttribute("aria-live", "polite");

    const main = document.querySelector("main") || document.body;
    main.prepend(zone);
  }

  zone.textContent = message;
  zone.className = "notice";

  if (type === "erreur") {
    zone.style.background = "#fde8e8";
    zone.style.color = "#9b1c1c";
  } else {
    zone.style.background = "#e7f8f1";
    zone.style.color = "#075e46";
  }
}

// Afficher ou masquer un élément
function basculerAffichage(id) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  const masque = getComputedStyle(element).display === "none";

  element.style.display = masque ? "block" : "none";
}

// Préparer les boutons de menu mobile
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menuButton");
  const menu = document.getElementById("mainNavigation");

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const ouvert = menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute("aria-expanded", String(!ouvert));
      menu.hidden = ouvert;
    });
  }

  // Afficher l'année actuelle si un élément la demande
  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
});