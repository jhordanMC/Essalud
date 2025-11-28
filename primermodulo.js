// ============ FUNCIONES PERFIL ============
async function loadUserProfile() {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert('No se encontró información de sesión');
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('profile-loader').style.display = 'block';
    document.getElementById('profile-content').style.display = 'none';
    document.getElementById('profile-error').style.display = 'none';
    
    try {
        const response = await fetch('https://cirochat.duckdns.org/get_patient_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_paciente: userId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Error al obtener perfil');
        }
        
        const perfil = data.perfil;
        
        const initials = perfil.nombre_completo.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
        document.getElementById('profile-avatar-text').textContent = initials;
        
        document.getElementById('profile-name').textContent = perfil.nombre_completo;
        document.getElementById('profile-code').textContent = perfil.codigo_paciente;
        document.getElementById('profile-document').textContent = `${perfil.tipo_documento}: ${perfil.numero_documento}`;
        document.getElementById('profile-birth').textContent = perfil.fecha_nacimiento;
        document.getElementById('profile-age').textContent = perfil.edad ? `${perfil.edad} años` : 'No disponible';
        
        document.getElementById('profile-email').textContent = perfil.correo;
        document.getElementById('profile-phone').textContent = perfil.telefono;
        
        document.getElementById('profile-username').textContent = perfil.usuario;
        document.getElementById('profile-id').textContent = perfil.id_paciente;
        document.getElementById('profile-register-date').textContent = perfil.fecha_registro;
        
        document.getElementById('profile-loader').style.display = 'none';
        document.getElementById('profile-content').style.display = 'block';
        
    } catch (error) {
        console.error('Error cargando perfil:', error);
        
        document.getElementById('profile-loader').style.display = 'none';
        document.getElementById('profile-error').style.display = 'block';
        document.getElementById('profile-error-message').textContent = error.message;
    }
}

document.getElementById('view-profile').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('profile-modal').classList.add('active');
    document.getElementById('user-menu').style.display = 'none';
    loadUserProfile();
});

document.getElementById('close-profile-modal').addEventListener('click', function() {
    document.getElementById('profile-modal').classList.remove('active');
});

document.getElementById('profile-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        this.classList.remove('active');
    }
});

// ============ ROBOT 3D ============
let scene, camera, renderer, robot;
let leftPupil, rightPupil, leftShine, rightShine;
let leftEye, rightEye;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isChatOpen = false;

function initBot() {
    const canvas = document.getElementById('bot-canvas');
    
    scene = new THREE.Scene();
    updateSceneBackground();

    camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 15);

    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    
    updateRendererSize();
    renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    createRobot();
    document.addEventListener('mousemove', onMouseMove);
    animateBot();
}

function updateSceneBackground() {
    if (isChatOpen) {
        scene.background = null;
    } else {
        scene.background = new THREE.Color(0xffffff);
    }
}

function updateRendererSize() {
    const container = document.getElementById('support-button');
    const size = isChatOpen ? 150 : 100;
    renderer.setSize(size, size);
}

function onMouseMove(event) {
    if (isChatOpen) {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;

        targetRotationY = mouseX * 0.5;
        targetRotationX = mouseY * 0.5;
    }
}

