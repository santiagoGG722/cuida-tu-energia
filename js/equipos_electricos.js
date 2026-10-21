// =====================================================================
// equipos_electricos.js: llena la tabla de la pagina equipos_electricos.html
//
// Paradigma IMPERATIVO: se le dice al computador COMO hacer las cosas,
// instruccion por instruccion: crear variables, recorrer con un for y acumular.
// =====================================================================

// const: una variable que NO cambia de valor
const TARIFA = 950;   // COP por kWh (la de la factura de la casa de ejemplo)

// Un ARREGLO (lista entre [ ]) de OBJETOS (datos entre { }).
// Cada objeto es un equipo: nombre: valor, potencia: valor...
// horasSemana = horas al dia de lunes a viernes; horasFinde = horas al dia sabado y domingo
const equipos = [
    { nombre: "Ducha eléctrica", potencia: 3500, horasSemana: 0.5, horasFinde: 1 },
    { nombre: "Plancha",         potencia: 1200, horasSemana: 0.4, horasFinde: 1 },
    { nombre: "Computador",      potencia: 250,  horasSemana: 6,   horasFinde: 2 },
    { nombre: "Televisor",       potencia: 120,  horasSemana: 3.2, horasFinde: 6 }
];

// FUNCION: un bloque de codigo con nombre. Recibe datos (PARAMETROS)
// y devuelve un resultado con return.
// 5 dias de lunes a viernes + 2 dias de fin de semana; ÷ 1000 pasa de Wh a kWh
function kwhSemana(potencia, horasSemana, horasFinde) {
    return potencia * (horasSemana * 5 + horasFinde * 2) / 1000;
}

// Escribe un numero al estilo colombiano: punto para miles y coma para decimales.
// decimales = cuantos decimales mostrar como maximo
function formato(numero, decimales) {
    return numero.toLocaleString("es-CO", { maximumFractionDigits: decimales });
}

// document.getElementById("..."): busca en la pagina el elemento con ese id.
// La pagina convertida en objetos que JavaScript puede cambiar se llama DOM.
const cuerpo = document.getElementById("cuerpo-equipos");

// let: una variable que SI cambia. Los totales empiezan en cero.
let totalKwh = 0;
let totalCosto = 0;
let mayor = equipos[0];   // por ahora, el que mas gasta es el primero de la lista

// Ciclo for: repite el bloque una vez por cada equipo.
//   let i = 0           -> empieza en la posicion 0 (la primera)
//   i < equipos.length  -> sigue mientras i sea menor que la cantidad de equipos (4)
//   i++                 -> al terminar cada vuelta, suma 1 a i
for (let i = 0; i < equipos.length; i++) {
    const equipo = equipos[i];   // el equipo de la posicion i
    // equipo.potencia: el PUNTO lee un dato del objeto
    const kwh = kwhSemana(equipo.potencia, equipo.horasSemana, equipo.horasFinde);
    const costo = kwh * TARIFA;

    // Se ACUMULA: los totales cambian en cada vuelta del ciclo
    totalKwh = totalKwh + kwh;
    totalCosto = totalCosto + costo;

    // if: si este equipo gasta mas que el mayor encontrado hasta ahora, pasa a ser el mayor
    if (kwh > kwhSemana(mayor.potencia, mayor.horasSemana, mayor.horasFinde)) {
        mayor = equipo;
    }

    // innerHTML +=: AGREGA HTML dentro del tbody.
    // Las comillas invertidas ` ` son una PLANTILLA: permiten meter variables con ${...}
    cuerpo.innerHTML += `<tr>
        <td>${equipo.nombre}</td>
        <td>${equipo.potencia}</td>
        <td>${formato(equipo.horasSemana, 1)}</td>
        <td>${formato(equipo.horasFinde, 1)}</td>
        <td>${formato(kwh, 2)}</td>
        <td>${formato(costo, 0)}</td>
    </tr>`;
}

// textContent: cambia el TEXTO de un elemento
document.getElementById("total-kwh").textContent = formato(totalKwh, 2);
document.getElementById("total-costo").textContent = formato(totalCosto, 0);

// El equipo que mas gasta y que porcentaje del total representa
const kwhMayor = kwhSemana(mayor.potencia, mayor.horasSemana, mayor.horasFinde);
const porcentaje = kwhMayor / totalKwh * 100;
document.getElementById("mas-gasta").innerHTML = `
    <div>El que más gasta</div>
    <div class="valor">${mayor.nombre}</div>
    <div>${formato(porcentaje, 1)} % de la energía de la semana</div>`;

// console.log: escribe en la CONSOLA del navegador (F12 -> Console). Sirve para revisar.
console.log("Total de la semana:", totalKwh, "kWh", totalCosto, "COP");