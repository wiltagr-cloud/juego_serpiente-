
"use strict";

// ==========================================
// VARIABLES GLOBALES
// ==========================================

const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

const anchoCanvas = canvas.width;
const altoCanvas = canvas.height;
const tamanioCelda = 25;

const COLUMNAS = anchoCanvas / tamanioCelda;
const FILAS = altoCanvas / tamanioCelda;

const elementoPuntaje = document.getElementById("puntaje");
const elementoEstado = document.getElementById("estado");

let serpiente = [];
let comida = { x: 0, y: 0 };
let puntaje = 0;

let direccionActual = "derecha";
let intervaloSerpiente = null;

let juegoTerminado = false;
let juegoIniciado = false;

// ==========================================
// INICIALIZAR EL TABLERO
// ==========================================

function inicializarSerpiente() {
    serpiente = [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 }
    ];

    direccionActual = "derecha";
    puntaje = 0;
    juegoTerminado = false;

    elementoPuntaje.textContent = puntaje;
    elementoEstado.textContent = "Listo para jugar";

    pintarComida();
    pintarSerpiente();
}

// ==========================================
// PARTE 1: MOVIMIENTO HACIA LA DERECHA
// ==========================================

function moverDerecha() {
    const cabeza = serpiente[0];

    const nuevaCabeza = {
        x: cabeza.x + 1,
        y: cabeza.y
    };

    serpiente.unshift(nuevaCabeza);
    serpiente.pop();
}

// ==========================================
// PARTE 3: MOVIMIENTO HACIA LA IZQUIERDA
// ==========================================

function moverIzquierda() {
    const cabeza = serpiente[0];

    const nuevaCabeza = {
        x: cabeza.x - 1,
        y: cabeza.y
    };

    serpiente.unshift(nuevaCabeza);
    serpiente.pop();
}

// ==========================================
// PARTE 3: MOVIMIENTO HACIA ARRIBA
// ==========================================

function moverArriba() {
    const cabeza = serpiente[0];

    const nuevaCabeza = {
        x: cabeza.x,
        y: cabeza.y - 1
    };

    serpiente.unshift(nuevaCabeza);
    serpiente.pop();
}

// ==========================================
// PARTE 3: MOVIMIENTO HACIA ABAJO
// ==========================================

function moverAbajo() {
    const cabeza = serpiente[0];

    const nuevaCabeza = {
        x: cabeza.x,
        y: cabeza.y + 1
    };

    serpiente.unshift(nuevaCabeza);
    serpiente.pop();
}

// ==========================================
// PARTE 2 Y 7: CAMBIAR DIRECCIÓN
// ==========================================

function cambiarDireccion(direccion) {
    if (juegoTerminado) return;

    const opuestas = {
        derecha: "izquierda",
        izquierda: "derecha",
        arriba: "abajo",
        abajo: "arriba"
    };

    // Evitar un giro de 180 grados
    if (opuestas[direccionActual] === direccion) {
        return;
    }

    // Solo cambia la dirección; no mueve la serpiente
    direccionActual = direccion;
}

// ==========================================
// DIBUJAR UNA PARTE DEL JUEGO
// ==========================================

function pintarParte(x, y, color) {
    ctx.fillStyle = color;

    ctx.fillRect(
        x * tamanioCelda + 2,
        y * tamanioCelda + 2,
        tamanioCelda - 4,
        tamanioCelda - 4
    );
}

// ==========================================
// DIBUJAR LA SERPIENTE Y EL TABLERO
// ==========================================

function pintarSerpiente() {
    // Fondo
    ctx.fillStyle = "#f4f1de";
    ctx.fillRect(0, 0, anchoCanvas, altoCanvas);

    // Cuadrícula
    ctx.strokeStyle = "#dedbc9";
    ctx.lineWidth = 1;

    for (let x = 0; x <= anchoCanvas; x += tamanioCelda) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, altoCanvas);
        ctx.stroke();
    }

    for (let y = 0; y <= altoCanvas; y += tamanioCelda) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(anchoCanvas, y);
        ctx.stroke();
    }

    // Cuerpo y cabeza
    serpiente.forEach((parte, indice) => {
        const color = indice === 0 ? "#176b5b" : "#2a9d8f";
        pintarParte(parte.x, parte.y, color);
    });

    // Dibujar la comida
    pintarParte(comida.x, comida.y, "#e76f51");
}

// ==========================================
// PARTE 8: GENERAR Y PINTAR COMIDA
// ==========================================

function pintarComida() {
    let posicionValida = false;

    while (!posicionValida) {
        comida = {
            x: Math.floor(Math.random() * COLUMNAS),
            y: Math.floor(Math.random() * FILAS)
        };

        posicionValida = !serpiente.some(parte =>
            parte.x === comida.x && parte.y === comida.y
        );
    }
}

// ==========================================
// PARTE 9: DETECTAR SI ATRAPA LA COMIDA
// ==========================================