function createRobot() {
    robot = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#00FFCC');
    gradient.addColorStop(1, '#00CC66');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const gradientTexture = new THREE.CanvasTexture(canvas);

    const headGeometry = new THREE.SphereGeometry(3, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
        map: gradientTexture,
        shininess: 30
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.scale.set(1, 0.75, 0.6);
    head.castShadow = true;
    robot.add(head);

    const goggleGeometry = new THREE.SphereGeometry(1, 32, 32);
    const goggleMaterial = new THREE.MeshPhongMaterial({
        color: 0x66CCFF,
        shininess: 60,
        transparent: true,
        opacity: 0.85
    });

    const leftGoggle = new THREE.Mesh(goggleGeometry, goggleMaterial);
    leftGoggle.position.set(-1.3, 1.2, 1.5);
    leftGoggle.scale.set(1.3, 0.9, 0.4);
    robot.add(leftGoggle);

    const rightGoggle = new THREE.Mesh(goggleGeometry, goggleMaterial);
    rightGoggle.position.set(1.3, 1.2, 1.5);
    rightGoggle.scale.set(1.3, 0.9, 0.4);
    robot.add(rightGoggle);

    const goggleRimGeometry = new THREE.TorusGeometry(1.15, 0.08, 16, 32);
    const rimMaterial = new THREE.MeshPhongMaterial({
        color: 0x3399FF,
        shininess: 80
    });

    const leftRim = new THREE.Mesh(goggleRimGeometry, rimMaterial);
    leftRim.position.set(-1.3, 1.2, 1.7);
    leftRim.scale.set(1.13, 0.78, 1);
    robot.add(leftRim);

    const rightRim = new THREE.Mesh(goggleRimGeometry, rimMaterial);
    rightRim.position.set(1.3, 1.2, 1.7);
    rightRim.scale.set(1.13, 0.78, 1);
    robot.add(rightRim);

    const faceGeometry = new THREE.SphereGeometry(2.5, 32, 32);
    const faceMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        shininess: 40
    });
    const face = new THREE.Mesh(faceGeometry, faceMaterial);
    face.position.set(0, -0.8, 1.2);
    face.scale.set(0.95, 0.36, 0.45);
    robot.add(face);

    const eyeGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        shininess: 100
    });

    leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.8, -0.5, 2.1);
    robot.add(leftEye);

    rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.8, -0.5, 2.1);
    robot.add(rightEye);

    const pupilGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const pupilMaterial = new THREE.MeshPhongMaterial({
        color: 0x00c4ff,
        emissive: 0x00c4ff,
        emissiveIntensity: 0.4,
        shininess: 100
    });

    leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.8, -0.5, 2.5);
    robot.add(leftPupil);

    rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.8, -0.5, 2.5);
    robot.add(rightPupil);

    const shineGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const shineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff
    });

    leftShine = new THREE.Mesh(shineGeometry, shineMaterial);
    leftShine.position.set(-0.7, -0.4, 2.65);
    robot.add(leftShine);

    rightShine = new THREE.Mesh(shineGeometry, shineMaterial);
    rightShine.position.set(0.9, -0.4, 2.65);
    robot.add(rightShine);

    const shoulderGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const shoulderMaterial = new THREE.MeshPhongMaterial({
        map: gradientTexture,
        shininess: 60
    });

    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.set(-3.2, 0.5, 0);
    robot.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.position.set(3.2, 0.5, 0);
    robot.add(rightShoulder);

    const armGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
    const armMaterial = new THREE.MeshPhongMaterial({
        color: 0x00BFFF,
        shininess: 50
    });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-3.8, 0, 0);
    robot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(3.8, 0, 0);
    robot.add(rightArm);

    const antennaGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const antennaMaterial = new THREE.MeshPhongMaterial({
        color: 0x00FFFF,
        emissive: 0x00FFFF,
        emissiveIntensity: 0.5
    });

    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.position.set(-3.8, 1.2, 0);
    robot.add(leftAntenna);

    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.position.set(3.8, 1.2, 0);
    robot.add(rightAntenna);

    scene.add(robot);
}

let blinkTime = 0;
let nextBlink = 3000;
let isBlinking = false;

function animateBot() {
    requestAnimationFrame(animateBot);

    if (isChatOpen) {
        robot.rotation.y += (targetRotationY - robot.rotation.y) * 0.05;
        robot.rotation.x += (targetRotationX - robot.rotation.x) * 0.05;

        const pupilMoveX = mouseX * 0.2;
        const pupilMoveY = -mouseY * 0.2;

        leftPupil.position.x = -0.8 + pupilMoveX;
        leftPupil.position.y = -0.5 + pupilMoveY;
        rightPupil.position.x = 0.8 + pupilMoveX;
        rightPupil.position.y = -0.5 + pupilMoveY;

        leftShine.position.x = -0.7 + pupilMoveX;
        leftShine.position.y = -0.4 + pupilMoveY;
        rightShine.position.x = 0.9 + pupilMoveX;
        rightShine.position.y = -0.4 + pupilMoveY;
    } else {
        robot.rotation.y += 0.01;
    }

    blinkTime += 16;
    if (blinkTime > nextBlink && !isBlinking) {
        isBlinking = true;
        blinkEyes();
        blinkTime = 0;
        nextBlink = 2800 + Math.random() * 1200;
    }

    renderer.render(scene, camera);
}

function blinkEyes() {
    leftEye.scale.y = 0.1;
    rightEye.scale.y = 0.1;
    leftPupil.scale.y = 0.1;
    rightPupil.scale.y = 0.1;
    leftShine.scale.y = 0.1;
    rightShine.scale.y = 0.1;

    setTimeout(() => {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
        leftPupil.scale.y = 1;
        rightPupil.scale.y = 1;
        leftShine.scale.y = 1;
        rightShine.scale.y = 1;
        isBlinking = false;
    }, 180);
}

window.addEventListener('load', function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('No has iniciado sesión. Serás redirigido a la página de inicio.');
        window.location.href = 'index.html';
        return;
    }
    personalizeScripts();
    initBot();
});

