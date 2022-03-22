/* 
** Initialisation de la variable "product" qui contiendra les données 
** du produit
 */
let product = [];

/* Récupération du tableau localStorage correspondant au panier au format JSON */
let cart = JSON.parse(localStorage.getItem("cart"));

/* Je crée une fonction qui récupére toutes les infos du produit cible depuis mon API */
async function getProductById() {

    /* Récupération de l'url */
    let url = new URL(window.location.href);

    /* Récupération de la valeur de la variable id dans l'url */
    let productID = url.searchParams.get("id");

    console.log("productID:", productID);

    /* Récupération des informations du produit cible via l'id correspondant */
    await fetch(`http://localhost:3000/api/products/${productID}`)

        .then(res => res.json())

        /* Stockage des données dans la variable  */
        .then(data => (product = data))

        /* Récupération des logs dans la console */
        .then(function (value) {

            console.log("API item Used:", value);

        })

}


/* Création d'une fonction pour afficher les détails du produit cible */
async function displayProductDetails() {

    /* Appel de la fonction getProductById */
    await getProductById();

    /* Création et affichage de l'élément image du produit */
    let itemImage = document.getElementsByClassName("item__img");
    let productImage = document.createElement("img");

    itemImage[0].appendChild(productImage);

    productImage.alt = product.altTxt;
    productImage.src = product.imageUrl;

    /* Récupération et affichage du nom du produit + changement du titre de la page */
    document.title = product.name;
    document.getElementById("title").textContent = product.name;

    /* Récupération et affichage du prix du produit */
    document.getElementById("price").textContent = product.price;

    /* Récupération et affichage de la description du produit */
    document.getElementById("description").textContent = product.description;

    /* Création d'une boucle permettant d'afficher la totalité des couleurs produit */
    for (let i = 0; i < product.colors.length; i++) {

        let productColors = document.getElementById("colors");
        let productColorsOptions = document.createElement("option");

        productColors.appendChild(productColorsOptions);

        productColorsOptions.setAttribute("value", product.colors[i]);
        productColorsOptions.textContent = product.colors[i];

    }

    /* Valeur par défaut pour la quantité = 1 */
    quantity.value = 1;
}

/* Fonction d'ajustement de la valeur de l'input si < 1 ou > 100 */
function adjustQuantity() {

    /* Initialisation de la valeur minimale et maximale pour la quantité */
    const minQuantity = 1;
    const maxQuantity = 100;

    /* Si quantité < 1 = invalide, alors on force la valeur de l'input à s'ajuster à 1 */
    if (quantity.value < minQuantity) {

        document.getElementById("quantity").value = "";

    }

    /* Si quantité > 100 = invalide, alors on force la valeur de l'input à s'ajuster à 100 */
    else if (quantity.value > maxQuantity) {

        document.getElementById("quantity").value = `${maxQuantity}`;

    }
    else {

        /* Sinon la valeur qui est dans l'input est gardée automatiquement */
        let message = document.getElementById("message");
        message.textContent = "";
    }
}

/* Fonction pour l'affichage du message de succés d'ajout de produit au localStorage du panier */
function messageDisplay() {

    /* Initialisation de la couleur du produit */
    let colorChoice = document.getElementById("colors");

    const productToAdd = {

        _id: product._id,
        quantity: quantity.value,
        color: colorChoice.value

    }

    let message = document.getElementById("message");

    for (i = 0; i < cart.length; i++) {

        message.innerHTML = `
            Vous avez ajouté ${productToAdd.quantity} ${product.name} - ${productToAdd.color} dans le panier.
            <br>
            <br>
            Vous avez actuellement ${cart[i].quantity} ${product.name} ${productToAdd.color} dans le panier !
        `;

    }

    message.style.backgroundColor = "green";
    message.style.textAlign = "center";

}


function cartNotNull(){

     /* Initialisation de la valeur maximale pour la quantité */
     const maxQuantity = 100;

     /* Initialisation de la couleur du produit */
     let colorChoice = document.getElementById("colors");

    /* Création de l'objet produit à ajouter */
    const productToAdd = {

        _id: product._id,
        quantity: quantity.value,
        color: colorChoice.value

    }

    /* On va chercher l'index du produit dans le LocalStorage panier */
    let productIndex = cart.findIndex(x => x._id == productToAdd._id && x.color == productToAdd.color);

    /* Si produit concerné pas encore dans le localStorage du panier */
    if (productIndex < 0) {

        /* Ajout du produit au localStorage du panier + message de succés à l'utilisateur */
        cart.push(productToAdd);
        messageDisplay();

    }

    /* Sinon si la quantité du produit concerné est inférieur à la quantité maximale autorisée */
    else if (parseInt(cart[productIndex].quantity) + parseInt(productToAdd.quantity) > maxQuantity) {

        /* On ajoute pas la quantité au produit + message d'échec à l'utilisateur */
        messageDisplay();

        message.style.backgroundColor = "red";

        for (i = 0; i < cart.length; i++) {

            /* On transforme ici le message de succés en message d'erreur pour l'affichage à l'utilisateur */
            
            message.innerHTML = `La quantité maximale du produit ne peut pas dépasser 100.
                <br>
                <br>
                Vous avez actuellement ${cart[i].quantity} ${product.name} ${productToAdd.color} dans le panier !
            `;

        }

    }

    /* Sinon la quantité ne dépasse pas la quantité maximale autorisée */
    else {

        /* On ajoute la quantité supplémentaire au produit concerné */
        cart[productIndex].quantity = parseInt(cart[productIndex].quantity) + parseInt(productToAdd.quantity);
        messageDisplay();

    }

}

/* Bouton d'ajout produit dans le localStorage */
async function addToCart() {

    document.getElementById("quantity").addEventListener("keyup", adjustQuantity);
    document.getElementById("quantity").addEventListener("focus", adjustQuantity);

    /* ÉVénements lors du clic sur le bouton d'ajout produit au localStorage */
    document.getElementById("addToCart").addEventListener("click", () => {

        /* Initialisation de la couleur du produit */
        let colorChoice = document.getElementById("colors");

        /* Création de l'objet produit à ajouter */
        const productToAdd = {

            _id: product._id,
            quantity: quantity.value,
            color: colorChoice.value

        }

        /* Si le localStorage du panier est vide */
        if (cart == null || cart == 0) {

            /* Ajout produit + message de succés à l'utilisateur */
            cart = [productToAdd];
            messageDisplay();

        }

        /* Sinon si le panier du localStorage contient quelque chose */
        else {

           cartNotNull();
        }

        /* On met à jour le localStorage du panier */
        localStorage.setItem("cart", JSON.stringify(cart));

    });

}

/* Appel de la fonction pour création et affichage des détails du produit cible */
displayProductDetails();

/* Appel de la fonction pour gestion du localStorage du panier */
addToCart();