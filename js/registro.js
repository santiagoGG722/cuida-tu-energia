// =====================================================================
// registro.js: el JavaScript de registro.html
//
// Paradigma DIRIGIDO POR EVENTOS: el codigo no hace nada hasta que el usuario
// envia el formulario. Entonces lee los datos, decide con if que mensaje mostrar
// y guarda el equipo para que aparezca en la calculadora.
// =====================================================================

const TARIFA = 950;                  // COP por kWh
const DIAS_AL_MES = 30;              // se supone que el equipo se usa todos los dias
const CLAVE = "cuida-tu-energia";    // la MISMA clave que usa calculadora_consumo.js

// Los textos de cada tipo de equipo. Es un OBJETO usado como "diccionario":
// tipos["calor"] devuelve "produce calor"
const tipos = {
    calor: "produce calor",
    frio: "produce frío",
    electronico: "es electrónico",
    motor: "tiene motor"
};

// Si la fecha viene vacia, se usa la de hoy.
// new Date() = la fecha y hora actuales; toISOString() = "2026-10-21T19:00:00.000Z";
// slice(0, 10) = los primeros 10 caracteres: "2026-10-21"
const campoFecha = document.getElementById("fecha");
campoFecha.value = new Date().toISOString().slice(0, 10);

const formulario = document.getElementById("form-registro");

// EVENTO submit: CUANDO se envie el formulario, se ejecuta esta funcion
formulario.addEventListener("submit", function (evento) {
    // preventDefault: evita que el navegador recargue la pagina al enviar
    evento.preventDefault();

    // --- 1. Leer los datos del formulario ---
    const nombre = document.getElementById("nombre").value;
    const potencia = Number(document.getElementById("potencia").value);   // Number: texto -> numero
    const horas = Number(document.getElementById("horas").value);
    const tipo = document.getElementById("tipo").value;                    // el value del option elegido
    // querySelector: busca el PRIMER elemento que cumpla el selector CSS.
    // 'input[name="momento"]:checked' = el radio del grupo "momento" que esta marcado
    const momento = document.querySelector('input[name="momento"]:checked').value;
    // .checked: true si la casilla esta marcada, false si no
    const desconecta = document.getElementById("desconecta").checked;

    // --- 2. Calcular ---
    const kwhMes = potencia * horas * DIAS_AL_MES / 1000;
    const costoMes = kwhMes * TARIFA;

    // --- 3. Decidir que consejos mostrar (if = SI se cumple la condicion...) ---
    // Arreglo vacio: se le van agregando consejos con push
    const consejos = [];
    if (potencia >= 1000) {
        consejos.push("Es un equipo de <strong>alto consumo</strong> (1000 W o más): úselo el menor tiempo posible.");
    }
    // === compara si dos valores son IGUALES
    if (momento === "noche") {
        consejos.push("Lo usa de noche, la hora más cara para el sistema: intente usarlo de día.");
    }
    // ! = NO. !desconecta = "si NO lo desconecta"
    if (!desconecta) {
        consejos.push("Desconéctelo cuando no lo use: muchos equipos gastan energía en espera.");
    }
    if (consejos.length === 0) {
        consejos.push("¡Muy bien! Lo usa de forma responsable.");
    }

    // La clase de la alerta de Bootstrap depende del costo:
    // alert-danger = roja, alert-warning = amarilla, alert-success = verde
    let colorAlerta;
    if (costoMes > 30000) {
        colorAlerta = "alert-danger";
    } else if (costoMes > 10000) {
        colorAlerta = "alert-warning";
    } else {
        colorAlerta = "alert-success";
    }

    // --- 4. Mostrar el resultado en la pagina ---
    // map convierte cada consejo en un <li>; join("") los une en un solo texto
    const listaConsejos = consejos.map((c) => `<li>${c}</li>`).join("");
    document.getElementById("resultado").innerHTML = `
        <div class="alert ${colorAlerta}">
            <h3 class="h5">${nombre} registrado</h3>
            <p class="mb-1">Este equipo ${tipos[tipo]}.</p>
            <p class="mb-1">Consumo al mes: <strong>${kwhMes.toLocaleString("es-CO")} kWh</strong></p>
            <p>Costo al mes: <strong>$ ${costoMes.toLocaleString("es-CO", { maximumFractionDigits: 0 })}</strong></p>
            <ul class="mb-2">${listaConsejos}</ul>
            <a class="btn btn-sm btn-primary" href="calculadora_consumo.html">Verlo en la calculadora</a>
        </div>`;

    // --- 5. Guardar el equipo en localStorage para que lo vea la calculadora ---
    // getItem lee el texto guardado; si no hay nada devuelve null.
    // JSON.parse convierte el texto en un arreglo; si es null se empieza con un arreglo vacio [].
    const texto = localStorage.getItem(CLAVE);
    const lista = texto === null ? [] : JSON.parse(texto);
    lista.push({ nombre: nombre, potencia: potencia, horas: horas, dias: DIAS_AL_MES });
    // JSON.stringify convierte el arreglo otra vez en texto para guardarlo
    localStorage.setItem(CLAVE, JSON.stringify(lista));

    // reset(): deja el formulario como al principio (y se vuelve a poner la fecha de hoy)
    formulario.reset();
    campoFecha.value = new Date().toISOString().slice(0, 10);
});