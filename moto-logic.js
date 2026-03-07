// 1. REFERENCIAS GLOBALES
const modelViewer = document.querySelector('#moto-3d');
let elecciones = {}; // Objeto dinámico: solo guardará lo que el usuario toque

// 2. INICIALIZACIÓN DE ACORDEONES
// Esto funcionará en cualquier HTML que use la clase .accordion
document.addEventListener("DOMContentLoaded", () => {
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            const panel = this.nextElementSibling;
            const isActive = this.classList.contains("active");

            // 1. Cerramos todos los paneles abiertos
            for (let j = 0; j < acc.length; j++) {
                acc[j].classList.remove("active");
                acc[j].nextElementSibling.style.maxHeight = null;
            }

            // 2. Si el que clickamos no estaba activo, lo abrimos
            if (!isActive) {
                this.classList.add("active");
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
})

// 3. FUNCIÓN PARA CAMBIAR COLOR
function changeColor(piezas, color, event) {
    if (!modelViewer.model) return;

    // Convertimos a array si nos pasan un solo string
    const listaPiezas = Array.isArray(piezas) ? piezas : [piezas];

    listaPiezas.forEach(nombrePieza => {
        const material = modelViewer.model.materials.find(m => m.name === nombrePieza);
        
        if (material) {
            // Cambiar color en el 3D
            material.pbrMetallicRoughness.setBaseColorFactor(color);
            
            // ACTUALIZACIÓN: Guardar elección en el objeto global
            // Usamos una clave limpia (ej: "Tanque") para facilitar el código
            elecciones[nombrePieza] = color;
        } else {
            console.warn(`La pieza "${nombrePieza}" no existe en el modelo.`);
        }
    });

    // Resaltar botón seleccionado
    if (event && event.target) {
        const container = event.target.parentElement;
        container.querySelectorAll('.color-dot').forEach(btn => btn.classList.remove('selected-option'));
        event.target.classList.add('selected-option');
    }

    // NUEVO: Generar el código automáticamente al cambiar algo
    generarCodigoConfiguracion();
}


/// 4. FUNCIÓN PARA CAMBIAR ACABADO (ROUGHNESS)
function setRoughness(pieza, valor, event) {
    if (!modelViewer.model) return;

    // Buscamos el material por nombre
    const material = modelViewer.model.materials.find(m => m.name === pieza);
    
    if (material) {
        // 1. Aplicamos el acabado en el modelo 3D
        material.pbrMetallicRoughness.setRoughnessFactor(valor);
        
        // 2. GUARDADO PARA EL CÓDIGO: 
        // Guardamos el valor numérico como string (ej: "0.5") para que el diccionario lo reconozca
        elecciones[pieza + "_Rough"] = valor.toString();

        // 3. Feedback visual: Resaltar el botón seleccionado
        if (event && event.target) {
            const container = event.target.parentElement;
            container.querySelectorAll('.btn-finish').forEach(btn => {
                btn.classList.remove('selected-option');
            });
            event.target.classList.add('selected-option');
        }

        // 4. Actualizamos el código de la Topbar automáticamente
        if (typeof generarCodigoConfiguracion === "function") {
            generarCodigoConfiguracion();
        }
    } else {
        console.warn(`No se encontró el material: ${pieza}`);
    }
}

// Para el tacómetro, actualizamos el valor de la variable
const originalToggleTacometro = toggleTacometro;
toggleTacometro = function(tipo) {
    originalToggleTacometro(tipo); // Ejecuta el cambio visual que ya tenías
    elecciones.tacometro = tipo === 'analogico' ? "Analógico Retro" : "Digital Moderno";
}

   // Variable para rastrear el estado
let tacometroActual = 'analogico';

// Ejecutar configuración inicial cuando el modelo cargue
modelViewer.addEventListener('load', () => {
    console.log("Modelo cargado, configurando tacómetros...");
    // Forzamos el estado inicial
    toggleTacometro('analogico');
});

function toggleTacometro(tipo) {
    const materiales = modelViewer.model.materials;
    
    materiales.forEach(mat => {
        // Buscamos los materiales específicos
        if (mat.name === "Tacometro_Analogico" || mat.name === "Tacometro_Digital") {
            
            if (tipo === 'analogico') {
                if (mat.name === "Tacometro_Analogico") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "Tacometro_Digital") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el analógico
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            }
        }
    });

    // Feedback visual en los botones (opcional)
    document.getElementById('btn-analog').style.borderColor = (tipo === 'analogico') ? 'var(--accent)' : '#333';
    document.getElementById('btn-digital').style.borderColor = (tipo === 'digital') ? 'var(--accent)' : '#333';
}


// Para el RUEDA DEL, actualizamos el valor de la variable
const originaltoggleRuedaDEL = toggleRuedaDEL;
toggleRuedaDEL = function(tipo) {
    originaltoggleRuedaDEL(tipo); // Ejecuta el cambio visual que ya tenías
    elecciones.rueda = tipo === 'taco' ? "Rueda Taco" : "Rueda Liso";
}

   // Variable para rastrear el estado
