let validationStatus = {
    document: false,
    names: false,
    lastnames: false,
    age: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    terms: false
};

let verificationCodeSent = false;
let actualVerificationCode = '';

window.onload = function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        alert('Ya tienes una sesión activa. Redirigiendo...');
        window.location.href = 'primermodulo.html';
        return;
    }
    
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('mainContent').classList.add('active');
    }, 1500);
};

function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password img');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.src = 'https://cdn-icons-png.flaticon.com/512/64/64943.png';
    } else {
        passwordField.type = 'password';
        toggleIcon.src = 'https://images.icon-icons.com/2717/PNG/512/eye_closed_icon_173849.png';
    }
}

function toggleNewPassword() {
    const passwordField = document.getElementById('new-password');
    const toggleIcon = passwordField.nextElementSibling.querySelector('img');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.src = 'https://cdn-icons-png.flaticon.com/512/64/64943.png';
    } else {
        passwordField.type = 'password';
        toggleIcon.src = 'https://images.icon-icons.com/2717/PNG/512/eye_closed_icon_173849.png';
    }
}

function toggleConfirmPassword() {
    const passwordField = document.getElementById('confirm-password');
    const toggleIcon = passwordField.nextElementSibling.querySelector('img');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.src = 'https://cdn-icons-png.flaticon.com/512/64/64943.png';
    } else {
        passwordField.type = 'password';
        toggleIcon.src = 'https://images.icon-icons.com/2717/PNG/512/eye_closed_icon_173849.png';
    }
}

function toggleRecoveryPassword() {
    const passwordField = document.getElementById('new-password-recovery');
    const toggleIcon = passwordField.nextElementSibling.querySelector('img');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.src = 'https://cdn-icons-png.flaticon.com/512/64/64943.png';
    } else {
        passwordField.type = 'password';
        toggleIcon.src = 'https://images.icon-icons.com/2717/PNG/512/eye_closed_icon_173849.png';
    }
}

function toggleConfirmRecoveryPassword() {
    const passwordField = document.getElementById('confirm-password-recovery');
    const toggleIcon = passwordField.nextElementSibling.querySelector('img');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.src = 'https://cdn-icons-png.flaticon.com/512/64/64943.png';
    } else {
        passwordField.type = 'password';
        toggleIcon.src = 'https://images.icon-icons.com/2717/PNG/512/eye_closed_icon_173849.png';
    }
}

function showModal() {
    document.getElementById('createAccountModal').style.display = 'flex';
    toggleCharacterVerifier();
    updateProgress();
}

function closeModal() {
    document.getElementById('createAccountModal').style.display = 'none';
}

function showForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'flex';
    verificationCodeSent = false;
    document.getElementById('verification-section').style.display = 'none';
    document.getElementById('recovery-btn').textContent = 'Enviar Código';
    document.getElementById('recovery-success').textContent = '';
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
}

function showTerms() {
    document.getElementById('termsModal').style.display = 'flex';
}

function closeTermsModal() {
    document.getElementById('termsModal').style.display = 'none';
}

function showPrivacyPolicy() {
    document.getElementById('privacyModal').style.display = 'flex';
}

function closePrivacyModal() {
    document.getElementById('privacyModal').style.display = 'none';
}

function toggleCharacterVerifier() {
    const documentType = document.getElementById('document-type').value;
    const characterVerifierGroup = document.getElementById('character-verifier-group');
    const characterVerifier = document.getElementById('character-verifier');
    
    if (documentType === 'dni') {
        characterVerifierGroup.style.display = 'flex';
        characterVerifier.required = true;
    } else {
        characterVerifierGroup.style.display = 'none';
        characterVerifier.required = false;
        validationStatus.document = true;
    }
    updateProgress();
}

window.onclick = function(event) {
    const createModal = document.getElementById('createAccountModal');
    const forgotModal = document.getElementById('forgotPasswordModal');
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
    
    if (event.target === createModal) {
        closeModal();
    }
    if (event.target === forgotModal) {
        closeForgotPasswordModal();
    }
    if (event.target === termsModal) {
        closeTermsModal();
    }
    if (event.target === privacyModal) {
        closePrivacyModal();
    }
};