function personalizeScripts() {
    const workerName = localStorage.getItem('workerName') || 'Usuario';
    const initials = workerName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('user-initials').textContent = initials;
}

document.getElementById('user-menu-button').addEventListener('click', function(e) {
    const menu = document.getElementById('user-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
        localStorage.clear();
        alert("Sesión cerrada correctamente.");
        window.location.href = 'index.html';
    }
    document.getElementById('user-menu').style.display = 'none';
});

document.addEventListener('click', function(e) {
    const menu = document.getElementById('user-menu');
    const button = document.getElementById('user-menu-button');
    if (!menu.contains(e.target) && e.target !== button) {
        menu.style.display = 'none';
    }
});

const supportButton = document.getElementById('support-button');
const chatShell = document.getElementById('chat-shell');

supportButton.addEventListener('click', function() {
    chatShell.classList.toggle('active');
    isChatOpen = chatShell.classList.contains('active');
    
    if (isChatOpen) {
        supportButton.classList.add('chat-active');
        updateRendererSize();
        updateSceneBackground();
        mouseX = 0;
        mouseY = 0;
        targetRotationX = 0;
        targetRotationY = 0;
    } else {
        supportButton.classList.remove('chat-active');
        updateRendererSize();
        updateSceneBackground();
    }
});

document.getElementById('close-chat').addEventListener('click', function() {
    chatShell.classList.remove('active');
    supportButton.classList.remove('chat-active');
    isChatOpen = false;
    updateRendererSize();
    updateSceneBackground();
});

document.getElementById('minimize-chat').addEventListener('click', function() {
    chatShell.classList.remove('active');
    supportButton.classList.remove('chat-active');
    isChatOpen = false;
    updateRendererSize();
    updateSceneBackground();
});

