document.addEventListener("DOMContentLoaded", () => {
    async function fetchData() {
       try {
           const response = await fetch('http://localhost:5678/api/works');
           if (!response.ok) {
               throw new Error(`HTTP error! Status: ${response.status}`);
           }
           const data = await response.json();
           
           // Gallerie
           let gallery = document.querySelector('.gallery');
           if (!gallery) {
               throw new Error("L'élément .gallery est introuvable dans le DOM.");
           }
           gallery.innerHTML = "";
           
           // Affichage des travaux
           function displayProjects(projects) {
            projects.forEach(project => {
                // Création du conteneur
                let container = document.createElement('div');
                container.classList.add('image-container', 'project-visible'); // Ajouter la classe project-visible
                container.setAttribute("data-idcategory", project.categoryId);
                container.setAttribute("data-idprojet", project.id);
                   
                   // Création de l'image
                   let img = document.createElement('img');
                   img.src = project.imageUrl;
                   img.alt = project.title;
                   
                   // Création du texte sous l'image
                   let caption = document.createElement('p');
                   caption.classList.add('caption');
                   caption.textContent = project.title;
                   
                   // Ajout des éléments au conteneur
                   container.appendChild(img);
                   container.appendChild(caption);
                   
                   // Ajout du conteneur à la galerie
                   gallery.appendChild(container);
               });
           }
           
           // Filtres-Categories
           async function fetchCategories() {
               try {
                   const response = await fetch("http://localhost:5678/api/categories");
                   if (!response.ok) {
                       throw new Error(`HTTP error! Status: ${response.status}`);
                   }
                   const categories = await response.json();
                   setupCategoriesFilters(categories, data);
               } catch (error) {
                   console.error("Erreur lors de la récupération des catégories :", error);
               }
           }

        function setupCategoriesFilters(categories, projects) {
            let filtersContainer = document.querySelector('.buttons-filters');
            if (!filtersContainer) {
                console.error("L'élément .buttons-filters est introuvable dans le DOM.");
                return;
            }
        
            // Création des boutons de filtres
            categories.forEach(category => {
                let filterButton = document.createElement('button');
                filterButton.setAttribute("data-idcategory", category.id);
                filterButton.textContent = category.name;
                filterButton.classList.add('filter-button');
        
                // Ajout de l'événement de filtrage
                filterButton.addEventListener('click', () => {
                    // Retirer la classe active de tous les boutons
                    document.querySelectorAll('.filter-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Ajouter la classe active au bouton cliqué
                    filterButton.classList.add('active');
                    
                    // Sélectionner tous les conteneurs d'images
                    const allContainers = document.querySelectorAll('.image-container');
                    
                    // Masquer tous les conteneurs en utilisant des classes
                    allContainers.forEach(container => {
                        container.classList.add('project-hidden');
                        container.classList.remove('project-visible');
                    });
                    
                    // Afficher uniquement les conteneurs de la catégorie sélectionnée
                    const filteredContainers = document.querySelectorAll(`.image-container[data-idcategory="${category.id}"]`);
                    filteredContainers.forEach(container => {
                        container.classList.add('project-visible');
                        container.classList.remove('project-hidden');
                    });
                });
                
                filtersContainer.appendChild(filterButton);
            });
        
            // Gestion du bouton "Tous"
            const allButton = document.querySelector('button[data-idcategory="0"]');
            if (allButton) {
                allButton.addEventListener('click', () => {
                    // Retirer la classe active de tous les boutons
                    document.querySelectorAll('.filter-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Ajouter la classe active au bouton "Tous"
                    allButton.classList.add('active');
                    
                    // Afficher tous les conteneurs en utilisant des classes
                    const allContainers = document.querySelectorAll('.image-container');
                    allContainers.forEach(container => {
                        container.classList.add('project-visible');
                        container.classList.remove('project-hidden');
                    });
                });
                
                // Activer le bouton "Tous" par défaut
                allButton.classList.add('active');
            }
        }

           // Affichage initial
           displayProjects(data);
           fetchCategories();
           
       } catch (error) {
           console.error("Erreur lors de la récupération des données :", error);
       }
    }
    
    fetchData();
});

console.log(sessionStorage.getItem("token"))


if (sessionStorage.getItem("token")== null)
    {
        console.log("Pas connecté")
    } else {
        console.log("Connecté")
    } 