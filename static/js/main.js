
function validarNombre() {
    var nombreInput = document.getElementById('name');
    var nombre = nombreInput.value.trim();
    var nombreRegex = /^[a-zA-Z\s]+$/;

    if (!nombreRegex.test(nombre)) {
        swal("Error", "El nombre solo puede contener letras y espacios", "error");
        nombreInput.focus();
        return false;
    }

    return true;
}

function mostrarLeyenda() {
    var passwordHint = document.getElementById("passwordHint");
    passwordHint.style.display = "block"; 
 }


/*Actualizar*/
function mostrarLeyenda() {
        document.getElementById("nombre").setAttribute("title", "Actualizar nombre");
    }

    function ocultarLeyenda() {
        document.getElementById("nombre").removeAttribute("title");
    }

    function mostrarCampoEdicion() {
        document.getElementById("nombre").style.display = "none";
        document.getElementById("campoEdicionNombre").style.display = "block";
    }

    function guardarNombre() {
        var nuevoNombre = document.getElementById("nuevoNombre").value;
        // Aquí puedes enviar el nuevo nombre al servidor para guardarlo en la base de datos
        document.getElementById("nombre").innerText = nuevoNombre;
        document.getElementById("nombre").style.display = "inline";
        document.getElementById("campoEdicionNombre").style.display = "none";
    }

    function cancelarEdicion() {
        document.getElementById("nombre").style.display = "inline";
        document.getElementById("campoEdicionNombre").style.display = "none";
    }

//Cerra Sesion
function confirmarCerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        fetch('/cerrar_sesion')
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    console.error("Error al cerrar sesión");
                }
            })
            .catch(error => console.error("Error de red:", error));
    }
}

//
document.addEventListener("DOMContentLoaded", function() {
    var showMoreBtn = document.getElementById("showMoreBtn");

    var extraProductCards = document.querySelectorAll(".extra-product-card");

    showMoreBtn.addEventListener("click", function() {  
        extraProductCards.forEach(function(card) {
            card.classList.toggle("d-none");
        });

        if (showMoreBtn.innerText === "Más") {
            showMoreBtn.innerText = "Menos";
        } else {
            showMoreBtn.innerText = "Más";
        }
    });
});

//Eliminar Perfil
function confirmarEliminarPerfil() {
    if (confirm("¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer.")) {
        window.location.href = "/eliminar_perfil";
    }
}

    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
// Catalogo
function mostrarCatalogo() {
    var catalogoSection = document.getElementById('catalogo-section');

    if (catalogoSection) {
        catalogoSection.style.display = 'block';
    }
}

function abrirVentana(id) {
    var ventana = document.getElementById(id);
    ventana.style.display = "block";
}

function cerrarVentana(id) {
    var ventana = document.getElementById(id);
    ventana.style.display = "none";
}

// Scroll catalogo
const scrollToCatalogBtn = document.getElementById("scrollToCatalogBtn");
const scrollToCatalogBtn2 = document.getElementById("scrollToCatalogBtn2");
const catalogSection = document.getElementById("catalogo-section");

function scrollToCatalog() {
    catalogSection.scrollIntoView({
        behavior: 'smooth'
    });
}

scrollToCatalogBtn.addEventListener('click', scrollToCatalog);
scrollToCatalogBtn2.addEventListener('click', scrollToCatalog);

// Boton Scroll
const scrollToTopBtn = document.getElementById("scrollToTopBtn");

window.addEventListener("scroll", () => {
    if (window.pageYOffset > 100) { 
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
scrollToTopBtn.addEventListener('click', scrollToTop);

// Función para controlar el navbar con scroll
$(document).ready(function() {
    var lastScrollTop = 0;
    var navbarHeight = $('.navbar-top').outerHeight() + $('.navbar-second').outerHeight();

    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            $('.navbar-top').css('top', '-' + $('.navbar-top').outerHeight() + 'px');
            $('.navbar-second').css('top', '0');
        } else if (scrollTop < lastScrollTop) {
            if (scrollTop == 0) {
                $('.navbar-top').css('top', '0');
                $('.navbar-second').css('top', '60px');
            }
        }
        lastScrollTop = scrollTop;
    });
});

