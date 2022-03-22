/** 
* Initialisation de la variable "products" qui contiendra les données 
* des produits à afficher sur la page panier
**/
let products = [];

/* Récupére le localStorage du panier */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

console.log("cart:", cart);

/* Je crée une fonction qui récupére toutes les infos des produits cibles depuis mon API */
async function getProductsInfos() {

  /* Récupération des informations des produits cibles via l'id correspondant du panier */
  await fetch("http://localhost:3000/api/products/")

    /* Récupération du résultat au format JSON */
    .then(res => res.json())

    /* Stockage des données dans la variable  */
    .then(data => (products = data))

    /* Récupération des logs dans la console */
    .then(function (value) {
      console.log("API:", value);
    })
}

/* Fonction d'envoi de la commande */
async function postCartAndContact(contact) {

  /* On fait appel à l'API */
  await fetch("http://localhost:3000/api/products/order", {

    /* Méthode POST pour envoi des données vers le serveur */
    method: "POST",

    /* Contenu au format JSON */
    headers: {

      "Content-Type": "application/json"

    },

    /* Envoi de l'objet contact et du localStorage panier vers le serveur */
    body: JSON.stringify({ contact, products: cart.map(x => x._id) })

  })

    /* Récupération du résultat au format JSON */
    .then(res => res.json())

    /* Traitement après réception de la requête */
    .then(function (value) {

      /* On vide le localStorage */
      localStorage.clear();

      /* Redirection vers la page de confirmation avec url contenant le orderId */
      window.location.href = `confirmation.html?orderId=${value.orderId}`;

    })

}

/* Fonction qui signale si le panier est vide à l'utilisateur */
async function emptyCart() {

  /* Si le localStorage panier est vide */
  if (cart == null || cart == 0) {

    /* Pointage vers l'élément */
    let cartItems = document.getElementById("cart__items");

    /* Création d'un paragraphe pour signalement */
    let cartNull = document.createElement("p");

    /* Textes à afficher + style */
    cartItems.appendChild(cartNull).textContent = "Le panier est vide !";
    cartNull.style.textAlign = "center";
    cartNull.style.fontSize = "22px";
    document.getElementById("totalQuantity").textContent = "0";
    document.getElementById("totalPrice").textContent = "0";

  }

}

/* Fonction d'ajout de nouveaux produits */
async function addCart() {

  /* Appel de la fonction getProductsInfos */
  await getProductsInfos();

  /* Pointage vers l'élément cart__items */
  let cartItems = document.getElementById("cart__items");

  /* Si le panier contient quelque chose on montre son contenu à l'utilisateur */
  /* Création d'une boucle permettant d'afficher la totalité des produits sur la page panier */
  for (i = 0; i < cart.length; i++) {

    /* Récupération des produits concernés via l'API */
    let product = products.find(x => x._id == cart[i]._id);

    /* log console des produits affichés via l'API */
    console.log("API Item Used:", product);

    /* Template Article */
    cartItems.innerHTML += `
           <article class="cart__item" data-id="${cart[i]._id}" data-color="${cart[i].color}">
               <div class="cart__item__img">
                 <img src="${product.imageUrl}" alt="${product.altTxt}">
               </div>
               <div class="cart__item__content">
                 <div class="cart__item__content__description">
                   <h2>${product.name}</h2>
                   <p>${cart[i].color}</p>
                   <p>${product.price} €</p>
                 </div>
                 <div class="cart__item__content__settings">
                   <div class="cart__item__content__settings__quantity">
                     <label for="itemQuantity">Qté: </label>
                     <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cart[i].quantity}">
                     <p class="messageQuantity"></p>
                   </div>
                   <div class="cart__item__content__settings__delete">
                     <p class="deleteItem">Supprimer</p>
                   </div>
                 </div>
               </div>
             </article>
           `;

  }

}

/* Fonction de gestion lors des modifications panier */
async function modifyCart() {

  /* Pointage vers l'élément cart__items */
  let cartItems = document.getElementById("cart__items");

  /* Lorsque la touche est relaché, la quantité du produit concerné est mise à jour */
  cartItems.querySelectorAll(".itemQuantity").forEach(item => item.addEventListener("keyup", updateQuantity));

  /* Lorsque le contenu de l'input change, la quantité du produit concerné est mise à jour (Bouton - || +) */
  cartItems.querySelectorAll(".itemQuantity").forEach(item => item.addEventListener("change", updateQuantity));

  /* Lorsque l'on clic sur le bouton "Supprimer", le produit est supprimé sur la page et dans le localStorage */
  cartItems.querySelectorAll(".deleteItem").forEach(item => item.addEventListener("click", removeProduct));

}

