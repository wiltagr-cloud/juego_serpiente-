
"use strict";

// Configuración
const TAMANIO_CELDA = 25;
const VELOCIDAD = 120;

const canvas = document.getElementById("canvasJuego");
const ctx = canvas.getContext("2d");

const elementoPuntaje = document.getElementById("puntaje");
const elementoEstado = document.getElementById("estado");
const botonReiniciar = document.getElementById("botonReiniciar");

const botonesMovimiento = document.querySelectorAll(".btn-mover");

const COLUMNAS = canvas.width / TAMANIO_CELDA;
const FILAS = canvas.height / TAMANIO_CELDA;

// Variables del juego
let serpiente = [];
let direccion = { x: 1, y: 0 };
let proximaDireccion = { x: 1, y: 0 };
let comida = { x: 0, y: 0 };
let puntaje = 0;
let temporizador = null;
let juegoTerminado = false;

// Direcciones para los botones y el teclado
const mapaDirecciones = {
  arriba: { x: 0, y: -1 },
  abajo: { x: 0, y: 1 },
  izquierda: { x: -1, y: 0 },
  derecha: { x: 1, y: 0 }
};

// Iniciar o reiniciar el juego
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

  // Movimiento automático de la serpiente
  temporizador = setInterval(actualizarJuego, VELOCIDAD);
}

// Dibujar el tablero
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

  // Fruta
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

  // Brillo de la fruta
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
      dibujarOjos(x, y);
    }
  });
}

// Dibujar los ojos según la dirección de la cabeza
function dibujarOjos(x, y) {
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
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ojo.x, ojo.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#101820";
    ctx.beginPath();
    ctx.arc(ojo.x, ojo.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Dibujar todos los elementos
function dibujarTodo() {
  dibujarTablero();
  dibujarComida();
  dibujarSerpiente();
}

// Colocar comida sin que aparezca sobre la serpiente
function colocarComida() {
  const casillasLibres = [];

  for (let y = 0; y < FILAS; y++) {
    for (let x = 0; x < COLUMNAS; x++) {
      const ocupada = serpiente.some(segmento =>
        segmento.x === x && segmento.y === y
      );

      if (!ocupada) {
        casillasLibres.push({ x, y });
      }
    }
  }

  // Si no quedan casillas libres, el jugador gana
  if (casillasLibres.length === 0) {
    ganarJuego();
    return;
  }

  comida = casillasLibres[
    Math.floor(Math.random() * casillasLibres.length)
  ];
}

// Actualizar movimiento y comprobar colisiones
function actualizarJuego() {
  if (juegoTerminado) return;

  direccion = { ...proximaDireccion };

  const cabezaActual = serpiente[0];

  const nuevaCabeza = {
    x: cabezaActual.x + direccion.x,
    y: cabezaActual.y + direccion.y
  };

  // Comprobar choque con las paredes
  const chocaConPared =
    nuevaCabeza.x < 0 ||
    nuevaCabeza.x >= COLUMNAS ||
    nuevaCabeza.y < 0 ||
    nuevaCabeza.y >= FILAS;

  const comeComida =
    nuevaCabeza.x === comida.x &&
    nuevaCabeza.y === comida.y;

  // Si no come, la cola se mueve y libera su casilla
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

  // Añadir la nueva cabeza
  serpiente.unshift(nuevaCabeza);

  if (comeComida) {
    puntaje += 10;
    elementoPuntaje.textContent = puntaje;

    colocarComida();

    if (juegoTerminado) return;
  } else {
    // Quitar el último segmento
    serpiente.pop();
  }

  dibujarTodo();
}

// Finalizar la partida
function terminarJuego() {
  juegoTerminado = true;
  clearInterval(temporizador);

  elementoEstado.textContent = "¡Fin del juego!";
  elementoEstado.style.color = "#ff8277";

  dibujarTodo();

  // Fondo del mensaje
  ctx.fillStyle = "rgba(16, 24, 32, 0.88)";
  ctx.fillRect(50, 240, 500, 120);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Arial";
  ctx.fillText(
    "¡Juego terminado!",
    canvas.width / 2,
    290
  );

  ctx.font = "18px Arial";
  ctx.fillText(
    "Puntaje: " + puntaje + " | Pulsa Reiniciar",
    canvas.width / 2,
    325
  );

  ctx.textAlign = "start";
}

// Ganar cuando se ocupa todo el tablero
function ganarJuego() {
  juegoTerminado = true;
  clearInterval(temporizador);

  elementoEstado.textContent = "¡Ganaste!";
  elementoEstado.style.color = "#f4d35e";

  dibujarTablero();
  dibujarSerpiente();

  ctx.fillStyle = "rgba(16, 24, 32, 0.88)";
  ctx.fillRect(50, 240, 500, 120);

  ctx.fillStyle = "#f4d35e";
  ctx.textAlign = "center";
  ctx.font = "bold 32px Arial";
  ctx.fillText("¡Felicidades, ganaste!", 300, 290);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText("Puntaje: " + puntaje, 300, 325);

  ctx.textAlign = "start";
}

// Cambiar dirección sin permitir giros de 180 grados
function cambiarDireccion(nombreDireccion) {
  if (juegoTerminado) return;

  const nuevaDireccion = mapaDirecciones[nombreDireccion];

  if (!nuevaDireccion) return;

  const giroContrario =
    nuevaDireccion.x === -direccion.x &&
    nuevaDireccion.y === -direccion.y;

  if (!giroContrario) {
    proximaDireccion = { ...nuevaDireccion };
  }
}

// Control con el teclado
function controlarTeclado(evento) {
  const tecla = evento.key.toLowerCase();

  const teclasDirecciones = {
    arrowup: "arriba",
    w: "arriba",

    arrowdown: "abajo",
    s: "abajo",

    arrowleft: "izquierda",
    a: "izquierda",

    arrowright: "derecha",
    d: "derecha"
  };

  const nombreDireccion = teclasDirecciones[tecla];

  if (!nombreDireccion) return;

  evento.preventDefault();
  cambiarDireccion(nombreDireccion);
}

// Control con los botones en pantalla
botonesMovimiento.forEach(boton => {
  boton.addEventListener("click", () => {
    cambiarDireccion(boton.dataset.direccion);
  });
});

// Eventos del juego
document.addEventListener("keydown", controlarTeclado);
botonReiniciar.addEventListener("click", iniciarJuego);

// Iniciar automáticamente
iniciarJuego();