//verificar comentarios en el index
function verificarSesion() {
    const usuarioAutenticado = false;

    if (usuarioAutenticado) {
        console.log('Usuario autenticado, permitiendo comentarios');
    } else {
        $('#modal-sesion').modal('show'); 
    }
}

$(document).ready(function() {
    $('#btn-comentarios').click(verificarSesion);
});


//Comentarios y calificaciones en la principal
$(document).ready(function() {
    setInterval(function() {
        $('.carousel').carousel('next'); 
    }, 5000); 

    $('#openCommentForm').click(function() {
        $('#commentModal').modal('show');
    });

    cargarComentarios();

    document.getElementById('commentForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const title = document.getElementById('commentTitle').value;
        const content = document.getElementById('commentContent').value;
        const rating = obtenerCalificacion();

        fetch('/guardar_comentario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commentTitle: title,
                commentContent: content,
                commentRating: rating
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || data.error);
            if (!data.error) {
                $('#commentModal').modal('hide');
                document.getElementById('commentForm').reset();
                cargarComentarios();
            }
        })
        .catch(error => console.error('Error al enviar el comentario:', error));
    });
});

// Función para obtener la calificación seleccionada
function obtenerCalificacion() {
    const estrellas = document.getElementsByName('estrellas');
    for (let i = 0; i < estrellas.length; i++) {
        if (estrellas[i].checked) {
            return estrellas[i].value;
        }
    }
    return null;
}

// Función para cargar los comentarios desde el servidor
function cargarComentarios() {
    fetch('/obtener_comentarios')
    .then(response => response.json())
    .then(comentarios => {
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = '';

        // Verificar si comentarios es un array
        if (Array.isArray(comentarios)) {
            comentarios.forEach(comentario => {
                const commentCard = document.createElement('div');
                commentCard.classList.add('carousel-item');
                commentCard.innerHTML = `
                <div class="container-fluid p-0">
                <div class="card text-center mx-auto" style="width: 18rem;">
                    <div class="card-body d-flex flex-column align-items-center justify-content-center">
                        <h5 class="card-title">${comentario.title}</h5>
                        <div class="line"></div>
                        <p class="card-text">${comentario.content}</p>
                        <p class="card-text">Puntuacion: ${generarEstrellas(comentario.rating)}</p>
                    </div>
                </div>
            </div>            
                `;
                commentsContainer.appendChild(commentCard);
            });

            if (comentarios.length > 0) {
                commentsContainer.firstChild.classList.add('active');
            }
        } else {
            commentsContainer.innerHTML = 'Lo sentimos los comentarios no estan disponibles.';
        }
    })
    .catch(error => console.error('Error al cargar los comentarios:', error));
}

    
function generarEstrellas(calificacion) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= calificacion) {
            estrellas += '<span class="star filled">★</span>'; // Marcar las estrellas rellenas hasta la calificación
        } else {
            estrellas += '<span class="star">★</span>'; // Dejar las estrellas vacías para el resto
        }
    }
    return estrellas;
}


//graficas
$(document).ready(function() {
    // Verificar la existencia del elemento antes de crear la gráfica
    var graficaSatisfaccionModal = document.getElementById('graficaSatisfaccionModal');
    if (graficaSatisfaccionModal) {
        var calificaciones = [3, 4, 5, 2, 4]; // Ejemplo de calificaciones

        // Crear la gráfica de satisfacción dentro del modal
        var ctx = graficaSatisfaccionModal.getContext('2d');
        var graficaSatisfaccion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 estrella', '2 estrellas', '3 estrellas', '4 estrellas', '5 estrellas'],
                datasets: [{
                    label: 'Satisfacción del Cliente',
                    data: contarCalificaciones(calificaciones),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(255, 205, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        console.error('El elemento graficaSatisfaccionModal no fue encontrado.');
    }

    function contarCalificaciones(calificaciones) {
        var contadores = [0, 0, 0, 0, 0];

        calificaciones.forEach(function(calificacion) {
            contadores[calificacion - 1]++;
        });

        return contadores;
    }
});

/*//////////////////////////////////////////////////////////77 */