/* Fonction de gestion de l'affichage des produits du panier */
async function displayCart() {

  await emptyCart();
  await addCart();
  await modifyCart();
  await getTotalQuantity();
  await getTotalPrice();

}

displayCart();

/* Fonction de suppression du produit cible au clic sur le bouton "Supprimer" */
async function removeProduct(event) {

  /* On trouve le produit concerné  via sa couleur et son id */
  let product = event.path.find(x => x.classList.contains("cart__item"));
  let color = product.getAttribute("data-color");
  let id = product.getAttribute("data-id");

  /* On filtre les produits non concerné afin de supprimer uniquement le produit concerné */
  cart = cart.filter(x => x._id != id || x.color != color);

  /* On met à jour le localStorage du panier */
  localStorage.setItem("cart", JSON.stringify(cart));

  /* On supprime de la page le produit concerné */
  product.remove();

  /* On récupére les totaux quantité et prix */
  await getTotalQuantity();
  await getTotalPrice();

  /* on signale à l'utilisateur que le panier est vide si c'est bien le cas */
  await emptyCart();

}

/* Fonction de mise à jour de la quantité du produit concerné dans le panier */
async function updateQuantity(event) {

  /* On initialise un minimum et un maximum pour la quantité */
  const minQuantity = 1;
  const maxQuantity = 100;

  /* On va chercher le produit concerné via sa couleur et son id */
  let product = event.path.find(x => x.classList.contains("cart__item"));
  let id = product.getAttribute("data-id");
  let color = product.getAttribute("data-color");

  /* On boucle pour chaque produit */
  for (i = 0; i < cart.length; i++) {

    /* Si l'id et la couleur du produit affiché sont égaux à l'id et à la couleur du produit dans le localStorage */
    if (id == cart[i]._id && color == cart[i].color) {

      /* On récupére la valeur de la quantité de l'input du produit concerné */
      cart[i].quantity = event.target.value;

      /* si la quantité est inférieure à 1 */
      if (cart[i].quantity < minQuantity) {
    
        /* On force la valeur affichée dans l'input du produit concerné à se mettre à 1 */
        document.getElementsByClassName("itemQuantity")[i].value = `${minQuantity}`;

        /* On récupére la valeur de la quantité de l'input du produit concerné */
        cart[i].quantity = event.target.value;

        /* On met à jour la quantité du produit concerné dans le localStorage */
        localStorage.setItem("cart", JSON.stringify(cart));

        /* On refet les totaux quantité et prix sur la page */
        await getTotalQuantity();
        await getTotalPrice();

      }

      /* Sinon si la quantité est supérieure à 100 */
      else if (cart[i].quantity > maxQuantity) {

        /* On force la valeur affichée dans l'input du produit concerné à se mettre à 100 */
        document.getElementsByClassName("itemQuantity")[i].value = `${maxQuantity}`;


        /* On récupére la valeur de la quantité de l'input du produit concerné */
        cart[i].quantity = event.target.value;

        /* On met à jour la quantité du produit concerné dans le localStorage */
        localStorage.setItem("cart", JSON.stringify(cart));

        /* On refet les totaux quantité et prix sur la page */
        await getTotalQuantity();
        await getTotalPrice();

      }

      /* Sinon si la quantité est entre 1 et 100 */
      else if (cart[i].quantity >= minQuantity && cart[i].quantity <= maxQuantity) {

        /* On récupére la valeur de la quantité de l'input du produit concerné */
        cart[i].quantity = event.target.value;

        /* On met à jour la quantité du produit concerné dans le localStorage */
        localStorage.setItem("cart", JSON.stringify(cart));

        /* On refet les totaux quantité et prix sur la page */
        await getTotalQuantity();
        await getTotalPrice();

      }

    }

  }

}


/* Fonction pour le calcul du total de la quantité dans le panier */
async function getTotalQuantity() {

  let productQuantity = document.getElementsByClassName("itemQuantity");
  let totalQuantity = 0;

  for (i = 0; i < productQuantity.length; i++) {

    totalQuantity += productQuantity[i].valueAsNumber;

  }

  let productTotalQuantity = document.getElementById("totalQuantity");

  productTotalQuantity.textContent = totalQuantity;

}

/* Fonction pour le calcul du total du prix du panier */
async function getTotalPrice() {

  await getTotalQuantity();
  await getProductsInfos();

  let totalPrice = 0;

  for (i = 0; i < cart.length; i++) {

    totalPrice += products.find(x => x._id == cart[i]._id).price * cart[i].quantity;

  }

  let productTotalPrice = document.getElementById("totalPrice");

  productTotalPrice.textContent = totalPrice;

}

