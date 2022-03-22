/* 
** Initialisation de la variables "products" qui contiendra les données 
** des différents produits
 */
let products = [];

/* Je crée une fonction qui récupére tous les produits depuis mon API */
async function getProducts(){

 await fetch("http://localhost:3000/api/products/")
    /* Récupération des données au format JSON */
    .then(res => res.json())

    /* Stockage des données dans la variable  */
    .then(data => (products = data))

    /* Récupération des logs dans la console */
    .then(function(value) {

        console.log("API:", value);

      })

}

/* Création d'une fonction pour afficher les vignettes */
async function displayProducts() {

    /* Appel de la fonction getProducts */
    await getProducts();

    /* Pointage vers l'élément items */
    let items = document.getElementById("items");

    /* Création d'une boucle permettant d'afficher la totalité des produits */
    for(let i = 0; i < products.length; i++){
    
        /* Création des éléments HTML */
        let productLink = document.createElement("a");
        let productArticle = document.createElement("article");
        let productImage = document.createElement("img");
        let productName = document.createElement("h3");
        let productDescription = document.createElement("p");
    
        /* Hiérarchisation parents/enfants des différents éléments HTML */
        items.appendChild(productLink)
            .appendChild(productArticle)
            .append(productImage, productName, productDescription);
    
        /* Création des attributs/classes sur les éléments HTML */
        productLink.href = `./product.html?id=${products[i]._id}`;
        productImage.alt = products[i].altTxt;
        productImage.src = products[i].imageUrl;
        productName.classList.add("productName");
        productName.textContent = products[i].name;
        productDescription.classList.add("productDescription");
        productDescription.textContent = products[i].description;

    }
    
}

/* Appel de la fonction pour afficher les vignettes */
displayProducts();