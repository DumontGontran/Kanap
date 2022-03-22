/* Récupération de l'url */
let url = new URL (window.location.href);

/* Récupération de orderId de l'url */
const orderId = url.searchParams.get("orderId"); 

/* Affichage de orderId sur la page */
document.getElementById("orderId").textContent = `${orderId}`;