/* VALIDATEUR REGEX FORMULAIRE */
function formValidator() {

  let firstName = document.getElementById("firstName");
  let lastName = document.getElementById("lastName");
  let address = document.getElementById("address");
  let city = document.getElementById("city");
  let email = document.getElementById("email");

  /* On vérifie si input valide une fois rempli */
  firstName.addEventListener("keyup", function () {

    valid(firstName);

  });

  /* On vérifie si input valide une fois rempli */
  lastName.addEventListener("keyup", function () {

    valid(lastName);

  });

  /* On vérifie si input valide une fois rempli */
  address.addEventListener("keyup", function () {

    validAddress(address);

  });

  /* On vérifie si input valide une fois rempli */
  city.addEventListener("keyup", function () {

    valid(city);

  });

  /* On vérifie si input valide une fois rempli */
  email.addEventListener("keyup", function () {

    validEmail(email);

  });

  /* Soumission du formulaire au clic sur le bouton "Commander !" */
  formSubmit();

}

/* Fonction de validation regex input firstName, LastName, city */
function valid(input) {

  const regex = new RegExp("^[a-zA-Z-\\s]{2,255}$");
  const errorMsg = document.getElementById(input.id + "ErrorMsg");

  errorMsg.textContent = "";

  if (!regex.test(input.value)) {

    errorMsg.textContent = "Ce champ doit contenir entre 2 à 255 caractères, aucun accents, ni chiffres, ni caractères spéciaux !";
    errorMsg.style.color = "white";
    errorMsg.style.textAlign = "center";
    errorMsg.style.backgroundColor = "red";
    return false;

  }

  return true;

}

/* Fonction de validation regex input address */
function validAddress(inputAddress) {

  const addressRegExp = new RegExp("^[-'a-zA-Z0-9\\s]{2,255}$");
  let addressErrorMsg = document.getElementById("addressErrorMsg");

  addressErrorMsg.textContent = "";

  if (!addressRegExp.test(inputAddress.value)) {

    addressErrorMsg.textContent = "Ce champ doit contenir entre 2 à 255 caractères, aucun accents, ni caractères spéciaux !";
    addressErrorMsg.style.color = "white";
    addressErrorMsg.style.textAlign = "center";
    addressErrorMsg.style.backgroundColor = "red";
    return false;

  }

  return true;

}

/* Fonction de validation regex input email */
function validEmail(inputEmail) {

  const emailRegExp = new RegExp("^[a-zA-Z0-9._-]+[@]{1}[a-zA-Z0-9._-]+[.]{1}[a-z]{2,10}$", "g");
  let emailErrorMsg = document.getElementById("emailErrorMsg");

  emailErrorMsg.textContent = "";

  if (!emailRegExp.test(inputEmail.value)) {

    emailErrorMsg.textContent = "Ce champ doit contenir une adresse email valide, aucun accents, ni caractères spéciaux !";
    emailErrorMsg.style.color = "white";
    emailErrorMsg.style.textAlign = "center";
    emailErrorMsg.style.backgroundColor = "red";
    return false;

  }

  return true;

}

/* Fonction de message d'erreur si panier vide */
function orderErrorMessage() {

  let orderErrorMessage = document.getElementById("orderErrorMessage");

  orderErrorMessage.innerHTML = `Le panier est vide.
    <br>
    <br> 
    Vous ne pouvez donc pas faire de commande !
  `;

  orderErrorMessage.style.backgroundColor = "red";
  orderErrorMessage.style.textAlign = "center";

}


/* Fonction de soumission du formulaire */
function formSubmit() {

  let order = document.getElementById("order");

  /* Soumission du formulaire au clic */
  order.addEventListener("click", function (event) {

    /* Comportement par défaut au clic retiré */
    event.preventDefault();

    /* Si le panier est vide  lors du clic */
    if (cart == null || cart == 0 || cart == []) {

      /* Message d'erreur */
      orderErrorMessage();

    }

    /* Sinon on vérifie si tous les input sont valide */
    else if (valid(firstName) && valid(lastName) && validAddress(address) && valid(city) && validEmail(email)) {

      /* Création de l'objet contact à ajouter */
      const contact = {

        firstName: firstName.value,
        lastName: lastName.value,
        address: address.value,
        city: city.value,
        email: email.value

      }

      /* Envoi de la commande */
      postCartAndContact(contact);

    }

  });
}
formValidator();