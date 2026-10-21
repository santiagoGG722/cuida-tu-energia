// =====================================================================
// calculadora_consumo.js: el JavaScript de calculadora_consumo.html
//
// Aqui se ven TRES paradigmas en el mismo archivo:
//   - ORIENTADO A OBJETOS: class Equipo (datos + metodos juntos)
//   - FUNCIONAL: map, filter y reduce (funciones que devuelven resultados nuevos)
//   - DIRIGIDO POR EVENTOS: addEventListener (el codigo reacciona a lo que hace el usuario)
// Ademas, los equipos se GUARDAN en el navegador (localStorage) y no se pierden al recargar.
// =====================================================================

// CLASE: el MOLDE de un equipo. Junta los DATOS (atributos) y el COMPORTAMIENTO (metodos).
// Por convencion, el nombre de una clase empieza con MAYUSCULA.
class Equipo {
    // constructor: se ejecuta con "new Equipo(...)" y guarda los datos en el objeto (this)
    constructor(nombre, potencia, horas, dias) {
        this.nombre = nombre;
        this.potencia = potencia;
        this.horas = horas;
        this.dias = dias;
    }

    // METODO: una funcion que PERTENECE al objeto. Cada equipo sabe calcular su propio consumo.
    // Se usa asi: nevera.kwh()  (con parentesis, porque es una funcion)
    kwh() {
        return this.potencia * this.horas * this.dias / 1000;
    }

    // Un metodo puede usar OTRO metodo del mismo objeto con this
    costo(tarifa) {
        return this.kwh() * tarifa;
    }
}

// new: crea un OBJETO (una instancia) a partir de la clase
const EJEMPLO = [
    new Equipo("Ducha eléctrica", 3500, 0.5, 30),
    new Equipo("Nevera", 150, 10, 30),
    new Equipo("Computador", 250, 6, 22),
    new Equipo("Televisor", 120, 4, 30),
    new Equipo("Plancha", 1200, 1, 8)
];

// localStorage: un espacio del navegador que guarda TEXTO con un nombre (clave).
// registro.html usa la MISMA clave: lo que se registra alla aparece aqui.
const CLAVE = "cuida-tu-energia";

// JSON.stringify: convierte el arreglo de objetos en texto para poder guardarlo
function guardar() {
    localStorage.setItem(CLAVE, JSON.stringify(equipos));
}

// JSON.parse: convierte el texto otra vez en datos.
// OJO: JSON guarda los DATOS pero NO los METODOS, por eso con map se vuelve a crear cada Equipo.
function cargar() {
    const texto = localStorage.getItem(CLAVE);
    if (texto === null) {
        return EJEMPLO;   // la primera vez no hay nada guardado: se usan los de ejemplo
    }
    return JSON.parse(texto).map((d) => new Equipo(d.nombre, d.potencia, d.horas, d.dias));
}

const equipos = cargar();

// Escribe un numero al estilo colombiano (49.875 y 52,5), con maximo 2 decimales
function formato(numero) {
    return numero.toLocaleString("es-CO", { maximumFractionDigits: 2 });
}

// --- Estilo FUNCIONAL: funciones que reciben datos y devuelven un resultado, sin cambiar variables ---
// (lista) => ... es una FUNCION FLECHA: una forma corta de escribir function (lista) { return ...; }

// reduce: recorre el arreglo y lo "reduce" a un solo valor (la suma).
//   suma   = lo acumulado hasta ahora (empieza en 0, el ultimo dato que recibe reduce)
//   equipo = el elemento que se esta mirando en esa vuelta
// Hace lo mismo que el for de equipos_electricos.js, pero sin "let total = 0" ni "total = total + ..."
const sumarKwh = (lista) => lista.reduce((suma, equipo) => suma + equipo.kwh(), 0);

// reduce para encontrar el MAYOR: compara de a dos y se queda con el que mas gasta.
//   condicion ? a : b  = OPERADOR TERNARIO: si la condicion es verdadera devuelve a; si no, b
const mayorConsumo = (lista) => lista.reduce((a, b) => (b.kwh() > a.kwh() ? b : a));

// filter: devuelve un arreglo NUEVO solo con los que cumplen la condicion
const altoConsumo = (lista) => lista.filter((equipo) => equipo.potencia >= 1000);

