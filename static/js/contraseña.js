//mostrar contraseña 
var passwordField = document.getElementById("password");
    var eyeIcon = document.getElementById("eyeIcon");
    var lockIcon = document.getElementById("lockIcon");

    var confirmPasswordField = document.getElementById("verificarContrasena");
    var eyeIcon2 = document.getElementById("eyeIcon2");
    var lockIcon2 = document.getElementById("lockIcon2");

    passwordField.addEventListener("input", function() {
        if (passwordField.value !== "") {
            eyeIcon.style.display = "inline-block";
            lockIcon.style.display = "none";
        } else {
            eyeIcon.style.display = "none";
            lockIcon.style.display = "inline-block";
        }
    });

    confirmPasswordField.addEventListener("input", function() {
        if (confirmPasswordField.value !== "") {
            eyeIcon2.style.display = "inline-block";
            lockIcon2.style.display = "none";
        } else {
            eyeIcon2.style.display = "none";
            lockIcon2.style.display = "inline-block";
        }
    });

    function togglePassword() {
        if (passwordField.type === "password") {
            passwordField.type = "text";
            eyeIcon.classList.remove("fa-eye");
            eyeIcon.classList.add("fa-eye-slash");
        } else {
            passwordField.type = "password";
            eyeIcon.classList.remove("fa-eye-slash");
            eyeIcon.classList.add("fa-eye");
        }
    }

    function togglePassword2() {
        if (confirmPasswordField.type === "password") {
            confirmPasswordField.type = "text";
            eyeIcon2.classList.remove("fa-eye");
            eyeIcon2.classList.add("fa-eye-slash");
        } else {
            confirmPasswordField.type = "password";
            eyeIcon2.classList.remove("fa-eye-slash");
            eyeIcon2.classList.add("fa-eye");
        }
    }



    