function atrapaComida() {
    const cabeza = serpiente[0];

    if (cabeza.x === comida.x && cabeza.y === comida.y) {
        return true;
    }

    return false;
}

// ==========================================
// DETECTAR COLISIONES
// ==========================================

function comprobarColision() {
    const cabeza = serpiente[0];

    // Choque con las paredes
    if (
        cabeza.x < 0 ||
        cabeza.x >= COLUMNAS ||
        cabeza.y < 0 ||
        cabeza.y >= FILAS
    ) {
        return true;
    }

    // Choque con el cuerpo
    for (let i = 1; i < serpiente.length; i++) {
        if (
            cabeza.x === serpiente[i].x &&
            cabeza.y === serpiente[i].y
        ) {
            return true;
        }
    }

    return false;
}

// ==========================================
// PARTE 7 Y 10: MOVIMIENTO AUTOMÁTICO
// ==========================================

function moverSerpiente() {
    if (juegoTerminado || !juegoIniciado) return;

    // Guardar la cola antes de mover
    const colaAnterior = {
        x: serpiente[serpiente.length - 1].x,
        y: serpiente[serpiente.length - 1].y
    };

    // Mover según la dirección actual
    switch (direccionActual) {
        case "derecha":
            moverDerecha();
            break;

        case "izquierda":
            moverIzquierda();
            break;

        case "arriba":
            moverArriba();
            break;

        case "abajo":
            moverAbajo();
            break;
    }

    // Comprobar si comió antes de quitar definitivamente la cola
    if (atrapaComida()) {
        // Restaurar el último segmento para hacer crecer la serpiente
        serpiente.push(colaAnterior);

        puntaje += 10;
        elementoPuntaje.textContent = puntaje;

        pintarComida();
    }

    // Comprobar choques
    if (comprobarColision()) {
        finalizarJuego();
        return;
    }

    pintarSerpiente();
}

// ==========================================
// PARTE 4, 5 Y 6: INICIAR JUEGO
// ==========================================

function iniciarJuego() {
    if (juegoTerminado) {
        inicializarSerpiente();
    }

    if (intervaloSerpiente !== null) {
        return;
    }

    juegoIniciado = true;
    elementoEstado.textContent = "Jugando";
    elementoEstado.style.color = "#75e6a7";

    intervaloSerpiente = setInterval(moverSerpiente, 150);
}

// ==========================================
// PARTE 4 Y 6: PAUSAR JUEGO
// ==========================================

function pausarJuego() {
    clearInterval(intervaloSerpiente);
    intervaloSerpiente = null;

    juegoIniciado = false;

    if (!juegoTerminado) {
        elementoEstado.textContent = "Juego pausado";
        elementoEstado.style.color = "#e9a23b";
    }
}

// ==========================================
// FINALIZAR PARTIDA
// ==========================================

function finalizarJuego() {
    juegoTerminado = true;
    juegoIniciado = false;

    clearInterval(intervaloSerpiente);
    intervaloSerpiente = null;

    elementoEstado.textContent = "¡Fin del juego!";
    elementoEstado.style.color = "#ff8277";

    pintarSerpiente();

    ctx.fillStyle = "rgba(16, 24, 32, 0.88)";
    ctx.fillRect(30, 190, anchoCanvas - 60, 110);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 25px Arial";
    ctx.fillText("¡Juego terminado!", anchoCanvas / 2, 235);

    ctx.font = "16px Arial";
    ctx.fillText(
        "Puntaje: " + puntaje + " - Pulsa Reiniciar",
        anchoCanvas / 2,
        270
    );

    ctx.textAlign = "start";
}

// ==========================================
// REINICIAR PARTIDA
// ==========================================

function reiniciarJuego() {
    pausarJuego();
    inicializarSerpiente();

    elementoEstado.textContent = "Listo para jugar";
    elementoEstado.style.color = "#75e6a7";
}

// ==========================================
// CONTROLES DE LOS BOTONES
// ==========================================

document.querySelectorAll(".direccion").forEach(boton => {
    boton.addEventListener("click", () => {
        cambiarDireccion(boton.dataset.direccion);
    });
});

document.getElementById("btnIniciar").addEventListener("click", iniciarJuego);

document.getElementById("btnPausar").addEventListener("click", pausarJuego);

document.getElementById("btnReiniciar").addEventListener("click", reiniciarJuego);

// ==========================================
// CONTROL CON EL TECLADO
// ==========================================

document.addEventListener("keydown", evento => {
    const teclas = {
        ArrowRight: "derecha",
        ArrowLeft: "izquierda",
        ArrowUp: "arriba",
        ArrowDown: "abajo",
        d: "derecha",
        a: "izquierda",
        w: "arriba",
        s: "abajo"
    };

    const direccion = teclas[evento.key];

    if (direccion) {
        evento.preventDefault();
        cambiarDireccion(direccion);
    }
});

// ==========================================
// INICIALIZACIÓN
// ==========================================

inicializarSerpiente();
