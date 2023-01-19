'use strict'
window.onload = () => {
    document.querySelectorAll(".level").forEach((level) => {
        level.addEventListener("click", cambiarNivel);
    });
    empezarJuego();
}

const FLAG_IMG = "assets/images/bandera.png";
const CRONOMETER_IMG = "assets/images/cronometro.png";
const EXPLOSION_IMG = "assets/images/explosion.png";

const WIN_MSG = "¡HAS GANADO!"
const LOOSER_MSG = "¡HAS PERDIDO!"

let filas = 16;
let columnas = 16;

let minas = 40;

let flagCounter = minas;
let segCounter = 0;
let segCounterID = null;

let arrayMinas = [];
/*
* Controla botonera de nivel para cambiar la seleccionada
*/

function cambiarNivel(e) {
    let levels = document.querySelectorAll(".level");
    levels.forEach((level) => {
        if (level.classList.contains("selected")) {
            level.classList.remove("selected");
        }
        if (level == e.target) {
            level.classList.add("selected");
            if (e.target.classList.contains("easy")) {
                filas = 8;
                columnas = 8;
                minas = 10;
            } else if (e.target.classList.contains("middle")) {
                filas = 16;
                columnas = 16;
                minas = 40;
            } else {
                filas = 16;
                columnas = 30;
                minas = 99;
            }
        }
    });

    empezarJuego();
}

function empezarJuego() {
    /*
    Limpiamos el contador de tiempo primero y de banderas después
    */
    let timeCounter = document.getElementById("timeCounter");
    if (timeCounter.classList.contains("iniciado")) {
        timeCounter.classList.remove("iniciado");
        clearInterval(segCounterID);
        segCounterID = null;
        segCounter = 0;
        timeCounter.innerHTML = segCounter;
    }
    arrayMinas = [];
    flagCounter = minas;
    document.getElementById("flagsCounter").innerHTML = flagCounter;

    /* Creamos todos los td*/
    let tbody = document.getElementById("tbody");
    while (tbody.hasChildNodes()) {
        tbody.removeChild(tbody.firstChild);
    }

    for (let x = 0; x < filas; x++) {
        let tr = document.createElement("tr");
        for (let y = 0; y < columnas; y++) {
            let td = document.createElement("td");
            td.setAttribute("id", x + "," + y);
            td.addEventListener("click", pulsarCeldaEvento);
            td.addEventListener("contextmenu", anhadirBandera);
            tr.appendChild(td);
        }
        tbody.appendChild(tr)
    }

    /* Añadimos las minas en posiciones aleatorias*/
    let counterMinas = 0;
    while (counterMinas < minas) {
        let selectedID = enteroAleatorio(filas) + "," + enteroAleatorio(columnas);
        if (!arrayMinas.includes(selectedID)) {
            arrayMinas.push(selectedID);
            counterMinas += 1;
        }
    }

}

/*
* Lógica del juego al hacer click sobre una celda
* La primer función llama a la segunda, para poder utilizar la misma lógica en caso 
* de que pulse el usuario como de que la celda no tenga minas alrededor
*/
function pulsarCeldaEvento(e) {
    let td = e.target;
    while (td.tagName != 'TD') {
        td = td.parentNode;
    }
    pulsarCelda(td);
}

function pulsarCelda(td) {
    let timeCounter = document.getElementById("timeCounter");
    let tdID = td.getAttribute("id");
    if (!timeCounter.classList.contains("iniciado")) {
        timeCounter.classList.add("iniciado");
        segCounterID = setInterval(() => {
            timeCounter.innerHTML = segCounter;
            segCounter++;
        }, 1000);
    }
    if (!arrayMinas.includes(tdID)) {
        td.classList.add("pulsada");
        comprobarGanar();
        let totalMinas = contarMinas(td);
        if (totalMinas == 0) {
            let array = arrayAlrededor(td);
            array.forEach((auxTD) => {
                if (!auxTD.classList.contains("pulsada")) {
                    pulsarCelda(auxTD);
                }
            });
        } else {
            td.innerHTML = totalMinas;
        }
    } else {
        hasPerdido(td);
    }
    td.removeEventListener("click", pulsarCeldaEvento);
    td.removeEventListener("contextmenu", anhadirBandera);
}