function handlePasswordRecovery(event) {
    event.preventDefault();
    
    const email = document.getElementById('recovery-email').value;
    const successMsg = document.getElementById('recovery-success');
    const recoveryBtn = document.getElementById('recovery-btn');
    
    if (!verificationCodeSent) {
        actualVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Código de verificación:', actualVerificationCode);
        
        successMsg.textContent = '✅ Código enviado a ' + email + '. Revisa tu correo.';
        successMsg.style.color = '#90ee90';
        
        document.getElementById('verification-section').style.display = 'block';
        recoveryBtn.textContent = 'Restablecer Contraseña';
        verificationCodeSent = true;
        
        setTimeout(() => {
            successMsg.textContent = '';
        }, 5000);
    } else {
        const code = document.getElementById('verification-code').value;
        const newPassword = document.getElementById('new-password-recovery').value;
        const confirmPassword = document.getElementById('confirm-password-recovery').value;
        const codeError = document.getElementById('code-error');
        const passwordError = document.getElementById('recovery-password-error');
        
        if (code !== actualVerificationCode) {
            codeError.textContent = 'Código incorrecto';
            return;
        } else {
            codeError.textContent = '';
        }
        
        if (newPassword.length < 8) {
            passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres';
            return;
        }
        
        if (newPassword !== confirmPassword) {
            passwordError.textContent = 'Las contraseñas no coinciden';
            return;
        } else {
            passwordError.textContent = '';
        }
        
        successMsg.textContent = '✅ ¡Contraseña restablecida exitosamente!';
        successMsg.style.color = '#90ee90';
        
        setTimeout(() => {
            closeForgotPasswordModal();
            alert('Contraseña actualizada. Ya puedes iniciar sesión.');
        }, 2000);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const correo = document.getElementById('id_paciente').value;
    const contrasena = document.getElementById('password').value;
    const recordar = document.getElementById('recordar').checked;
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Validando...';
    submitBtn.disabled = true;
    
    // Validación local para administrador
    if (correo === 'admin@essalud.pe' && contrasena === 'AdminJhordan') {
        localStorage.setItem('userId', correo);
        localStorage.setItem('workerName', 'Administrador');
        
        if (recordar) {
            localStorage.setItem('rememberedUser', correo);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        alert('¡Login exitoso! Bienvenido Administrador');
        window.location.href = 'Dashboard.html';
        return;
    }
    
    // Validación normal para usuarios regulares
    try {
        const response = await fetch('https://cirochat.duckdns.org/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: correo,
                contrasena: contrasena
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('userId', correo);
            localStorage.setItem('workerName', data.nombre || data.name || 'Usuario');
            
            if (recordar) {
                localStorage.setItem('rememberedUser', correo);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            if (data.user_data) {
                localStorage.setItem('userData', JSON.stringify(data.user_data));
            }
            
            alert('¡Login exitoso! Bienvenido ' + (data.nombre || data.name || 'Usuario'));
            window.location.href = 'PrimerModulo.html';
            
        } else {
            alert('Error: ' + (data.message || 'Credenciales incorrectas'));
        }
        
    } catch (error) {
        console.error('Error de login:', error);
        alert('Error de conexión: No se pudo conectar al servidor. Intente más tarde.');
        
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function checkRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('id_paciente').value = rememberedUser;
        document.getElementById('recordar').checked = true;
    }
}

setTimeout(() => {
    checkRememberedUser();
}, 1600);

function validateDocumentNumber() {
    const documentType = document.getElementById('document-type').value;
    const documentNumber = document.getElementById('document-number').value;
    const errorElement = document.getElementById('document-error');
    const inputElement = document.getElementById('document-number');
    
    let isValid = false;
    
    if (documentType === 'dni') {
        if (!/^\d{8}$/.test(documentNumber)) {
            errorElement.textContent = 'El DNI debe tener exactamente 8 dígitos';
            inputElement.classList.add('error');
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            isValid = true;
        }
    } else {
        if (!/^[A-Za-z0-9]{6,12}$/.test(documentNumber)) {
            errorElement.textContent = 'El documento debe tener entre 6 y 12 caracteres';
            inputElement.classList.add('error');
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            isValid = true;
        }
    }
    
    validationStatus.document = isValid;
    updateProgress();
}

function validateNames() {
    const names = document.getElementById('full-names').value;
    const lastNames = document.getElementById('last-names').value;
    const namesError = document.getElementById('names-error');
    const lastnamesError = document.getElementById('lastnames-error');
    const namesInput = document.getElementById('full-names');
    const lastnamesInput = document.getElementById('last-names');
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(names)) {
        namesError.textContent = 'Solo letras y espacios (2-50 caracteres)';
        namesInput.classList.add('error');
        validationStatus.names = false;
    } else {
        namesError.textContent = '';
        namesInput.classList.remove('error');
        validationStatus.names = true;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/.test(lastNames)) {
        lastnamesError.textContent = 'Solo letras y espacios (2-50 caracteres)';
        lastnamesInput.classList.add('error');
        validationStatus.lastnames = false;
    } else {
        lastnamesError.textContent = '';
        lastnamesInput.classList.remove('error');
        validationStatus.lastnames = true;
    }
    
    updateProgress();
}

function validateAge() {
    const birthDate = new Date(document.getElementById('birth-date').value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    const errorElement = document.getElementById('age-error');
    const inputElement = document.getElementById('birth-date');
    
    if (age < 18) {
        errorElement.textContent = 'Debes ser mayor de 18 años';
        inputElement.classList.add('error');
        validationStatus.age = false;
    } else if (age > 120) {
        errorElement.textContent = 'Verifica la fecha de nacimiento';
        inputElement.classList.add('error');
        validationStatus.age = false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.age = true;
    }
    
    updateProgress();
}

function validateEmail() {
    const email = document.getElementById('email').value;
    const errorElement = document.getElementById('email-error');
    const inputElement = document.getElementById('email');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        errorElement.textContent = 'Correo electrónico inválido';
        inputElement.classList.add('error');
        validationStatus.email = false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.email = true;
    }
    
    updateProgress();
}

function validatePhone() {
    const phone = document.getElementById('phone').value;
    const errorElement = document.getElementById('phone-error');
    const inputElement = document.getElementById('phone');
    
    if (!/^9\d{8}$/.test(phone)) {
        errorElement.textContent = '9 dígitos, comenzando con 9';
        inputElement.classList.add('error');
        validationStatus.phone = false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.phone = true;
    }
    
    updateProgress();
}

function validatePassword() {
    const password = document.getElementById('new-password').value;
    const errorElement = document.getElementById('password-error');
    const inputElement = document.getElementById('new-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    let strength = 0;
    let messages = [];
    
    if (password.length < 8) {
        messages.push('Mín. 8 caracteres');
    } else {
        strength += 20;
    }
    
    if (!/[a-z]/.test(password)) {
        messages.push('Una minúscula');
    } else {
        strength += 20;
    }
    
    if (!/[A-Z]/.test(password)) {
        messages.push('Una mayúscula');
    } else {
        strength += 20;
    }
    
    if (!/\d/.test(password)) {
        messages.push('Un número');
    } else {
        strength += 20;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        messages.push('Un carácter especial');
    } else {
        strength += 20;
    }
    
    strengthBar.style.width = strength + '%';
    
    if (strength < 40) {
        strengthText.textContent = 'Muy débil';
        strengthBar.style.background = 'linear-gradient(90deg, #ff4757, #ff3838)';
    } else if (strength < 60) {
        strengthText.textContent = 'Débil';
        strengthBar.style.background = 'linear-gradient(90deg, #ffa502, #ff6348)';
    } else if (strength < 80) {
        strengthText.textContent = 'Media';
        strengthBar.style.background = 'linear-gradient(90deg, #ffb142, #ff9ff3)';
    } else if (strength < 100) {
        strengthText.textContent = 'Fuerte';
        strengthBar.style.background = 'linear-gradient(90deg, #7bed9f, #70a1ff)';
    } else {
        strengthText.textContent = 'Muy fuerte';
        strengthBar.style.background = 'linear-gradient(90deg, #2ed573, #1e90ff)';
    }
    
    if (messages.length > 0) {
        errorElement.textContent = 'Faltan: ' + messages.join(', ');
        inputElement.classList.add('error');
        validationStatus.password = false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.password = true;
    }
    
    validatePasswordMatch();
    updateProgress();
}

function validatePasswordMatch() {
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('confirm-password-error');
    const inputElement = document.getElementById('confirm-password');
    
    if (confirmPassword === '') {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.confirmPassword = false;
    } else if (password !== confirmPassword) {
        errorElement.textContent = 'Las contraseñas no coinciden';
        inputElement.classList.add('error');
        validationStatus.confirmPassword = false;
    } else {
        errorElement.textContent = '';
        inputElement.classList.remove('error');
        validationStatus.confirmPassword = true;
    }
    
    updateProgress();
}

function updateProgress() {
    const totalFields = Object.keys(validationStatus).length;
    const validFields = Object.values(validationStatus).filter(status => status).length;
    const progress = (validFields / totalFields) * 100;
    
    document.getElementById('progressFill').style.width = progress + '%';
    
    const termsChecked = document.getElementById('terms').checked;
    validationStatus.terms = termsChecked;
    
    const allValid = Object.values(validationStatus).every(status => status) && termsChecked;
    document.getElementById('register-btn').disabled = !allValid;
}

async function handleRegister(event) {
    event.preventDefault();
    
    const allValid = Object.values(validationStatus).every(status => status);
    const termsChecked = document.getElementById('terms').checked;
    
    if (!allValid || !termsChecked) {
        alert('Por favor complete correctamente todos los campos');
        return;
    }
    
    const formData = {
        tipoDocumento: document.getElementById('document-type').value === 'dni' ? 'DNI' : 'CE',
        numeroDocumento: document.getElementById('document-number').value,
        caracterVerificador: document.getElementById('character-verifier').value,
        nombres: document.getElementById('full-names').value,
        apellidos: document.getElementById('last-names').value,
        fechaNacimiento: document.getElementById('birth-date').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('phone').value,
        password: document.getElementById('new-password').value
    };
    
    const submitBtn = document.getElementById('register-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registrando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('https://cirochat.duckdns.org/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`¡Cuenta creada exitosamente!\n\nCódigo de Paciente: ${data.codigo_paciente}\n\nYa puedes iniciar sesión con tu correo: ${data.email}`);
            
            closeModal();
            document.getElementById('id_paciente').value = data.email;
            
            document.querySelector('.modal-form').reset();
            validationStatus = {
                document: false,
                names: false,
                lastnames: false,
                age: false,
                email: false,
                phone: false,
                password: false,
                confirmPassword: false,
                terms: false
            };
            updateProgress();
            
        } else {
            alert('Error al crear cuenta: ' + (data.message || 'Error desconocido'));
        }
        
    } catch (error) {
        console.error('Error de registro:', error);
        alert('Error de conexión: No se pudo conectar al servidor. Intente más tarde.');
        
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', updateProgress);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const createModal = document.getElementById('createAccountModal');
        const forgotModal = document.getElementById('forgotPasswordModal');
        const termsModal = document.getElementById('termsModal');
        const privacyModal = document.getElementById('privacyModal');
        
        if (createModal.style.display === 'flex') {
            closeModal();
        }
        if (forgotModal.style.display === 'flex') {
            closeForgotPasswordModal();
        }
        if (termsModal.style.display === 'flex') {
            closeTermsModal();
        }
        if (privacyModal.style.display === 'flex') {
            closePrivacyModal();
        }
    }
});
