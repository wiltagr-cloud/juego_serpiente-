
"use strict";

const TAMANIO_CELDA = 25;
const VELOCIDAD = 120;

const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

const elementoPuntaje = document.getElementById("puntaje");
const elementoEstado = document.getElementById("estado");
const botonReiniciar = document.getElementById("botonReiniciar");

const COLUMNAS = canvas.width / TAMANIO_CELDA;
const FILAS = canvas.height / TAMANIO_CELDA;

let serpiente = [];
let direccion = { x: 1, y: 0 };
let proximaDireccion = { x: 1, y: 0 };
let comida = { x: 0, y: 0 };
let puntaje = 0;
let temporizador = null;
let juegoTerminado = false;

// Iniciar el juego
function iniciarJuego() {
  clearInterval(temporizador);

  serpiente = [
    { x: 6, y: 12 },
    { x: 5, y: 12 },
    { x: 4, y: 12 }
  ];

  direccion = { x: 1, y: 0 };
  proximaDireccion = { x: 1, y: 0 };

  puntaje = 0;
  juegoTerminado = false;

  elementoPuntaje.textContent = puntaje;
  elementoEstado.textContent = "¡En movimiento!";
  elementoEstado.style.color = "#75e6a7";

  colocarComida();
  dibujarTodo();

  // La serpiente empieza a moverse automáticamente
  temporizador = setInterval(actualizarJuego, VELOCIDAD);
}

// Dibujar el fondo
function dibujarTablero() {
  ctx.fillStyle = "#f4f1de";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#dedbc9";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += TAMANIO_CELDA) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += TAMANIO_CELDA) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Dibujar la comida
function dibujarComida() {
  const x = comida.x * TAMANIO_CELDA;
  const y = comida.y * TAMANIO_CELDA;

  ctx.fillStyle = "#e76f51";
  ctx.beginPath();
  ctx.arc(
    x + TAMANIO_CELDA / 2,
    y + TAMANIO_CELDA / 2,
    TAMANIO_CELDA / 2 - 3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Brillo de la comida
  ctx.fillStyle = "#ffd6a5";
  ctx.beginPath();
  ctx.arc(x + 8, y + 7, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Dibujar la serpiente
function dibujarSerpiente() {
  serpiente.forEach((segmento, indice) => {
    const x = segmento.x * TAMANIO_CELDA;
    const y = segmento.y * TAMANIO_CELDA;

    ctx.fillStyle = indice === 0 ? "#176b5b" : "#2a9d8f";

    ctx.beginPath();
    ctx.roundRect(
      x + 2,
      y + 2,
      TAMANIO_CELDA - 4,
      TAMANIO_CELDA - 4,
      6
    );
    ctx.fill();

    // Ojos de la cabeza
    if (indice === 0) {
      ctx.fillStyle = "#ffffff";

      let ojo1;
      let ojo2;

      if (direccion.x === 1) {
        ojo1 = { x: x + 17, y: y + 7 };
        ojo2 = { x: x + 17, y: y + 16 };
      } else if (direccion.x === -1) {
        ojo1 = { x: x + 7, y: y + 7 };
        ojo2 = { x: x + 7, y: y + 16 };
      } else if (direccion.y === -1) {
        ojo1 = { x: x + 7, y: y + 7 };
        ojo2 = { x: x + 16, y: y + 7 };
      } else {
        ojo1 = { x: x + 7, y: y + 17 };
        ojo2 = { x: x + 16, y: y + 17 };
      }

      [ojo1, ojo2].forEach(ojo => {
        ctx.beginPath();
        ctx.arc(ojo.x, ojo.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#101820";
        ctx.beginPath();
        ctx.arc(ojo.x, ojo.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
      });
    }
  });
}

// Dibujar todo el juego
function dibujarTodo() {
  dibujarTablero();
  dibujarComida();
  dibujarSerpiente();
}

// Colocar comida sin que aparezca sobre la serpiente
function colocarComida() {
  do {
    comida = {
      x: Math.floor(Math.random() * COLUMNAS),
      y: Math.floor(Math.random() * FILAS)
    };
  } while (
    serpiente.some(segmento =>
      segmento.x === comida.x && segmento.y === comida.y
    )
  );
}

// Actualizar el movimiento
function actualizarJuego() {
  if (juegoTerminado) return;

  direccion = proximaDireccion;

  const cabezaActual = serpiente[0];

  const nuevaCabeza = {
    x: cabezaActual.x + direccion.x,
    y: cabezaActual.y + direccion.y
  };

  // Detectar choque con las paredes
  const chocaConPared =
    nuevaCabeza.x < 0 ||
    nuevaCabeza.x >= COLUMNAS ||
    nuevaCabeza.y < 0 ||
    nuevaCabeza.y >= FILAS;

  const comeComida =
    nuevaCabeza.x === comida.x &&
    nuevaCabeza.y === comida.y;

  // Si no come, la última celda se libera en este movimiento
  const cuerpoParaRevisar = comeComida
    ? serpiente
    : serpiente.slice(0, -1);

  const chocaConSiMisma = cuerpoParaRevisar.some(segmento =>
    segmento.x === nuevaCabeza.x &&
    segmento.y === nuevaCabeza.y
  );

  if (chocaConPared || chocaConSiMisma) {
    terminarJuego();
    return;
  }

  // Añadir nueva cabeza
  serpiente.unshift(nuevaCabeza);

  if (comeComida) {
    puntaje += 10;
    elementoPuntaje.textContent = puntaje;

    colocarComida();
  } else {
    // Quitar la cola para mantener el tamaño
    serpiente.pop();
  }

  dibujarTodo();
}

// Finalizar partida
function terminarJuego() {
  juegoTerminado = true;
  clearInterval(temporizador);

  elementoEstado.textContent = "¡Fin del juego!";
  elementoEstado.style.color = "#ff8277";

  // Mensaje encima del tablero
  ctx.fillStyle = "rgba(16, 24, 32, 0.78)";
  ctx.fillRect(50, 240, 500, 120);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial";
  ctx.fillText("¡Juego terminado!", canvas.width / 2, 290);

  ctx.font = "18px Arial";
  ctx.fillText(
    "Puntaje: " + puntaje + " | Pulsa Reiniciar",
    canvas.width / 2,
    325
  );

  ctx.textAlign = "start";
}

// Controlar la dirección
function cambiarDireccion(evento) {
  const tecla = evento.key.toLowerCase();

  const direcciones = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },

    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },

    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },

    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const nuevaDireccion = direcciones[tecla];

  if (!nuevaDireccion || juegoTerminado) return;

  evento.preventDefault();

  // Evitar que la serpiente retroceda directamente
  const giroContrario =
    nuevaDireccion.x === -direccion.x &&
    nuevaDireccion.y === -direccion.y;

  if (!giroContrario) {
    proximaDireccion = nuevaDireccion;
  }
}

// Eventos
document.addEventListener("keydown", cambiarDireccion);
botonReiniciar.addEventListener("click", iniciarJuego);

// Arrancar automáticamente cuando se carga el archivo
iniciarJuego();