let ruedaActual = 'taco'; 

// Ejecutar configuración inicial cuando el modelo cargue
modelViewer.addEventListener('load', () => {
    console.log("Modelo cargado, configurando ruedas...");
    // Forzamos el estado inicial
    toggleRuedaDEL('taco');
});

function toggleRuedaDEL(tipo) {
    const materiales = modelViewer.model.materials;
    
    materiales.forEach(mat => {
        // Buscamos los materiales específicos
        if (mat.name === "Neumatico_taco_delantero" || mat.name === "Neumatico_liso_delantero") {
            
            if (tipo === 'taco') {
                if (mat.name === "Neumatico_taco_delantero") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "Neumatico_liso_delantero") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el analógico
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            }
        }
    });

    // Feedback visual en los botones (opcional)
    document.getElementById('btn-taco').style.borderColor = (tipo === 'taco') ? 'var(--accent)' : '#333';
    document.getElementById('btn-liso').style.borderColor = (tipo === 'liso') ? 'var(--accent)' : '#333';
}

// Para el LLANTAS, actualizamos el valor de la variable
const originaltoggleLlanta = toggleLlanta;
toggleLlanta = function(tipo) {
    originaltoggleLlanta(tipo); // Ejecuta el cambio visual que ya tenías
    elecciones.Llanta = tipo === 'radios' ? "Llanta Radio" : "Llanta Mecanizada";
}

   // Variable para rastrear el estado
let ruedaLlanta = 'radios'; 

// Ejecutar configuración inicial cuando el modelo cargue
modelViewer.addEventListener('load', () => {
    console.log("Modelo cargado, configurando ruedas...");
    // Forzamos el estado inicial
    toggleLlanta('radios');
});

function toggleLlanta(tipo) {
    const materiales = modelViewer.model.materials;
    
    materiales.forEach(mat => {
        // Buscamos los materiales específicos
        if (mat.name === "Llanta_radios" || mat.name === "Llanta_mecanizada") {
            
            if (tipo === 'radios') {
                if (mat.name === "Llanta_radios") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "Llanta_mecanizada") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el analógico
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            }
            elecciones['tipo_llanta'] = tipo; // Guardamos 'radios' o 'mecanizada'
            generarCodigoConfiguracion();
        }
    });

    // Feedback visual en los botones (opcional)
    document.getElementById('btn-radios').style.borderColor = (tipo === 'radios') ? 'var(--accent)' : '#333';
    document.getElementById('btn-mecanizada').style.borderColor = (tipo === 'mecanizada') ? 'var(--accent)' : '#333';
}


// 5. NAVEGACIÓN INTERNA (Pasos del formulario)
function irAFormulario() {
    document.getElementById('paso-personalizacion').style.display = 'none';
    document.getElementById('paso-formulario').style.display = 'block';
    const titulo = document.getElementById('sidebar-title');
    if (titulo) titulo.innerText = 'TUS DATOS';
}

function irAConfigurador() {
    document.getElementById('paso-personalizacion').style.display = 'block';
    document.getElementById('paso-formulario').style.display = 'none';
    const titulo = document.getElementById('sidebar-title');
    if (titulo) titulo.innerText = 'CONFIGURADOR';
}



// 6. ENVÍO DE PRESUPUESTO CON EMAILJS
function enviarPresupuesto() {
    // REEMPLAZA CON TU KEY REAL
    emailjs.init("QHoeF582bi-La1HhP"); 

    const btnText = document.getElementById('text-btn');
    const nombre = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const notas = document.getElementById('user-message')?.value || "";

    if (!nombre || !email) {
        alert("Por favor, rellena nombre y email.");
        return;
    }

    if (btnText) btnText.innerText = "Enviando...";

    // Captura de foto automática desde ángulo profesional
    modelViewer.cameraOrbit = "135deg 75deg 105%";
    modelViewer.jumpCameraToGoal();

    // CAPTURAMOS EL NUEVO SELECTOR
    const tieneMoto = document.getElementById('user-disponibilidad').value;

    // Esperamos a que la cámara se mueva para sacar la foto
    setTimeout(() => {
        let fotoBase64 = "";
        try {
            fotoBase64 = modelViewer.toDataURL("image/jpeg", 0.5);
        } catch (e) {
            console.error("Error capturando imagen:", e);
        }

        const templateParams = {
            nombre: nombre,
            email: email,
            disponibilidad: tieneMoto === 'si' ? 'Ya tiene la moto' : 'No tiene la moto', // Esto lo hace más legible en el mail
            notas: notas,
            foto_moto: fotoBase64,
            ...elecciones // Aquí se envían todas las piezas que se hayan tocado
        };

        emailjs.send("service_6j2xk4j", "template_mx1wmrn", templateParams)
            .then(() => {
                alert("¡Presupuesto enviado con éxito!");
                if (btnText) btnText.innerText = "Enviar";
            })
            .catch((err) => {
                alert("Error al enviar: " + JSON.stringify(err));
                if (btnText) btnText.innerText = "Reintentar";
            });
    }, 400);
}