/*
* Lógica del juego al hacer click derecho sobre una celda que no se ha pulsado previamente
*/
function anhadirBandera(e) {
    e.preventDefault();
    let td = e.target;
    while (td.tagName != 'TD') {
        td = td.parentNode;
    }
    if (td.hasChildNodes()) {
        td.removeChild(td.firstChild);
        flagCounter += 1;
    } else {
        let div = document.createElement("div");
        div.setAttribute("class", "imgDiv");

        let img = document.createElement("img");
        img.setAttribute("src", FLAG_IMG);
        img.setAttribute("alt", "Bandera");

        div.appendChild(img);
        td.appendChild(div);
        flagCounter -= 1;
    }
    document.getElementById("flagsCounter").innerHTML = flagCounter;
}


/*
* Dada una celda, devuelve un array con los tds de las celdas alrededor
*/
function arrayAlrededor(td) {
    let listaTds = [];
    let auxTd;
    let auxId;
    console.lo
    let id = td.getAttribute("id").split(',');

    let x = parseInt(id[0]);
    let y = parseInt(id[1]);

    let xMenos = x - 1;
    let yMenos = y - 1;

    let xMas = x + 1;
    let yMas = y + 1;

    if (xMenos >= 0 && yMenos >= 0) {
        auxId = xMenos + ',' + yMenos;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (xMenos >= 0) {
        auxId = xMenos + ',' + y;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (xMenos >= 0 && yMas < columnas) {
        auxId = xMenos + ',' + yMas;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (yMenos >= 0) {
        auxId = x + ',' + yMenos;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (yMas < columnas) {
        auxId = x + ',' + yMas;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (xMas < filas && yMenos >= 0) {
        auxId = xMas + ',' + yMenos;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (xMas < filas) {
        auxId = xMas + ',' + y;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }

    if (xMas < filas && yMas < columnas) {
        auxId = xMas + ',' + yMas;
        auxTd = document.getElementById(auxId);
        listaTds.push(auxTd);
    }
    return listaTds;

}

/*
* Función que cuenta el número de minas que hay alrededor de una celda
*/
function contarMinas(td) {
    let alrededor = arrayAlrededor(td);
    let counter = 0;
    alrededor.forEach((auxTd) => {
        let tdID = auxTd.getAttribute("id");
        if (arrayMinas.includes(tdID)) {
            counter += 1;
        }
    });
    return counter;
}

/*
* Función que genera enteros aleatorios 0 y el máximo indicado.
* Se utilizará para poner aleatoriamente las minas en la tabla
*/
function enteroAleatorio(max) {
    return parseInt(Math.random() * max);
}

/*
* Comprueba si el usuario ha ganado
*/
function comprobarGanar() {
    let totalPulsadas = document.querySelectorAll(".pulsada").length;
    let totalCeldasSinMinas = document.querySelectorAll("td").length - minas;
    if (totalPulsadas == totalCeldasSinMinas) {
        clearInterval(segCounterID);
        segCounterID = null;

        let tdConMinas = [];
        arrayMinas.forEach((id) =>
            tdConMinas.push(document.getElementById(id))
        );
        tdConMinas.forEach((td) => {
            if (!td.hasChildNodes()) {
                let div = document.createElement("div");
                div.setAttribute("class", "imgDiv");

                let img = document.createElement("img");
                img.setAttribute("src", FLAG_IMG);
                img.setAttribute("alt", "Bandera");

                div.appendChild(img);
                td.appendChild(div);
            }
        });
        let endGame = document.getElementById("endGame");
        endGame.innerHTML = WIN_MSG;
        endGame.style.visibility = "visible";
        setTimeout(() => {
            endGame.style.visibility = "hidden";
            empezarJuego();
        }, 5000);
    }
}

/*
* Lógica cuando se pierde
*/
function hasPerdido(td) {
    clearInterval(segCounterID);
    segCounterID = null;
    td.classList.add("lost");
    document.querySelectorAll("td").forEach((td) => {
        td.removeEventListener("click", pulsarCeldaEvento);
        td.removeEventListener("contextmenu", anhadirBandera);

        let tdID = td.getAttribute("id");
        if (arrayMinas.includes(tdID)) {
            if (td.hasChildNodes()) {
                td.removeChild(td.firstChild);
            }
            let div = document.createElement("div");
            div.setAttribute("class", "imgDiv");

            let img = document.createElement("img");
            img.setAttribute("src", EXPLOSION_IMG);
            img.setAttribute("alt", "Bandera");

            div.appendChild(img);
            td.appendChild(div);
        }
    });
    let endGame = document.getElementById("endGame");
    endGame.innerHTML = LOOSER_MSG;
    endGame.style.visibility = "visible";

    setTimeout(() => {
        endGame.style.visibility = "hidden";
        empezarJuego();
    }, 5000);
}


