// Archivo: js/asistencia.js

// Lista de estudiantes predefinidos
let estudiantes = ["Juan Pérez", "María López", "Carlos Gómez", "Ana Rodríguez", "Luis Fernández"];
let materias = ["Matemáticas", "Lengua", "Historia", "Ciencias", "Inglés"];
let asistencia = JSON.parse(localStorage.getItem("asistencia")) || {};
let fechaAsistencia = localStorage.getItem("fechaAsistencia") || new Date().toISOString().split('T')[0];
let materiaSeleccionada = localStorage.getItem("materiaSeleccionada") || materias[0];
let listaVisible = false;

// Inicializar asistencia para cada materia si no existe
if (!asistencia[materiaSeleccionada]) {
    asistencia[materiaSeleccionada] = estudiantes.map(nombre => ({ nombre, estado: "Ausente", fechas: [], asistencias: 0, totalClases: 0, porcentaje: 0 }));
}

// Función para actualizar localStorage
function actualizarStorage() {
    localStorage.setItem("asistencia", JSON.stringify(asistencia));
    localStorage.setItem("fechaAsistencia", fechaAsistencia);
    localStorage.setItem("materiaSeleccionada", materiaSeleccionada);
}

// Función para mostrar u ocultar la lista de estudiantes
function toggleLista() {
    let lista = document.getElementById("listaEstudiantes");
    if (!lista.innerHTML.trim()) {
        mostrarLista(); // Asegura que la lista se genere si está vacía
    }
    listaVisible = !listaVisible;
    lista.style.display = listaVisible ? "table" : "none";
}

// Función para mostrar la lista de estudiantes con formato de tabla
function mostrarLista() {
    let lista = document.getElementById("listaEstudiantes");
    let fechaInput = document.getElementById("fechaAsistencia");
    let materiaInput = document.getElementById("materiaSeleccionada");
    if (!lista || !fechaInput || !materiaInput) return;
    
    lista.innerHTML = `<table border="1" width="100%">
        <thead>
            <tr>
                <th>Asistencia</th>
                <th>Estudiante</th>
                <th>Porcentaje</th>
                <th>Clases Asistidas</th>
            </tr>
        </thead>
        <tbody>
        ${asistencia[materiaSeleccionada].map((estudiante, index) => {
            let checked = estudiante.fechas.includes(fechaAsistencia) ? "checked" : "";
            return `<tr>
                <td style="text-align: center;"><input type="checkbox" id="estudiante_${index}" ${checked} onchange="marcarAsistencia(${index})"></td>
                <td>${estudiante.nombre}</td>
                <td style="text-align: center;">${estudiante.porcentaje}%</td>
                <td style="text-align: center;">(${estudiante.asistencias}/${estudiante.totalClases} días)</td>
            </tr>`;
        }).join('')}
        </tbody>
    </table>`;
    lista.style.display = listaVisible ? "table" : "none";
}

// Función para marcar asistencia y registrar fechas
function marcarAsistencia(index) {
    let checkbox = document.getElementById(`estudiante_${index}`);
    let estudiante = asistencia[materiaSeleccionada][index];
    if (checkbox.checked && !estudiante.fechas.includes(fechaAsistencia)) {
        estudiante.estado = "Presente";
        estudiante.asistencias += 1;
        estudiante.fechas.push(fechaAsistencia);
    } else if (!checkbox.checked && estudiante.fechas.includes(fechaAsistencia)) {
        estudiante.estado = "Ausente";
        estudiante.asistencias -= 1;
        estudiante.fechas = estudiante.fechas.filter(fecha => fecha !== fechaAsistencia);
    }
    estudiante.totalClases = asistencia[materiaSeleccionada].reduce((acc, est) => acc + (est.fechas.length > 0 ? 1 : 0), 0);
    estudiante.porcentaje = estudiante.totalClases > 0 ? ((estudiante.asistencias / estudiante.totalClases) * 100).toFixed(2) : 0;
    actualizarStorage();
    mostrarLista();
}

// Función para marcar todos como presentes
function marcarTodosPresentes() {
    asistencia[materiaSeleccionada].forEach((estudiante, index) => {
        if (!estudiante.fechas.includes(fechaAsistencia)) {
            estudiante.estado = "Presente";
            estudiante.asistencias += 1;
            estudiante.fechas.push(fechaAsistencia);
        }
        estudiante.totalClases = asistencia[materiaSeleccionada].reduce((acc, est) => acc + (est.fechas.length > 0 ? 1 : 0), 0);
        estudiante.porcentaje = estudiante.totalClases > 0 ? ((estudiante.asistencias / estudiante.totalClases) * 100).toFixed(2) : 0;
    });
    actualizarStorage();
    mostrarLista();
}

// Función para cambiar de materia y mostrar la lista automáticamente
function cambiarMateria() {
    materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
    if (!asistencia[materiaSeleccionada]) {
        asistencia[materiaSeleccionada] = estudiantes.map(nombre => ({ nombre, estado: "Ausente", fechas: [], asistencias: 0, totalClases: 0, porcentaje: 0 }));
    }
    actualizarStorage();
    mostrarLista();
    listaVisible = true;
}

// Función para filtrar estudiantes en la lista
function filtrarEstudiantes() {
    let filtro = document.getElementById("busqueda").value.toLowerCase();
    let lista = document.getElementById("listaEstudiantes").getElementsByTagName("tr");
    for (let item of lista) {
        let nombre = item.innerText.toLowerCase();
        item.style.display = nombre.includes(filtro) ? "table-row" : "none";
    }
}

// Cargar la lista al iniciar
window.onload = () => {
    mostrarLista(); // Asegura que la lista se genera correctamente
};