// Objeto para guardar el estado actual de la moto
let currentConfig = {
    tanque: '#494444', tanqueRough: 0.5,
    guardabarros: '#494444', guardabarrosRough: 0.5,
    asiento: '#bdc3c7',
    ruedas: 'liso',
    llantas: 'radios'
    // Añade aquí todas las variables que quieras guardar
};

// 1. Definimos los diccionarios (deben coincidir con los colores de tu HTML)
const mapaColores = {
    // Colores
    '#494444': 'A', '#111': 'B', '#bdc3c7': 'C', '#01073a': 'D', '#013a14': 'E',
    '#713610': 'F', '#000': 'G', '#e5e9ec': 'H', '#8d8d8d': 'I', '#383838': 'J',
    '#B1B52E': 'K', '#ff0000': 'L', '#f1c40f': 'M',
    // Acabados (Roughness)
    '0.5': '1',  // Normal
    '0.05': '2', // Cromo
    '0.9': '3',  // Mate
    // Extras
    'taco': 'T', 'liso': 'S', 'radios': 'R', 'mecanizada': 'Z'
};

const inversoMapa = Object.fromEntries(Object.entries(mapaColores).map(([k, v]) => [v, k]));

function generarCodigoConfiguracion() {
    // Definimos pares: Pieza (Color) seguida de su Acabado (Roughness)
    const estructura = [
        ['Tanque', 'Tanque_Rough'],
        ['Guardabarros', 'Guardabarros_Rough'],
        ['Colin', 'Colin_Rough'],
        ['Luz', 'Luz_Rough'],
        ['Asiento', 'Asiento_Rough'], // El asiento suele ser fijo 0.9 pero lo ponemos por si acaso
        ['Chasis', 'Chasis_Rough'],
        ['Motor', 'Motor_Rough'],
        ['Horquillas', 'Horquillas_Rough'],
        ['Tija', 'Tija_Rough'],
        ['Muelle', 'Muelle_Rough'],
        ['Suspension', 'Suspension_Rough'],
        ['Llantas', 'Llantas_Rough']
    ];
    
    let codigoResultado = "";

    estructura.forEach(par => {
        const color = elecciones[par[0]] || '#494444';
        const rough = elecciones[par[1]] || '0.5';
        codigoResultado += (mapaColores[color] || 'X') + (mapaColores[rough] || '1');
    });

    document.getElementById('display-code').innerText = "K100-" + codigoResultado;
}

function cargarCodigo() {
    let codigo = document.getElementById('input-code').value.trim().replace("K100-", "");
    
    const estructura = [
        ['Tanque', 'Tanque_Rough'],
        ['Guardabarros', 'Guardabarros_Rough'],
        ['Colin', 'Colin_Rough'],
        ['Luz', 'Luz_Rough'],
        ['Asiento', 'Asiento_Rough'],
        ['Chasis', 'Chasis_Rough'],
        ['Motor', 'Motor_Rough'],
        ['Horquillas', 'Horquillas_Rough'],
        ['Tija', 'Tija_Rough'],
        ['Muelle', 'Muelle_Rough'],
        ['Suspension', 'Suspension_Rough'],
        ['Llantas', 'Llantas_Rough']
    ];

    if (codigo.length !== estructura.length * 2) {
        alert("Código incompleto o erróneo");
        return;
    }

    let pointer = 0;
    estructura.forEach(par => {
        const letraColor = codigo[pointer];
        const letraRough = codigo[pointer + 1];

        const valorColor = inversoMapa[letraColor];
        const valorRough = inversoMapa[letraRough];

        if (valorColor) changeColor(par[0], valorColor);
        if (valorRough) setRoughness(par[0], parseFloat(valorRough));
        
        pointer += 2;
    });
    
    alert("¡Moto y acabados configurados!");
}
function copiarCodigo() {
    const codigo = document.getElementById('display-code').innerText;
    if (codigo === "SELECCIONA UNA OPCIÓN") return;
    
    navigator.clipboard.writeText(codigo).then(() => {
        const btn = document.querySelector('.btn-copy-icon');
        const originalColor = btn.style.color;
        btn.style.color = "#00ff00"; // Feedback visual verde
        setTimeout(() => btn.style.color = originalColor, 1000);
    });
}
// Script para la barra de carga
const modelViewer = document.querySelector('model-viewer');
if (modelViewer) {
    const progress = modelViewer.querySelector('.update-bar');
    const progressBar = modelViewer.querySelector('.progress-bar');
    if (progress && progressBar) {
        modelViewer.addEventListener('progress', (event) => {
            progress.style.width = event.detail.totalProgress * 100 + '%';
            if (event.detail.totalProgress === 1) {
                progressBar.classList.add('hide');
                if (event.detail.totalProgress === 1) {
                    setTimeout(() => {
                        progressBar.classList.add('hide');
                    }, 500);
                }
            } else {
                progressBar.classList.remove('hide');
                if (event.detail.totalProgress === 0) {
                    progress.style.width = '0%';
                }
            }
        });
    }
}

