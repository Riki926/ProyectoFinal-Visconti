document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Script cargado correctamente.");

    inicializarAsistencia();
    actualizarSelectMaterias();
    listaVisible = JSON.parse(localStorage.getItem("listaVisible")) ?? false;
    actualizarVisibilidadLista();

    document.getElementById("btnAgregarEstudiante").addEventListener("click", agregarEstudiante);
    document.getElementById("btnToggleLista").addEventListener("click", toggleLista);
    document.getElementById("fechaAsistencia").addEventListener("change", mostrarLista);
    document.getElementById("materiaSeleccionada").addEventListener("change", mostrarLista);
});

let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];
let materias = JSON.parse(localStorage.getItem("materias")) || ["Matemáticas", "Lengua", "Historia", "Ciencias", "Inglés"];
let asistencia = JSON.parse(localStorage.getItem("asistencia")) || {};
let fechaAsistencia = document.getElementById("fechaAsistencia").value || new Date().toISOString().split('T')[0];
let listaVisible = JSON.parse(localStorage.getItem("listaVisible")) ?? false;

function inicializarAsistencia() {
    materias.forEach(materia => {
        if (!asistencia[materia]) {
            asistencia[materia] = estudiantes.map(est => ({
                nombre: est.nombre,
                dni: est.dni,
                fechas: [],
                asistencias: 0,
                totalClases: 0,
                porcentaje: 0
            }));
        }
    });
    actualizarStorage();
}

function actualizarStorage() {
    localStorage.setItem("asistencia", JSON.stringify(asistencia));
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
    localStorage.setItem("materias", JSON.stringify(materias));
    localStorage.setItem("listaVisible", JSON.stringify(listaVisible));

    mostrarLista();
    actualizarVisibilidadLista();
}

function actualizarSelectMaterias() {
    let select = document.getElementById("materiaSeleccionada");
    select.innerHTML = materias.map(materia => `<option value="${materia}">${materia}</option>`).join('');
}

function agregarEstudiante() {
    let nombreInput = document.getElementById("nuevoEstudiante");
    let dniInput = document.getElementById("dniEstudiante");

    let nombre = nombreInput.value.trim();
    let dni = dniInput.value.trim();

    if (!nombre || !dni) {
        alert("Por favor, ingrese el nombre y el DNI del estudiante.");
        return;
    }

    if (estudiantes.some(est => est.dni === dni)) {
        alert("El DNI ya está registrado. Ingrese uno diferente.");
        return;
    }

    let nuevoEstudiante = { nombre, dni };
    estudiantes.push(nuevoEstudiante);

    materias.forEach(materia => {
        if (!asistencia[materia]) asistencia[materia] = [];
        asistencia[materia].push({
            nombre,
            dni,
            fechas: [],
            asistencias: 0,
            totalClases: 0,
            porcentaje: 0
        });
    });

    nombreInput.value = "";
    dniInput.value = "";

    actualizarStorage();
}

function eliminarEstudiante(index) {
    let materia = document.getElementById("materiaSeleccionada").value;
    estudiantes.splice(index, 1);
    asistencia[materia].splice(index, 1);
    actualizarStorage();
}

function marcarAsistencia(index) {
    let materia = document.getElementById("materiaSeleccionada").value;
    let fecha = document.getElementById("fechaAsistencia").value;

    if (!asistencia[materia]) return;

    let estudiante = asistencia[materia][index];

    // Si la fecha no está, se añade; si está, se quita.
    if (!estudiante.fechas.includes(fecha)) {
        estudiante.fechas.push(fecha);
        estudiante.asistencias++;
    } else {
        estudiante.fechas = estudiante.fechas.filter(f => f !== fecha);
        estudiante.asistencias--;
    }

    // El total de clases ahora se cuenta correctamente
    estudiante.totalClases = new Set([...estudiante.fechas]).size;

    // Calcular porcentaje correctamente
    estudiante.porcentaje = estudiante.totalClases > 0 
        ? Math.round((estudiante.asistencias / estudiante.totalClases) * 100) 
        : 0;

    actualizarStorage();
}

function toggleLista() {
    listaVisible = !listaVisible;
    localStorage.setItem("listaVisible", JSON.stringify(listaVisible));
    actualizarVisibilidadLista();
}

function actualizarVisibilidadLista() {
    let lista = document.getElementById("listaEstudiantes");
    lista.style.display = listaVisible ? "block" : "none";
}

function mostrarLista() {
    let lista = document.getElementById("listaEstudiantes");
    let materia = document.getElementById("materiaSeleccionada").value;

    if (!asistencia[materia]) return;

    lista.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Asistencia</th>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Porcentaje</th>
                    <th>Historial</th>
                    <th>Eliminar</th>
                </tr>
            </thead>
            <tbody>
                ${asistencia[materia].map((est, index) => {
                    let checked = est.fechas.includes(fechaAsistencia) ? "checked" : "";
                    return `
                        <tr>
                            <td><input type="checkbox" ${checked} onclick="marcarAsistencia(${index})"></td>
                            <td>${est.nombre}</td>
                            <td>${est.dni || "Sin DNI"}</td>
                            <td>${est.porcentaje}%</td>
                            <td>
                                <button class="historial-btn" onclick="mostrarHistorial(${index})">📅</button>
                            </td>
                            <td><button class="eliminar" onclick="eliminarEstudiante(${index})">X</button></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <div id="historialAsistencia" class="historial-popup" style="display: none;"></div>
    `;
}

function mostrarHistorial(index) {
    let materia = document.getElementById("materiaSeleccionada").value;
    let estudiante = asistencia[materia][index];

    let historialDiv = document.getElementById("historialAsistencia");

    let totalClases = estudiante.totalClases;
    let asistencias = estudiante.asistencias;
    let faltas = totalClases - asistencias;

    let mensaje = faltas > asistencias 
        ? `<p><strong>Usted tiene ${asistencias} asistencias y ${faltas} faltas de un total de ${totalClases} clases.</strong></p>` 
        : `<p><strong>Usted tiene ${asistencias} asistencias de un total de ${totalClases} clases.</strong></p>`;

    historialDiv.innerHTML = `
        <p><strong>${estudiante.nombre} (${estudiante.dni || "Sin DNI"})</strong></p>
        <ul>
            ${estudiante.fechas.map(fecha => `<li>${fecha}</li>`).join('')}
        </ul>
        ${mensaje}
        <button onclick="cerrarHistorial()">Cerrar</button>
    `;

    historialDiv.style.display = "block";
}

function cerrarHistorial() {
    document.getElementById("historialAsistencia").style.display = "none";
}
