document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    const token = sessionStorage.getItem("token");
    const isLoggedIn = token !== null;

    if (isLoggedIn) {
        setupAdminInterface();
    }

    function setupAdminInterface() {
        console.log("Interface admin activée : utilisateur connecté");
        createEditBar();
        updateNavigation();
        addEditProjectsButton();
        hideFilters();
        setupModalEvents();
    }

    function createEditBar() {
        const editBar = document.createElement("div");
        editBar.classList.add("edit-bar");
        editBar.innerHTML = `
            <div class="edit-bar-content">
                <span><i class="fa-regular fa-pen-to-square"></i> Mode édition</span>
            </div>`;
        document.body.insertBefore(editBar, document.body.firstChild);
    }

    function updateNavigation() {
        const loginItem = document.querySelector("nav ul li:nth-child(3)");
        if (loginItem) {
            loginItem.innerHTML = '<a href="#" id="logout-link">logout</a>';
            document.getElementById("logout-link").addEventListener("click", (e) => {
                e.preventDefault();
                sessionStorage.removeItem("token");
                window.location.reload();
            });
        }
    }

    function addEditProjectsButton() {
        const portfolioTitle = document.querySelector("#portfolio h2");
        if (portfolioTitle) {
            const editButton = document.createElement("div");
            editButton.classList.add("edit-projects-btn");
            editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';

            const titleWrapper = document.createElement("div");
            titleWrapper.classList.add("title-edit-wrapper");
            portfolioTitle.parentNode.insertBefore(titleWrapper, portfolioTitle);
            titleWrapper.appendChild(portfolioTitle);
            titleWrapper.appendChild(editButton);

            editButton.addEventListener("click", openProjectsModal);
        }
    }

    function hideFilters() {
        const filtersContainer = document.querySelector(".buttons-filters");
        if (filtersContainer) {
            filtersContainer.style.display = "none";
            console.log("🛑 Filtres masqués pour le mode admin");
        } else {
            console.warn("❓ Filtres non trouvés dans le DOM");
        }
    }

    function openProjectsModal() {
        createProjectsModal();
        document.getElementById("projects-modal-overlay").classList.add("active");
        loadProjectsInModal();
        setupModalEvents();
    }

    function createProjectsModal() {
        const modalHTML = `
        <div class="modal-overlay" id="projects-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Galerie photo</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-gallery" id="modal-gallery">
                    <!-- Les projets seront ajoutés ici dynamiquement -->
                </div>
                <div class="modal-footer">
                    <hr>
                    <button class="add-photo-btn">Ajouter une photo</button>
                </div>
            </div>
        </div>
        
        <div class="modal-overlay" id="add-project-modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="back-to-gallery"><i class="fa-solid fa-arrow-left"></i></span>
                    <h3>Ajout photo</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="add-photo-form">
                    <div class="photo-upload-container">
                        <i class="fa-regular fa-image"></i>
                        <label for="photo-upload" class="photo-upload-btn">+ Ajouter photo</label>
                        <input type="file" id="photo-upload" accept="image/*" style="display:none;">
                        <p>jpg, png : 4mo max</p>
                    </div>
                    <div class="form-fields">
                        <div class="form-group">
                            <label for="photo-title">Titre</label>
                            <input type="text" id="photo-title" name="title">
                        </div>
                        <div class="form-group">
                            <label for="photo-category">Catégorie</label>
                            <select id="photo-category" name="category">
                                <!-- Les catégories seront ajoutées ici dynamiquement -->
                            </select>
                        </div>
                    </div>
                    <hr>
                    <button class="validate-btn" disabled>Valider</button>
                </div>
            </div>
        </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.classList.add('modal-container');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
    }

    async function loadProjectsInModal() {
        try {
            const response = await fetch("http://localhost:5678/api/works");
            const projects = await response.json();
            const modalGallery = document.getElementById("modal-gallery");
            modalGallery.innerHTML = "";

            projects.forEach((project) => {
                const projectElement = document.createElement("div");
                projectElement.classList.add("modal-project");
                projectElement.setAttribute("data-id", project.id);
                projectElement.innerHTML = `
                    <div class="project-image-container">
                        <img src="${project.imageUrl}" alt="${project.title}">
                        <div class="delete-icon" data-id="${project.id}">
                            <i class="fa-solid fa-trash-can"></i>
                        </div>
                    </div>`;
                modalGallery.appendChild(projectElement);
            });
            addDeleteEvents();
        } catch (err) {
            console.error("Erreur lors du chargement des projets :", err);
        }
    }

    function addDeleteEvents() {
        const deleteIcons = document.querySelectorAll(".delete-icon");
        deleteIcons.forEach((icon) => {
            icon.addEventListener("click", async (e) => {
                const projectId = e.currentTarget.getAttribute("data-id");
                try {
                    const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        },
                    });
                    if (response.ok) {
                        // Supprimer de la modale
                        document.querySelector(`.modal-project[data-id='${projectId}']`).remove();

                        // Supprimer de la galerie principale
                        const galleryItem = document.querySelector(`.gallery figure[data-id='${projectId}']`);
                        if (galleryItem) {
                            galleryItem.remove();
                            console.log(`Projet supprimé de la galerie: ID=${projectId}`);
                        } else {
                            console.warn(`Élément avec ID=${projectId} non trouvé dans la galerie`);
                        }
                    }
                } catch (err) {
                    console.error("Erreur suppression projet :", err);
                }
            });
        });
    }

    function setupModalEvents() {
        // Code existant pour les boutons de fermeture
        document.querySelectorAll(".close-modal").forEach((btn) => {
            btn.addEventListener("click", closeModals);
        });

        // Ajouter des écouteurs d'événements pour fermer la modale en cliquant sur l'overlay
        document.querySelectorAll(".modal-overlay").forEach((overlay) => {
            overlay.addEventListener("click", (e) => {
                // Vérifier si le clic est sur l'overlay lui-même et non sur son contenu
                if (e.target === overlay) {
                    closeModals();
                }
            });
        });

        document.querySelector(".add-photo-btn")?.addEventListener("click", () => {
            document.getElementById("projects-modal-overlay").classList.remove("active");
            document.getElementById("add-project-modal-overlay").classList.add("active");
            loadCategoriesForForm();
        });

        document.querySelector(".back-to-gallery")?.addEventListener("click", () => {
            document.getElementById("add-project-modal-overlay").classList.remove("active");
            document.getElementById("projects-modal-overlay").classList.add("active");
        });

        setupPhotoUpload();
        setupAddProjectForm();
    }


    async function loadCategoriesForForm() {
        try {
            const response = await fetch("http://localhost:5678/api/categories");
            const categories = await response.json();
            const select = document.getElementById("photo-category");
            select.innerHTML = "<option value=''></option>";
            categories.forEach((cat) => {
                const opt = document.createElement("option");
                opt.value = cat.id;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error("Erreur chargement catégories:", err);
        }
    }

    function setupPhotoUpload() {
        const fileInput = document.getElementById('photo-upload');
        const uploadContainer = document.querySelector('.photo-upload-container');
        const titleInput = document.getElementById('photo-title');
        const categorySelect = document.getElementById('photo-category');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Vérifier le type et la taille du fichier
                    if (!file.type.match('image.*')) {
                        alert("Veuillez sélectionner une image");
                        return;
                    }

                    if (file.size > 4 * 1024 * 1024) {
                        alert("La taille de l'image ne doit pas dépasser 4 Mo");
                        return;
                    }

                    // Créer un élément d'aperçu d'image sans remplacer l'input file
                    const originalContent = uploadContainer.innerHTML;
                    uploadContainer.innerHTML = '';

                    const preview = document.createElement('img');
                    preview.src = URL.createObjectURL(file);
                    preview.alt = "Preview";
                    preview.classList.add('image-preview');
                    uploadContainer.appendChild(preview);

                    // Conserver l'input file original
                    uploadContainer.appendChild(fileInput);

                    // Vérifier la validité du formulaire
                    checkFormValidity();
                }
            });
        }

        // Vérifier la validité à chaque modification des champs
        if (titleInput) {
            titleInput.addEventListener('input', checkFormValidity);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', checkFormValidity);
        }
    }
    // Modification de la fonction checkFormValidity
    function checkFormValidity() {
        const titleInput = document.getElementById('photo-title');
        const categorySelect = document.getElementById('photo-category');
        const fileInput = document.getElementById('photo-upload');
        const validateButton = document.querySelector('.validate-btn');

        if (titleInput && categorySelect && fileInput && validateButton) {
            // Vérifier si tous les champs sont remplis
            const isValid =
                titleInput.value.trim() !== '' &&
                categorySelect.value !== '' &&
                fileInput.files && fileInput.files.length > 0;

            // Active ou désactive le bouton selon la validité
            validateButton.disabled = !isValid;

            // Ajoute ou retire la classe pour le style visuel (vert)
            if (isValid) {
                validateButton.classList.add('form-valid');
            } else {
                validateButton.classList.remove('form-valid');
            }
        }
    }

    function setupAddProjectForm() {
        const validateButton = document.querySelector('.validate-btn');

        // Supprimer tous les écouteurs d'événements existants pour éviter les doublons
        const newValidateButton = validateButton.cloneNode(true);
        validateButton.parentNode.replaceChild(newValidateButton, validateButton);

        newValidateButton.addEventListener('click', async function handleSubmit() {
            // Désactiver immédiatement le bouton pour éviter les clics multiples
            this.disabled = true;
            this.textContent = "Envoi en cours...";

            const title = document.getElementById('photo-title').value;
            const categoryId = document.getElementById('photo-category').value;
            const fileInput = document.getElementById('photo-upload');

            if (!title || !categoryId || !fileInput.files[0]) {
                alert("Veuillez remplir tous les champs");
                this.disabled = false;
                this.textContent = "Valider";
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', categoryId);
            formData.append('image', fileInput.files[0]);

            try {
                const response = await fetch('http://localhost:5678/api/works', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const newProject = await response.json();

                    // Réinitialiser le formulaire
                    document.getElementById('photo-title').value = '';
                    document.getElementById('photo-category').value = '';

                    // Réinitialiser le conteneur d'upload
                    const photoUploadContainer = document.querySelector('.photo-upload-container');
                    photoUploadContainer.innerHTML = `
                        <i class="fa-regular fa-image"></i>
                        <label for="photo-upload" class="photo-upload-btn">+ Ajouter photo</label>
                        <input type="file" id="photo-upload" accept="image/*" style="display:none;">
                        <p>jpg, png : 4mo max</p>
                    `;

                    // Fermer la modale d'ajout et revenir à la galerie
                    document.getElementById('add-project-modal-overlay').classList.remove('active');
                    document.getElementById('projects-modal-overlay').classList.add('active');

                    // Mettre à jour les galeries
                    addProjectToModal(newProject);
                    addNewProjectToGallery(newProject);

                    // Réinitialiser les écouteurs d'événements pour le nouvel upload
                    setupPhotoUpload();

                    console.log("Projet ajouté avec succès:", newProject);
                } else {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout du projet:", error);
                alert("Erreur lors de l'ajout du projet");
            } finally {
                // Réactiver le bouton
                this.disabled = false;
                this.textContent = "Valider";
            }
        });
    }

    function closeModals() {
        document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.remove("active"));
    }

    function addNewProjectToGallery(project) {
        const gallery = document.querySelector(".gallery");
        const figure = document.createElement("figure");

        // Ajouter les attributs data pour les filtres
        figure.setAttribute("data-category", project.categoryId);
        figure.setAttribute("data-id", project.id);

        figure.innerHTML = `
            <img src="${project.imageUrl}" alt="${project.title}" />
            <figcaption>${project.title}</figcaption>`;
        gallery.appendChild(figure);

        console.log(`Projet ajouté à la galerie: ID=${project.id}, Catégorie=${project.categoryId}`);
    }
    function addProjectToModal(project) {
        const modalGallery = document.getElementById("modal-gallery");
        const projectElement = document.createElement("div");
        projectElement.classList.add("modal-project"); 
        projectElement.setAttribute("data-id", project.id);
        projectElement.innerHTML = `
            <div class="project-image-container">
                <img src="${project.imageUrl}" alt="${project.title}">
                <div class="delete-icon" data-id="${project.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </div>
            </div>`;

        modalGallery.appendChild(projectElement);

        // Ajouter l'événement de suppression au nouvel élément
        const deleteIcon = projectElement.querySelector(".delete-icon");
        deleteIcon.addEventListener("click", async (e) => {
            const projectId = e.currentTarget.getAttribute("data-id");
            try {
                const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                });
                if (response.ok) {
                    // Supprimer de la modale
                    document.querySelector(`.modal-project[data-id='${projectId}']`).remove();

                    // Supprimer de la galerie principale
                    const galleryItem = document.querySelector(`.gallery figure[data-id='${projectId}']`);
                    if (galleryItem) {
                        galleryItem.remove();
                        console.log(`Projet supprimé de la galerie: ID=${projectId}`);
                    } else {
                        console.warn(`Élément avec ID=${projectId} non trouvé dans la galerie`);
                    }
                }
            } catch (err) {
                console.error("Erreur suppression projet :", err);
            }
        });
    }
});