// ============ CHAT GEMINI FUNCTIONALITY ============
(function(){
    const textarea = document.querySelector('textarea.GrowingTextArea_textArea__ZWQbP');
    const sendBtn = document.querySelector('[data-button-send]');
    const fileBtn = document.querySelector('[data-button-file-input]');
    const fileInput = document.querySelector('input.ChatMessageFileInputButton_input__svNx4');
    const clearBtn = document.querySelector('[data-button-chat-break]');
    const chatBody = document.getElementById('chatBody');
    const voiceBtn = document.querySelector('[data-button-voice-input]');
    let recognition;
    let isRecording = false;
    
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech Recognition no está soportado en este navegador');
            return null;
        }
        
        recognition = new SpeechRecognition();
        recognition.lang = 'es-PE';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = transcript;
            syncHeight();
            updateState();
        };
        
        recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
            stopRecording();
            alert('Error al reconocer voz: ' + event.error);
        };
        
        recognition.onend = () => {
            stopRecording();
        };
        
        return recognition;
    }

    function startRecording() {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {}
        }
        
        recognition = initSpeechRecognition();
        
        if (!recognition) {
            alert('Reconocimiento de voz no disponible en este navegador');
            return;
        }
        
        isRecording = true;
        voiceBtn.style.background = '#ff4444';
        voiceBtn.querySelector('svg').style.color = '#ffffff';
        
        try {
            recognition.start();
        } catch (e) {
            console.error('Error al iniciar grabación:', e);
            stopRecording();
            alert('No se pudo iniciar el reconocimiento de voz. Intenta de nuevo.');
        }
    }

    function stopRecording() {
        isRecording = false;
        voiceBtn.style.background = '';
        voiceBtn.querySelector('svg').style.color = '';
        
        if (recognition) {
            try {
                recognition.stop();
                recognition = null;
            } catch (e) {}
        }
    }
    
    recognition = initSpeechRecognition();

    if (recognition) {
        voiceBtn.disabled = false;
        voiceBtn.title = 'Entrada de voz (clic para grabar)';
        voiceBtn.classList.remove('button_isDisabled__pJu5B');
        
        voiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }

    function syncHeight() {
        textarea.style.height = 'auto';
        const h = textarea.scrollHeight;
        textarea.style.height = (Math.min(h, 160)) + 'px';
    }

    function updateState() {
        const empty = textarea.value.trim().length === 0;
        sendBtn.disabled = empty;
        const container = document.querySelector('.ChatMessageInputContainer_inputContainer__s2AGa');
        container.setAttribute('data-input-is-empty', empty ? 'true' : 'false');
    }

    textarea.addEventListener('input', () => {
        syncHeight();
        updateState();
    });

    fileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length) {
            const p = document.createElement('div');
            p.style.opacity = '.9';
            p.style.fontSize = '13px';
            p.style.marginBottom = '8px';
            p.textContent = 'Archivo(s) adjuntos: ' + Array.from(files).map(f => f.name).join(', ');
            chatBody.appendChild(p);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Borrar todo el contexto del chat?')) {
            chatBody.innerHTML = '<p style="opacity:.6">¡Hola! Soy Ciro, tu asistente médico. 👋 ¿En qué puedo ayudarte?</p>';
        }
    });

    function createMessageBubble(sender, content, isError = false) {
        const bubble = document.createElement('div');
        if (isError) {
            bubble.style.background = '#ffebee';
            bubble.style.color = '#c62828';
            bubble.style.borderLeft = '4px solid #d32f2f';
        } else if (sender === 'Tú') {
            bubble.style.background = '#0078D7';
            bubble.style.color = '#ffffff';
            bubble.style.marginLeft = 'auto';
            bubble.style.maxWidth = '85%';
            bubble.style.borderRadius = '12px 12px 4px 12px';
        } else {
            bubble.style.background = 'white';
            bubble.style.color = '#333';
            bubble.style.border = '1px solid #e0e0e0';
            bubble.style.borderLeft = '4px solid #0078D7';
            bubble.style.maxWidth = '85%';
        }
        bubble.style.padding = '12px 14px';
        bubble.style.borderRadius = bubble.style.borderRadius || '12px';
        bubble.style.marginBottom = '8px';
        bubble.style.fontSize = '14px';
        bubble.style.lineHeight = '1.4';
        bubble.textContent = `${sender}: ${content}`;
        return bubble;
    }

    function createOptionsButtons(options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'chat-options';
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'chat-option-button';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                sendMessage(option.text);
            });
            optionsContainer.appendChild(button);
        });
        return optionsContainer;
    }

    function parseMenuResponse(response) {
        const lines = response.split('\n');
        const menuItems = lines.filter(line => line.match(/^\d+\.\s/));
        
        if (menuItems.length > 0) {
            const options = menuItems.map(line => ({
                number: line.match(/^\d+/)[0],
                text: line.replace(/^\d+\.\s/, '').trim()
            }));
            return { text: lines.filter(line => !line.match(/^\d+\.\s/)).join('\n').trim(), options };
        }
        return { text: response, options: [] };
    }

    async function sendMessage(message) {
        if (sendBtn.disabled && !message) return;
        const mensaje = message || textarea.value.trim();
        if (!mensaje) return;

        const userBubble = createMessageBubble('Tú', mensaje);
        chatBody.appendChild(userBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        textarea.value = '';
        syncHeight();
        updateState();

        sendBtn.disabled = true;
        textarea.disabled = true;

        const dots = document.querySelectorAll('.chat-floating-dot');
        dots.forEach(dot => dot.classList.add('pulsing'));

        const typingBubble = document.createElement('div');
        typingBubble.id = 'typing-bubble';
        typingBubble.style.background = '#0078D7';
        typingBubble.style.padding = '10px 12px';
        typingBubble.style.borderRadius = '10px';
        typingBubble.style.marginBottom = '8px';
        typingBubble.style.color = '#ffffff';
        typingBubble.style.opacity = '0.7';
        typingBubble.textContent = 'Ciro está pensando... 🧠';
        chatBody.appendChild(typingBubble);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const res = await fetch("https://cirochat.duckdns.org/generar_cliente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mensaje, session_id: localStorage.getItem('userId') || 'default' })
            });
            const data = await res.json();
            
            if (document.getElementById('typing-bubble')) {
                document.getElementById('typing-bubble').remove();
            }
            
            dots.forEach(dot => dot.classList.remove('pulsing'));
            
            textarea.disabled = false;
            updateState();
            
            const { text, options } = parseMenuResponse(data.respuesta || '');
            
            if (text) {
                const botBubble = createMessageBubble('Ciro', text);
                chatBody.appendChild(botBubble);
            }
            
            if (options.length > 0) {
                const optionsContainer = createOptionsButtons(options);
                chatBody.appendChild(optionsContainer);
            }
            
            chatBody.scrollTop = chatBody.scrollHeight;

        } catch (err) {
            if (document.getElementById('typing-bubble')) {
                document.getElementById('typing-bubble').remove();
            }
            
            dots.forEach(dot => dot.classList.remove('pulsing'));
            
            textarea.disabled = false;
            updateState();
            
            const errorBubble = createMessageBubble('Error', err.message, true);
            chatBody.appendChild(errorBubble);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    sendBtn.addEventListener('click', () => sendMessage());

    textarea.addEventListener('keypress', (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    syncHeight();
    updateState();
})();