// Dibuja la tabla, los totales y el resumen. Se llama cada vez que cambian los datos.
function dibujarTabla() {
    // Se lee la tarifa del formulario: .value es TEXTO y Number lo convierte en numero
    const tarifa = Number(document.getElementById("tarifa").value);
    // Si la lista esta vacia no hay mayor (null = "nada"): reduce fallaria con una lista vacia
    const mayor = equipos.length > 0 ? mayorConsumo(equipos) : null;

    // map: convierte CADA equipo en el texto de una fila <tr>. Devuelve un arreglo NUEVO de textos.
    //   i = la posicion del equipo (0, 1, 2...); se guarda en data-indice para el boton Eliminar
    //   equipo === mayor ? "fila-mayor" : ""  = solo la fila del que mas gasta recibe la clase CSS
    const filas = equipos.map((equipo, i) => `
        <tr class="${equipo === mayor ? "fila-mayor" : ""}">
            <td>${equipo.nombre}</td>
            <td>${equipo.potencia}</td>
            <td>${formato(equipo.horas)}</td>
            <td>${equipo.dias}</td>
            <td>${formato(equipo.kwh())}</td>
            <td>${formato(equipo.costo(tarifa))}</td>
            <td><button class="btn btn-sm btn-outline-danger" data-indice="${i}">Eliminar</button></td>
        </tr>`);
    // join(""): une todas las filas en UN solo texto, que se pone dentro del tbody
    document.getElementById("cuerpo-tabla").innerHTML = filas.join("");

    // Los totales: se usa la funcion sumarKwh (reduce) en vez de un for
    const totalKwh = sumarKwh(equipos);
    document.getElementById("total-kwh").textContent = formato(totalKwh);
    document.getElementById("total-costo").textContent = formato(totalKwh * tarifa);

    dibujarResumen(totalKwh, tarifa, mayor);
    guardar();   // cada vez que se redibuja, se guarda el estado actual
}

// Arma 3 tarjetas con el resumen (las clases tarjeta-resumen y valor estan en estilos.css;
// col-md-4 es de Bootstrap: 3 tarjetas x 4 columnas = 12)
function dibujarResumen(totalKwh, tarifa, mayor) {
    const resumen = document.getElementById("resumen");
    // if: si no hay equipos, se borra el resumen y return TERMINA la funcion aqui
    if (mayor === null) {
        resumen.innerHTML = "";
        return;
    }
    // Que porcentaje del total consume el equipo que mas gasta
    const porcentaje = totalKwh > 0 ? (mayor.kwh() / totalKwh) * 100 : 0;
    resumen.innerHTML = `
        <div class="col-md-4"><div class="tarjeta-resumen">
            <div>Costo total del mes</div>
            <div class="valor">$ ${formato(totalKwh * tarifa)}</div>
        </div></div>
        <div class="col-md-4"><div class="tarjeta-resumen">
            <div>El que más gasta</div>
            <div class="valor">${mayor.nombre}</div>
            <div>${formato(porcentaje)} % del consumo</div>
        </div></div>
        <div class="col-md-4"><div class="tarjeta-resumen">
            <div>Equipos de 1000 W o más</div>
            <div class="valor">${altoConsumo(equipos).length} de ${equipos.length}</div>
        </div></div>`;
}

// EVENTO submit: "CUANDO se envie el formulario, ejecute esta funcion".
// La funcion que se pasa como dato se llama CALLBACK; evento trae la informacion de lo que paso.
document.getElementById("form-equipo").addEventListener("submit", function (evento) {
    evento.preventDefault();   // que NO se recargue la pagina (es lo que hace el navegador al enviar)
    // Se leen los campos con .value y se crea un OBJETO de la clase Equipo.
    // .value siempre es TEXTO: Number(...) lo convierte en numero (sin eso, "500" + "1" daria "5001")
    const nuevo = new Equipo(
        document.getElementById("nombre").value,
        Number(document.getElementById("potencia").value),
        Number(document.getElementById("horas").value),
        Number(document.getElementById("dias").value)
    );
    equipos.push(nuevo);   // se agrega al final del arreglo
    dibujarTabla();        // se vuelve a dibujar todo
    // Se limpian los campos y el cursor vuelve al campo Equipo
    document.getElementById("nombre").value = "";
    document.getElementById("potencia").value = "";
    document.getElementById("horas").value = "";
    document.getElementById("nombre").focus();
});

// Un solo evento para TODOS los botones Eliminar: se escucha el clic en el tbody (DELEGACION DE EVENTOS).
// Asi funciona tambien con los botones que se crean despues, al agregar equipos.
// evento.target = el elemento exacto donde se hizo clic
document.getElementById("cuerpo-tabla").addEventListener("click", function (evento) {
    const indice = evento.target.dataset.indice;   // lee el atributo data-indice del boton
    // Si se hizo clic en una celda y no en un boton, no hay data-indice (undefined) y no se hace nada
    if (indice !== undefined) {
        equipos.splice(Number(indice), 1);          // splice: quita 1 elemento en esa posicion
        dibujarTabla();
    }
});

// EVENTO input: al escribir en el campo Tarifa, se recalcula todo
document.getElementById("tarifa").addEventListener("input", dibujarTabla);

// Al cargar la pagina se dibuja la tabla por primera vez
dibujarTabla();

// --- Comparacion de paradigmas (se ve en la consola: F12 -> Console) ---
// El MISMO total, escrito en estilo IMPERATIVO: una variable que cambia dentro de un for
function sumarKwhImperativo(lista) {
    let suma = 0;
    for (let i = 0; i < lista.length; i++) {
        suma = suma + lista[i].kwh();
    }
    return suma;
}
console.log("Total imperativo (for):", sumarKwhImperativo(equipos), "kWh");
console.log("Total funcional (reduce):", sumarKwh(equipos), "kWh");