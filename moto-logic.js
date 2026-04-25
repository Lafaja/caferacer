// 1. REFERENCIAS GLOBALES
const modelViewer = document.querySelector('#moto-3d');
let elecciones = {}; // Objeto dinámico: solo guardará lo que el usuario toque

// Identificador global para códigos de configuración (se puede sobrescribir en el HTML)
window.MODEL_ID = window.MODEL_ID || "K100";


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

                // 🎥 CAMERA HOTSPOT: volar automáticamente a la zona de esta sección
                // DESACTIVADO PARA SR400 por petición del usuario
                if (window.MODEL_ID !== "SR400") {
                    const orbit = this.dataset.cameraOrbit;
                    const target = this.dataset.cameraTarget;
                    if (orbit) modelViewer.cameraOrbit = orbit;
                    modelViewer.cameraTarget = target || 'auto';
                }
            } else {
                // 🔄 Al cerrar el acordeón: volver a vista general (solo si no es SR400)
                if (window.MODEL_ID !== "SR400") {
                    modelViewer.cameraOrbit = "90deg 86deg 80%";
                    modelViewer.cameraTarget = "auto";
                }
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

    // Convertir a array si es un string (para reusar lógica)
    const piezas = Array.isArray(pieza) ? pieza : [pieza];

    piezas.forEach(nombrePieza => {
        // Buscamos el material por nombre
        const material = modelViewer.model.materials.find(m => m.name === nombrePieza);
        
        if (material) {
            // 1. Aplicamos el acabado en el modelo 3D
            material.pbrMetallicRoughness.setRoughnessFactor(valor);
            
            // 2. GUARDADO PARA EL CÓDIGO: 
            // Guardamos el valor numérico como string (ej: "0.5") para que el diccionario lo reconozca
            elecciones[nombrePieza + "_ROUGH"] = valor.toString();
        } else {
            console.warn(`No se encontró el material: ${nombrePieza}`);
        }
    });

    // 3. Feedback visual: Resaltar el icono seleccionado (solo 1 vez por clic)
    if (event && event.target) {
        const container = event.target.parentElement;
        container.querySelectorAll('.btn-finish, .finish-dot').forEach(btn => {
            btn.classList.remove('selected-option');
        });
        event.target.classList.add('selected-option');
    }

    // 4. Actualizamos el código de la Topbar automáticamente
    if (typeof generarCodigoConfiguracion === "function") {
        generarCodigoConfiguracion();
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
        if (mat.name === "TACOMETRO_ANALOGICO" || mat.name === "TACOMETRO_DIGITAL") {
            
            if (tipo === 'analogico') {
                if (mat.name === "TACOMETRO_ANALOGICO") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "TACOMETRO_DIGITAL") {
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
        if (mat.name === "NEUMATICO_TACO" || mat.name === "NEUMATICO_LISO") {
            
            if (tipo === 'taco') {
                if (mat.name === "NEUMATICO_TACO") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "NEUMATICO_LISO") {
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
        if (mat.name === "LLANTA_RADIOS" || mat.name === "LLANTA_MECANIZADA") {
            
            if (tipo === 'radios') {
                if (mat.name === "LLANTA_RADIOS") {
                    mat.setAlphaMode("OPAQUE");
                    mat.pbrMetallicRoughness.setBaseColorFactor([0.05, 0.05, 0.05, 1]);
                } else {
                    // Ocultamos el digital
                    mat.setAlphaMode("BLEND");
                    mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
                }
            } else {
                if (mat.name === "LLANTA_MECANIZADA") {
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


// --- LÓGICA DE ASIENTO Y CURVA SR400 ---
let curvaActual = 1;
let conColinActual = false;
let colorAsientoActual = '#bdc3c7';

function toggleAsientoConfig(curva, conColin, event) {
    if (curva !== null) curvaActual = curva;
    if (conColin !== null) conColinActual = conColin;

    const materiales = modelViewer.model.materials;
    const curvas = ["CURVA_01", "CURVA_02", "CURVA_03", "CURVA_04"];
    const asientos = ["ASIENTO_01", "ASIENTO_02", "ASIENTO_03", "ASIENTO_04"];
    const asientosColin = ["ASIENTO_C_01", "ASIENTO_C_02", "ASIENTO_C_03", "ASIENTO_C_04"];

    materiales.forEach(mat => {
        // 1. Manejar Curvas
        if (curvas.includes(mat.name)) {
            if (mat.name === `CURVA_0${curvaActual}`) {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]); // Color base del chasis (blanco/gris por defecto)
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }

        // 2. Manejar Asientos
        const esAsientoSin = asientos.includes(mat.name);
        const esAsientoCon = asientosColin.includes(mat.name);

        if (esAsientoSin || esAsientoCon) {
            const numAsiento = mat.name.slice(-1);
            const coincideNum = parseInt(numAsiento) === curvaActual;
            
            if (coincideNum && ((!conColinActual && esAsientoSin) || (conColinActual && esAsientoCon))) {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor(colorAsientoActual);
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }
    });

    // Feedback Visual
    if (curva !== null) {
        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById(`btn-curva-${i}`);
            if (btn) btn.style.borderColor = (i === curvaActual) ? 'var(--accent)' : '#333';
        }
    }
    if (conColin !== null) {
        const btnSin = document.getElementById('btn-asiento-sin');
        const btnCon = document.getElementById('btn-asiento-con');
        if (btnSin) btnSin.style.borderColor = !conColinActual ? 'var(--accent)' : '#333';
        if (btnCon) btnCon.style.borderColor = conColinActual ? 'var(--accent)' : '#333';
    }

    // Guardar en elecciones
    elecciones['curva_chasis'] = `CURVA_0${curvaActual}`;
    elecciones['tipo_asiento'] = conColinActual ? "Con Colín" : "Sin Colín";
    generarCodigoConfiguracion();
}

function changeColorAsiento(color, event) {
    colorAsientoActual = color;
    toggleAsientoConfig(null, null); // Refrescar color en el asiento activo

    // Feedback resaltado
    if (event && event.target) {
        const container = event.target.parentElement;
        container.querySelectorAll('.color-dot').forEach(btn => btn.classList.remove('selected-option'));
        event.target.classList.add('selected-option');
    }
}

function toggleRetrovisores(tipo, event) {
    const materiales = modelViewer.model.materials;
    
    materiales.forEach(mat => {
        // Ocultar todos por defecto
        if (mat.name === "RETOVISORES_01_OR" || mat.name === "RETOVISORES_01" || mat.name === "RETOVISORES_01_P_D" || mat.name === "RETOVISORES_01_P_U") {
            mat.setAlphaMode("BLEND");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
        }

        // Mostrar seleccionado
        if (tipo === 'original' && mat.name === "RETOVISORES_01_OR") {
            mat.setAlphaMode("OPAQUE");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        } else if (tipo === 'circular' && mat.name === "RETOVISORES_01") {
            mat.setAlphaMode("OPAQUE");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        } else if (tipo === 'punos_up' && mat.name === "RETOVISORES_01_P_U") {
            mat.setAlphaMode("OPAQUE");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        } else if (tipo === 'punos_down' && mat.name === "RETOVISORES_01_P_D") {
            mat.setAlphaMode("OPAQUE");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
        }
    });

    // Feedback visual
    ['original', 'circular', 'punos_up', 'punos_down', 'none'].forEach(t => {
        const btn = document.getElementById(`btn-mir-${t}`);
        if (btn) btn.style.borderColor = (t === tipo) ? 'var(--accent)' : '#333';
    });

    elecciones['retrovisores'] = tipo;
    generarCodigoConfiguracion();
}

let frontFenderActual = 1;
let backFenderActual = 1;

function toggleGuardabarros(tipo, lado, event) {
    const materiales = modelViewer.model.materials;
    
    if (lado === 'front') frontFenderActual = tipo;
    if (lado === 'back') backFenderActual = tipo;

    materiales.forEach(mat => {
        // Delanteros
        if (mat.name.startsWith("GUARDABARROS_F_")) {
            if (mat.name === `GUARDABARROS_F_0${frontFenderActual}`) {
                mat.setAlphaMode("OPAQUE");
                // Mantenemos el color si existe en elecciones
                const color = elecciones['GUARDABARROS_F_01'] || '#494444';
                mat.pbrMetallicRoughness.setBaseColorFactor(color);
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }
        // Traseros
        if (mat.name.startsWith("GUARDABARROS_B_")) {
            if (mat.name === `GUARDABARROS_B_0${backFenderActual}`) {
                mat.setAlphaMode("OPAQUE");
                const color = elecciones['GUARDABARROS_F_01'] || '#494444';
                mat.pbrMetallicRoughness.setBaseColorFactor(color);
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }
    });

    // Feedback visual
    if (lado === 'front') {
        for (let i = 1; i <= 3; i++) {
            const btn = document.getElementById(`btn-f-fender-${i}`);
            if (btn) btn.style.borderColor = (i === frontFenderActual) ? 'var(--accent)' : '#333';
        }
    } else {
        for (let i = 1; i <= 2; i++) {
            const btn = document.getElementById(`btn-b-fender-${i}`);
            if (btn) btn.style.borderColor = (i === backFenderActual) ? 'var(--accent)' : '#333';
        }
    }

    elecciones['front_fender'] = frontFenderActual;
    elecciones['back_fender'] = backFenderActual;
    generarCodigoConfiguracion();
}

function toggleFaro(tipo, event) {
    const materiales = modelViewer.model.materials;

    materiales.forEach(mat => {
        // Ocultar todos los relacionados con el faro
        if (mat.name === "FARO_OR" || mat.name === "SOPORTE_FARO_OR" || mat.name === "FARO_01" || mat.name === "SOPORTE_FARO_01") {
            mat.setAlphaMode("BLEND");
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
        }

        // Mostrar seleccionados
        if (tipo === 'original') {
            if (mat.name === "FARO_OR" || mat.name === "SOPORTE_FARO_OR") {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
            }
        } else if (tipo === 'custom') {
            if (mat.name === "FARO_01" || mat.name === "SOPORTE_FARO_01") {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
            }
        }
    });

    // Feedback visual
    const btnOr = document.getElementById('btn-faro-or');
    const btn01 = document.getElementById('btn-faro-01');
    if (btnOr) btnOr.style.borderColor = (tipo === 'original') ? 'var(--accent)' : '#333';
    if (btn01) btn01.style.borderColor = (tipo === 'custom') ? 'var(--accent)' : '#333';

    elecciones['tipo_faro'] = tipo;
    generarCodigoConfiguracion();
}

let intFrontActual = 'OR';
let intBackActual = 'OR';

function toggleIntermitentes(tipo, lado, event) {
    const materiales = modelViewer.model.materials;

    if (lado === 'front') intFrontActual = tipo;
    if (lado === 'back') intBackActual = tipo;

    materiales.forEach(mat => {
        // Delanteros
        if (mat.name.startsWith("INTERMITENTES_F_")) {
            if (mat.name === `INTERMITENTES_F_${intFrontActual}`) {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }
        // Traseros
        if (mat.name.startsWith("INTERMITENTES_B_")) {
            if (mat.name === `INTERMITENTES_B_${intBackActual}`) {
                mat.setAlphaMode("OPAQUE");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
            } else {
                mat.setAlphaMode("BLEND");
                mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
            }
        }
    });

    // Feedback visual
    if (lado === 'front') {
        ['OR', '01', '02'].forEach(t => {
            const btn = document.getElementById(`btn-f-int-${t.toLowerCase()}`);
            if (btn) btn.style.borderColor = (t === intFrontActual) ? 'var(--accent)' : '#333';
        });
    } else {
        ['OR', '01', '02'].forEach(t => {
            const btn = document.getElementById(`btn-b-int-${t.toLowerCase()}`);
            if (btn) btn.style.borderColor = (t === intBackActual) ? 'var(--accent)' : '#333';
        });
    }

    elecciones['int_front'] = intFrontActual;
    elecciones['int_back'] = intBackActual;
    generarCodigoConfiguracion();
}

// Inicializar estado del asiento
modelViewer.addEventListener('load', () => {
    if (MODEL_ID === "SR400") {
        console.log("Configurando asiento, retrovisores, guardabarros, faro e intermitentes SR400...");
        toggleAsientoConfig(1, false);
        toggleRetrovisores('original');
        toggleGuardabarros(1, 'front');
        toggleGuardabarros(1, 'back');
        toggleFaro('original');
        toggleIntermitentes('OR', 'front');
        toggleIntermitentes('OR', 'back');
    }
});



// 5. NAVEGACIÓN INTERNA (Pasos del formulario)
function irAFormulario() {
    const modal = document.getElementById('modal-formulario');
    if(modal) {
        modal.style.display = 'flex';
    }
}

function irAConfigurador() {
    const modal = document.getElementById('modal-formulario');
    if(modal) {
        modal.style.display = 'none';
    }
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
    TANQUE: '#494444', TANQUE_ROUGH: 0.5,
    GUARDABARROS: '#494444', GUARDABARROS_ROUGH: 0.5,
    ASIENTO: '#bdc3c7',
    RUEDAS: 'liso',
    LLANTAS: 'radios'
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

function getEstructura() {
    // Si es SR400, usamos su mapeo específico (SolidWorks técnico)
    if (MODEL_ID === "SR400") {
        return [
            ['DEPOSITO_01_SR400', 'DEPOSITO_01_SR400_ROUGH'],
            ['GUARDABARROS_F_01', 'GUARDABARROS_F_01_ROUGH'], // Usamos F_01 como representante para color/rough
            ['front_fender', 'back_fender'],
            ['int_front', 'int_back'],
            ['COLIN', 'COLIN_ROUGH'],
            ['tipo_faro', 'tipo_faro'],
            ['FARO_OR', 'FARO_OR_ROUGH'], // Representante para el color/rough del faro
            ['curva_chasis', 'curva_chasis'],
            ['tipo_asiento', 'tipo_asiento'],
            ['retrovisores', 'retrovisores'],
            ['CHASIS', 'CHASIS_ROUGH'],
            ['MOTOR', 'MOTOR_ROUGH'],
            ['HORQUILLAS', 'HORQUILLAS_ROUGH'],
            ['TIJA', 'TIJA_ROUGH'],
            ['PINZA_FRENO', 'PINZA_FRENO_ROUGH'],
            ['PUÑOS_01', 'PUÑOS_01'],
            ['SUSPENSION_01_B_SR400', 'SUSPENSION_01_B_SR400_ROUGH'],
            ['LLANTA_F_R', 'LLANTA_F_R_ROUGH']
        ];
    }
    
    // Para K100 y todos los nuevos modelos DUCATI (996R, 900SS, etc.) 
    // usamos el ESTÁNDAR definido en ESTANDAR_MATERIALES.md
    return [
        ['TANQUE', 'TANQUE_ROUGH'],
        ['GUARDABARROS', 'GUARDABARROS_ROUGH'],
        ['COLIN', 'COLIN_ROUGH'],
        ['LUZ', 'LUZ_ROUGH'],
        ['ASIENTO', 'ASIENTO_ROUGH'],
        ['CHASIS', 'CHASIS_ROUGH'],
        ['MOTOR', 'MOTOR_ROUGH'],
        ['HORQUILLAS', 'HORQUILLAS_ROUGH'],
        ['TIJA', 'TIJA_ROUGH'],
        ['MUELLE', 'MUELLE_ROUGH'],
        ['SUSPENSION', 'SUSPENSION_ROUGH'],
        ['LLANTAS', 'LLANTAS_ROUGH']
    ];
}

function generarCodigoConfiguracion() {
    const estructura = getEstructura();
    
    let codigoResultado = "";

    estructura.forEach(par => {
        const color = elecciones[par[0]] || '#494444';
        const rough = elecciones[par[1]] || '0.5';
        codigoResultado += (mapaColores[color] || 'X') + (mapaColores[rough] || '1');
    });

    document.getElementById('display-code').innerText = MODEL_ID + "-" + codigoResultado;
}

function cargarCodigo() {
    let codigo = document.getElementById('input-code').value.trim().replace(MODEL_ID + "-", "");
    const estructura = getEstructura();

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




// Timeout de seguridad de 5 segundos máximo para evitar que se quede bloqueado por error
setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader && !loader.classList.contains('loading-hidden')) {
        console.warn('Quitando pantalla de carga por tiempo maximo');
        loader.classList.add('loading-hidden');
    }
}, 5000);

// Detectar cambios en visibilidad
modelViewer.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('loading-hidden');

    // MODO DEPURAICON: Imprimir todos los materiales en consola al cargar
    // console.group("DEBUG: Materiales del modelo (" + MODEL_ID + ")");
    // const materiales = modelViewer.model.materials;
    // materiales.forEach((m, index) => {
    //     console.log(`${index}: %c${m.name}`, "color: #00ff00; font-weight: bold;");
    // });
    // console.groupEnd();
});

// AYUDA: Clic en la moto para saber qué material es
modelViewer.addEventListener('click', (event) => {
    const material = modelViewer.materialFromPoint(event.clientX, event.clientY);
    if (material) {
        console.log(`%cHas clicado en el material: %c${material.name}`, "color: #bbb", "color: orange; font-weight: bold; font-size: 1.2rem;");
        
        // Eliminar toast anterior si existe
        const oldToast = document.querySelector('.debug-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.innerText = "MATERIAL: " + (material.name || "[Sin nombre]");
        toast.className = "debug-toast";
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
});

