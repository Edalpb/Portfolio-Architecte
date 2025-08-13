document.addEventListener('DOMContentLoaded', () => {
    // Navigation vers la page de login
    const loginLink = document.querySelector('nav ul li:nth-child(3)');
    if (loginLink) {
      loginLink.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  
    // Fonction pour récupérer les catégories
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();
        setupCategoriesFilters(categories);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories", error);
      }
    }
  
    // Fonction pour configurer les filtres de catégories
    function setupCategoriesFilters(categories) {
      const filtersContainer = document.querySelector('.buttons-filters');
      if (!filtersContainer) return;
      
      categories.forEach(category => {
        const filterButton = document.createElement('button');
        filterButton.setAttribute('data-idcategory', category.id);
        filterButton.textContent = category.name;
        filterButton.classList.add('filter-button');
        filtersContainer.appendChild(filterButton);
      });
      
      // Ajout des événements de filtrage
      const filterButtons = document.querySelectorAll('.filter-button');
      const galleryImages = document.querySelectorAll('.gallery figure');
      filterButtons.forEach(button => {
        button.addEventListener('click', () => {
          const categoryId = button.getAttribute('data-idcategory');
          galleryImages.forEach(figure => {
            const imageCategoryId = figure.getAttribute('data-category');
            if (categoryId === '0' || imageCategoryId === categoryId) {
              figure.style.display = 'block';
            } else {
              figure.style.display = 'none';
            }
          });
        });
      });
    }
  
    // Vérifier si on est sur la page d'accueil pour charger les catégories
    if (document.querySelector('.gallery')) {
      fetchCategories();
    }
  
    // Gestion du formulaire de connexion
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function(event) {
        
        event.preventDefault();
        
        // Récupérer les valeurs
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Envoi de la requête au serveur
        fetch('http://localhost:5678/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            alert("Erreur dans l'identifiant ou le mot de passe");
            throw new Error("Erreur de connexion");
          }
        })
        .then(function(data) {
          
          sessionStorage.setItem('token', data.token);
          
          
          window.location.href = "index.html";
        })
        .catch(function(error) {
          console.error("Erreur lors de la connexion:", error);
        });
      });
    }
  });


// Test 1
//  document.addEventListener('DOMContentLoaded', () => {
//     // Navigation vers la page de login
//     const loginLink = document.querySelector('nav ul li:nth-child(3)');
//     loginLink.addEventListener('click', () => {
//         window.location.href = 'login.html';
//     });

//     // Fonction pour récupérer les catégories (votre code existant)
//     async function fetchCategories() {
//         try {
//             const response = await fetch('http://localhost:5678/api/categories');
//             const categories = await response.json();
//             setupCategoriesFilters(categories);
//         } catch (error) {
//             console.error("Erreur lors de la récupération des catégories", error);
//         }
//     }

//     // Fonction pour configurer les filtres de catégories (votre code existant)
//     function setupCategoriesFilters(categories) {
//         const filtersContainer = document.querySelector('.buttons-filters');
        
//         categories.forEach(category => {
//             const filterButton = document.createElement('button');
//             filterButton.setAttribute('data-idcategory', category.id);
//             filterButton.textContent = category.name;
//             filterButton.classList.add('filter-button');
//             filtersContainer.appendChild(filterButton);
//         });

//         // Ajout des événements de filtrage
//         const filterButtons = document.querySelectorAll('.filter-button');
//         const galleryImages = document.querySelectorAll('.gallery figure');

//         filterButtons.forEach(button => {
//             button.addEventListener('click', () => {
//                 const categoryId = button.getAttribute('data-idcategory');
                
//                 galleryImages.forEach(figure => {
//                     const imageCategoryId = figure.getAttribute('data-category');
                    
//                     if (categoryId === '0' || imageCategoryId === categoryId) {
//                         figure.style.display = 'block';
//                     } else {
//                         figure.style.display = 'none';
//                     }
//                 });
//             });
//         });
//     }

//     // Appel initial pour charger les catégories
//     fetchCategories();
// });