document.addEventListener("DOMContentLoaded", () => { 

    const btnVerProfe = document.getElementById("btnVerAsistenciaDocente");

    if (btnVerProfe) {
      btnVerProfe.addEventListener("click", () => {
        const contenedor = document.getElementById("asistenciaDocenteContenedor");
    
        // Si está vacío o oculto, mostramos
        if (contenedor.innerHTML.trim() === "" || contenedor.style.display === "none") {
          contenedor.style.display = "block";
          mostrarAsistenciaDocente();
        } else {
          // Si ya está visible, lo ocultamos
          contenedor.innerHTML = "";
          contenedor.style.display = "none";
        }
    
        console.log("📋 Toggle de asistencia del profe ejecutado");
      });
    
      console.log("✅ Botón de asistencia docente listo");
    } else {
      console.warn("🚫 Botón de asistencia docente NO encontrado");
    }
    
    function mostrarAsistenciaDocente() {
        const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
        const fecha = document.getElementById("fechaAsistencia").value;
      
        const materiaObj = materias.find(m =>
          typeof m === "object" &&
          m.nombre &&
          materiaSeleccionada.includes(m.nombre)
        );
      
        const materia = materiaObj?.nombre || materiaSeleccionada;
        const docente = materiaObj?.docente || "Sin asignar";
      
        if (!materiaObj || docente === "Sin asignar") {
          console.warn("⛔ No se pudo mostrar asistencia: falta asignar docente o materia no válida");
          return;
        }
      
        console.log("🧑‍🏫 Asistencia del profe activada →", materia, docente, fecha);
      
        const contenedor = document.getElementById("asistenciaDocenteContenedor");
        contenedor.innerHTML = ""; // Limpio primero

      
        const registros = JSON.parse(localStorage.getItem("asistenciaDocente")) || [];
        const yaRegistrado = registros.find(r =>
          r.materia === materia &&
          r.docente === docente &&
          r.fecha === fecha
        );
      
        const dia = new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long" });
        const capitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
      
        const info = document.createElement("p");
        info.innerHTML = `
          <strong>📅 Hoy (${capitalizado} - ${fecha})</strong><br>
          🧑‍🏫 ${docente} - ${materia}
        `;
        contenedor.appendChild(info);
      
        if (yaRegistrado) {
          const estadoGuardado = document.createElement("p");
          estadoGuardado.innerHTML = `🗂️ Ya se registró como: <strong>${yaRegistrado.estado}</strong>`;
          contenedor.appendChild(estadoGuardado);
      
          const btnEditar = document.createElement("button");
          btnEditar.textContent = "🔄 Corregir asistencia";
          btnEditar.style.backgroundColor = "#555";
          btnEditar.style.color = "#fff";
          btnEditar.style.marginTop = "10px";
          btnEditar.onclick = () => {
            // eliminar el registro anterior
            const nuevos = registros.filter(r =>
              !(r.materia === materia && r.docente === docente && r.fecha === fecha)
            );
            localStorage.setItem("asistenciaDocente", JSON.stringify(nuevos));
            mostrarAsistenciaDocente(); // recarga interfaz
          };
          contenedor.appendChild(btnEditar);
        } else {
          const btnPresente = document.createElement("button");
          btnPresente.id = "btnPresenteDocente";
          btnPresente.textContent = "✅ Presente";
          btnPresente.style.backgroundColor = "green";
          btnPresente.style.color = "white";
          btnPresente.style.marginRight = "10px";
          btnPresente.onclick = () => {
            guardarAsistenciaDocente(materia, docente, fecha, "Presente");
            Swal.fire("✅ Guardado", "Asistencia docente marcada como PRESENTE", "success");
            mostrarAsistenciaDocente();
          };
      
          const btnAusente = document.createElement("button");
          btnAusente.id = "btnAusenteDocente";
          btnAusente.textContent = "❌ Ausente";
          btnAusente.style.backgroundColor = "red";
          btnAusente.style.color = "white";
          btnAusente.onclick = () => {
            guardarAsistenciaDocente(materia, docente, fecha, "Ausente");
            Swal.fire("❌ Guardado", "Asistencia docente marcada como AUSENTE", "info");
            mostrarAsistenciaDocente();
          };
      
          contenedor.appendChild(btnPresente);
          contenedor.appendChild(btnAusente);
        
        }
    
    }
 
    document.getElementById("materiaSeleccionada").addEventListener("change", mostrarModulosDelDia);
    document.getElementById("fechaAsistencia").addEventListener("change", mostrarModulosDelDia);
    
    document.getElementById("btnEliminarMateria").addEventListener("click", () => {
        const select = document.getElementById("materiaSeleccionada");
        const materiaSeleccionada = select.value;
      
        if (!materiaSeleccionada) {
          Swal.fire("Ups", "Primero seleccioná una materia para eliminar", "warning");
          return;
        }
      
        Swal.fire({
          title: `¿Eliminar "${materiaSeleccionada}"?`,
          text: "Esto también eliminará su asistencia registrada.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar"
        }).then(result => {
          if (result.isConfirmed) {
            materias = materias.filter(m => {
              if (typeof m === "string") return m !== materiaSeleccionada;
              return m.nombre !== materiaSeleccionada;
            });
      
            delete asistencia[materiaSeleccionada];
      
            localStorage.setItem("materias", JSON.stringify(materias));
            localStorage.setItem("asistencia", JSON.stringify(asistencia));
      
            actualizarSelectMaterias();

            sincronizarEstudiantesConMaterias();

            mostrarLista();



            
      
            Swal.fire("Eliminada", `"${materiaSeleccionada}" fue eliminada correctamente`, "success");
          }
        });
      });
    
      document.getElementById("fechaAsistencia").addEventListener("change", () => {
        mostrarLista();
        mostrarAsistenciaDocente();
      });
      
      document.getElementById("materiaSeleccionada").addEventListener("change", () => {
        mostrarLista();
        mostrarAsistenciaDocente();
      });
      
      

 
    document.getElementById("btnEditarMateria").addEventListener("click", () => {
        const select = document.getElementById("materiaSeleccionada");
        const materiaSeleccionada = select.value;
      
        const materiaObj = materias.find(m => typeof m === "object" && m.nombre === materiaSeleccionada);
      
        if (!materiaObj) {
          Swal.fire("No editable", "Solo se pueden editar materias con datos completos", "info");
          return;
        }
      
        document.getElementById("formularioMateria").style.display = "block";
        document.getElementById("nombreMateria").value = materiaObj.nombre;
        document.getElementById("docenteMateria").value = materiaObj.docente;
      
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].forEach(dia => {
          document.getElementById("modulos" + dia).value = 0;
        });
      
        materiaObj.dias.forEach(d => {
          const input = document.getElementById("modulos" + d.dia);
          if (input) input.value = d.modulos;
        });
      
        document.getElementById("btnGuardarMateria").dataset.editando = materiaSeleccionada;
      });
      



  // BOTÓN: Mostrar/Ocultar formulario
  document.getElementById("btnAbrirFormularioMateria").addEventListener("click", () => {
    const form = document.getElementById("formularioMateria");
    form.style.display = form.style.display === "none" ? "block" : "none";
  });

  // BOTÓN: Guardar materia
  document.getElementById("btnGuardarMateria").addEventListener("click", () => {
    const nombre = document.getElementById("nombreMateria").value.trim();
    const docente = document.getElementById("docenteMateria").value.trim();

    if (!nombre || !docente) {
      Swal.fire("Faltan datos", "Completa el nombre de la materia y del docente", "warning");
      return;
    }

    const dias = [
      { dia: "Lunes", modulos: parseInt(document.getElementById("modulosLunes").value) || 0 },
      { dia: "Martes", modulos: parseInt(document.getElementById("modulosMartes").value) || 0 },
      { dia: "Miércoles", modulos: parseInt(document.getElementById("modulosMiercoles").value) || 0 },
      { dia: "Jueves", modulos: parseInt(document.getElementById("modulosJueves").value) || 0 },
      { dia: "Viernes", modulos: parseInt(document.getElementById("modulosViernes").value) || 0 }
    ].filter(d => d.modulos > 0);

    if (dias.length === 0) {
      Swal.fire("Días vacíos", "Debe asignar al menos un día con módulos", "warning");
      return;
    }

    const nuevaMateria = {
      nombre,
      docente,
      dias
    };

    materias.push(nuevaMateria);
    localStorage.setItem("materias", JSON.stringify(materias));
    actualizarSelectMaterias();


    Swal.fire("Materia guardada", `"${nombre}" fue creada correctamente`, "success");

    // Resetear formulario
    document.getElementById("nombreMateria").value = "";
    document.getElementById("docenteMateria").value = "";
    ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].forEach(dia => {
      document.getElementById("modulos" + dia).value = 0;
    });

    document.getElementById("formularioMateria").style.display = "none";
  });



    const fechaInput = document.getElementById("fechaAsistencia");
    fechaInput.value = new Date().toISOString().split("T")[0];
  
    inicializarDatos();
    actualizarSelectMaterias();
    mostrarLista();

    
  
    document.getElementById("btnAgregarEstudiante").addEventListener("click", agregarEstudiante);
    document.getElementById("btnToggleLista").addEventListener("click", toggleLista);
    document.getElementById("fechaAsistencia").addEventListener("change", mostrarLista);
    document.getElementById("materiaSeleccionada").addEventListener("change", mostrarLista);
  });
  
  let estudiantes = JSON.parse(localStorage.getItem("estudiantes")) || [];
  let materiasRaw = JSON.parse(localStorage.getItem("materias")) || ["Matemáticas", "Lengua", "Historia", "Ciencias", "Inglés"];

let materias = materiasRaw.map(m =>
  typeof m === "string"
    ? { nombre: m, docente: "Sin asignar", dias: [] }
    : m
);

  let asistencia = JSON.parse(localStorage.getItem("asistencia")) || {};
  let listaVisible = true;
  
  function inicializarDatos() {
    materias.forEach(materia => {
      if (!asistencia[materia]) asistencia[materia] = [];
  
      estudiantes.forEach(est => {
        if (!asistencia[materia].some(e => e.dni === est.dni)) {
          asistencia[materia].push({
            nombre: est.nombre,
            dni: est.dni,
            fechas: [],
            asistencias: 0,
            totalClases: 0,
            porcentaje: 0
          });
        }
      });
    });
    guardarEnStorage();
  }
  
  function guardarEnStorage() {
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));
    localStorage.setItem("materias", JSON.stringify(materias));
    localStorage.setItem("asistencia", JSON.stringify(asistencia));
    mostrarLista();
  }
  
  function actualizarSelectMaterias() {
    const select = document.getElementById("materiaSeleccionada");
    select.innerHTML = "";
  
    materias.forEach(m => {
      const nombre = typeof m === "string" ? m : m.nombre;
      const docente = typeof m === "string" ? "" : m.docente;
      const label = docente ? `${nombre} (${docente})` : nombre;
  
      const option = document.createElement("option");
      option.value = nombre;
      option.textContent = label;
      select.appendChild(option);
    });
  }
  function agregarEstudiante() {
    const nombre = document.getElementById("nuevoEstudiante").value.trim();
    const dni = document.getElementById("dniEstudiante").value.trim();
  
    if (!nombre || !dni) {
      Swal.fire("Faltan datos", "Completa nombre y DNI", "warning");
      return;
    }
  
    if (estudiantes.some(e => e.dni === dni)) {
      Swal.fire("DNI duplicado", "Este estudiante ya está registrado", "error");
      return;
    }
  
    const nuevoEst = { nombre, dni };
    estudiantes.push(nuevoEst);
  
    // Asociar al array de asistencia para todas las materias
    materias.forEach(materia => {
      const nombreMateria = typeof materia === "string" ? materia : materia.nombre;
      if (!asistencia[nombreMateria]) asistencia[nombreMateria] = [];
  
      const yaExiste = asistencia[nombreMateria].some(e => e.dni === dni);
      if (!yaExiste) {
        asistencia[nombreMateria].push({
          nombre,
          dni,
          fechas: [],
          asistencias: 0,
          totalClases: 0,
          porcentaje: 0
        });
      }
    });
  
    document.getElementById("nuevoEstudiante").value = "";
    document.getElementById("dniEstudiante").value = "";
  
    Swal.fire("Éxito", "Estudiante agregado correctamente", "success");
    guardarEnStorage();
  }
  
  function eliminarEstudiante(dni) {
    Swal.fire({
      title: "¿Eliminar estudiante?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No"
    }).then(result => {
      if (result.isConfirmed) {
        estudiantes = estudiantes.filter(e => e.dni !== dni);
  
        materias.forEach(m => {
          const nombreMateria = typeof m === "string" ? m : m.nombre;
          if (asistencia[nombreMateria]) {
            asistencia[nombreMateria] = asistencia[nombreMateria].filter(e => e.dni !== dni);
          }
        });
  
        guardarEnStorage();
        Swal.fire("Eliminado", "Estudiante eliminado correctamente", "success");
      }
    });
  }
  
  
  function marcarAsistencia(dni, fecha) {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;

const materiaObj = materias.find(m => {
  if (typeof m === "object" && m.nombre && m.docente) {
    return `${m.nombre} (Profe ${m.docente})` === materiaSeleccionada;
  } else {
    return m === materiaSeleccionada;
  }
});

const materia = typeof materiaObj === "string" ? materiaObj : materiaObj?.nombre;

    const est = asistencia[materia].find(e => e.dni === dni);
    if (!est) return;
  
    if (est.fechas.includes(fecha)) {
      est.fechas = est.fechas.filter(f => f !== fecha);
      est.asistencias--;
    } else {
      est.fechas.push(fecha);
      est.asistencias++;
    }
  
    est.totalClases = est.fechas.length;
    est.porcentaje = est.totalClases > 0
      ? Math.round((est.asistencias / est.totalClases) * 100)
      : 0;
  
    guardarEnStorage();
  }
  
  function toggleLista() {
    listaVisible = !listaVisible;
    document.getElementById("listaEstudiantes").style.display = listaVisible ? "block" : "none";
  }
  
  function mostrarModulosDelDia() {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
    const fecha = document.getElementById("fechaAsistencia").value;
  
    if (!materiaSeleccionada || !fecha) return;
  
    const fechaObj = new Date(fecha + "T00:00:00");
    const diaSemana = fechaObj.toLocaleDateString("es-ES", { weekday: "long" });
    const capitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  
    const materiaObj = materias.find(m =>
      typeof m === "object" && m.nombre === materiaSeleccionada
    );
  
    if (!materiaObj) {
      document.getElementById("modulosHoyTexto")?.remove();
      return;
    }
  
    const dia = materiaObj.dias.find(d => d.dia === capitalizado);
  
    let texto = "";
const nombreCompleto = `${materiaObj.nombre} (${materiaObj.docente || "Sin asignar"})`;

if (dia) {
  texto = `📅 Hoy (${capitalizado}) tenés ${dia.modulos} módulo(s) para la materia: ${nombreCompleto}.`;
} else {
  texto = `📅 Hoy (${capitalizado}) no tenés clase de ${nombreCompleto}.`;
}

  
    // Mostrar en pantalla (o reemplazar si ya existe)
    let existente = document.getElementById("modulosHoyTexto");
    if (!existente) {
      existente = document.createElement("p");
      existente.id = "modulosHoyTexto";
      existente.style.fontWeight = "bold";
      existente.style.marginTop = "10px";
      const destino = document.getElementById("fechaAsistencia");
      destino.insertAdjacentElement("afterend", existente);
      
    }
  
    existente.textContent = texto;
  }
 
  function mostrarLista() {
    const lista = document.getElementById("listaEstudiantes");
    const materia = document.getElementById("materiaSeleccionada").value;
    const fecha = document.getElementById("fechaAsistencia").value;
    const esMovil = window.innerWidth <= 768;
  
    if (!asistencia[materia]) return;
  
    lista.innerHTML = "";
  
    const table = document.createElement("table");
    table.innerHTML = `
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
      <tbody></tbody>
    `;
  
    const tbody = table.querySelector("tbody");
  
    asistencia[materia].forEach(est => {
      const row = document.createElement("tr");
  
      // Obtener la cantidad de módulos del día
      const materiaObj = materias.find(m => {
        if (typeof m === "string") return m === materia;
        if (typeof m === "object" && m.nombre) return m.nombre === materia;
        return false;
      });
  
      const diaSemana = new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long" });
      const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      const infoDia = materiaObj?.dias?.find(d => d.dia === diaCapitalizado);
      const maxModulos = infoDia?.modulos || 4;
  
      // Celda asistencia con checkboxes
      const asistenciaTd = document.createElement("td");
      asistenciaTd.style.minWidth = esMovil ? "120px" : "auto";
      
      for (let i = 0; i < maxModulos; i++) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox-asistencia";
        checkbox.dataset.dni = est.dni;
        checkbox.dataset.modulo = i;
        checkbox.dataset.fecha = fecha;
  
        // Verificar si ese módulo ya estaba marcado como asistido
        const registro = est.fechas?.find(f => f.fecha === fecha);
        if (registro && registro.modulos && registro.modulos.includes(i)) {
          checkbox.checked = true;
        }
  
        checkbox.addEventListener("change", () => {
          registrarAsistenciaCheckbox(est.dni, fecha, maxModulos);
        });
  
        asistenciaTd.appendChild(checkbox);
      }
      row.appendChild(asistenciaTd);
  
      // Nombre
      const nombreTd = document.createElement("td");
      nombreTd.textContent = est.nombre;
      nombreTd.style.minWidth = esMovil ? "120px" : "auto";
      row.appendChild(nombreTd);
  
      // DNI
      const dniTd = document.createElement("td");
      dniTd.textContent = est.dni;
      dniTd.style.minWidth = esMovil ? "100px" : "auto";
      row.appendChild(dniTd);
  
      // Porcentaje
      const porcentajeTd = document.createElement("td");
      porcentajeTd.textContent = `${est.porcentaje || 0}%`;
      row.appendChild(porcentajeTd);
  
      // Historial
      const historialTd = document.createElement("td");
      const historialBtn = document.createElement("button");
      historialBtn.textContent = "📅";
      historialBtn.className = "historial-btn";
      historialBtn.style.padding = esMovil ? "8px" : "5px 10px";
      historialBtn.addEventListener("click", () => mostrarHistorial(est.dni));
      historialTd.appendChild(historialBtn);
      row.appendChild(historialTd);
  
      // Eliminar
      const eliminarTd = document.createElement("td");
      const eliminarBtn = document.createElement("button");
      eliminarBtn.textContent = "X";
      eliminarBtn.className = "eliminar";
      eliminarBtn.style.padding = esMovil ? "8px" : "5px 10px";
      eliminarBtn.addEventListener("click", () => eliminarEstudiante(est.dni));
      eliminarTd.appendChild(eliminarBtn);
      row.appendChild(eliminarTd);
  
      tbody.appendChild(row);
    });
  
    lista.appendChild(table);
  }

  // Agregar evento para detectar cambios en el tamaño de la ventana
  window.addEventListener('resize', () => {
    mostrarLista();
  });

function registrarAsistenciaCheckbox(dni, fecha, totalModulos) {
  const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;

  const materiaObj = materias.find(m => {
    if (typeof m === "object" && m.nombre) return m.nombre === materiaSeleccionada;
    return m === materiaSeleccionada;
  });

  const materia = typeof materiaObj === "string" ? materiaObj : materiaObj?.nombre;
  const estudiante = asistencia[materia].find(e => e.dni === dni);
  if (!estudiante) return;

  // Recolectar los módulos marcados
  const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-dni="${dni}"][data-fecha="${fecha}"]`);
  const modulosMarcados = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.dataset.modulo));

  // Guardar los datos
  estudiante.fechas = estudiante.fechas.filter(f => f.fecha !== fecha);
  estudiante.fechas.push({ fecha, modulos: modulosMarcados });

  const totalMod = estudiante.fechas.reduce((acc, f) => acc + totalModulos, 0);
  const asistenciasTotales = estudiante.fechas.reduce((acc, f) => acc + f.modulos.length, 0);

  estudiante.totalClases = totalMod;
  estudiante.asistencias = asistenciasTotales;
  estudiante.porcentaje = totalMod > 0
    ? Math.round((asistenciasTotales / totalMod) * 100)
    : 0;

  guardarEnStorage();
}
  
  
  
function mostrarHistorial(dni) {
    const materia = document.getElementById("materiaSeleccionada").value;
    const est = asistencia[materia].find(e => e.dni === dni);
    const historialDiv = document.getElementById("historialAsistencia");
  
    const listaFechas = est.fechas
      .map(f => {
        const fecha = f.fecha;
        const asistencias = f.modulos || 0;
        return `<li>🗓️ ${fecha} → ${asistencias} módulo(s)</li>`;
      })
      .join("");
  
    historialDiv.innerHTML = `
      <p><strong>${est.nombre} (${est.dni})</strong></p>
      <ul>${listaFechas}</ul>
      <p><strong>${est.asistencias} asistencias de ${est.totalClases} clases (${est.porcentaje}%)</strong></p>
      <button onclick="cerrarHistorial()">Cerrar</button>
    `;
  
    historialDiv.style.display = "block";
  }
  
  
  function cerrarHistorial() {
    document.getElementById("historialAsistencia").style.display = "none";
    
  }
  


  function registrarAsistenciaPorModulos(dni, fecha, asistio, total) {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;

    const materiaObj = materias.find(m => {
      if (typeof m === "object" && m.nombre && m.docente) {
        return `${m.nombre} (Profe ${m.docente})` === materiaSeleccionada;
      } else {
        return m === materiaSeleccionada;
      }
    });
    
    const materia = typeof materiaObj === "string" ? materiaObj : materiaObj?.nombre;
    
    const estudiante = asistencia[materia].find(e => e.dni === dni);
    if (!estudiante) return;
  
    estudiante.fechas = estudiante.fechas.filter(f => f.fecha !== fecha);
    estudiante.fechas.push({ fecha, modulos: asistio });
  
    const totalMod = estudiante.fechas.reduce((acc, f) => acc + total, 0);
    const asistenciasTotales = estudiante.fechas.reduce((acc, f) => acc + f.modulos, 0);
  
    estudiante.totalClases = totalMod;
    estudiante.asistencias = asistenciasTotales;
    estudiante.porcentaje = totalMod > 0
      ? Math.round((asistenciasTotales / totalMod) * 100)
      : 0;
  
    actualizarStorage();
  }

  
  function sincronizarEstudiantesConMaterias() {
    materias.forEach(materia => {
      const nombreMateria = typeof materia === "object" ? materia.nombre : materia;
  
      if (!asistencia[nombreMateria]) asistencia[nombreMateria] = [];
  
      estudiantes.forEach(est => {
        const yaExiste = asistencia[nombreMateria].some(e => e.dni === est.dni);
        if (!yaExiste) {
          asistencia[nombreMateria].push({
            nombre: est.nombre,
            dni: est.dni,
            fechas: [],
            asistencias: 0,
            totalClases: 0,
            porcentaje: 0
          });
        }
      });
    });
  
    guardarEnStorage();
  
}
  
document.getElementById("btnCargarExcel").addEventListener("click", () => {
    document.getElementById("archivoExcel").click();
  });

  document.getElementById("archivoExcel").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const estudiantesDesdeExcel = XLSX.utils.sheet_to_json(sheet);
  
      if (!Array.isArray(estudiantesDesdeExcel) || estudiantesDesdeExcel.length === 0) {
        Swal.fire("Archivo vacío", "No se encontraron estudiantes en el archivo", "error");
        return;
      }
  
      procesarListaDesdeExcel(estudiantesDesdeExcel);
    };
    reader.readAsArrayBuffer(file);
  });
  

  function procesarListaDesdeExcel(data) {
    const materia = document.getElementById("materiaSeleccionada").value;
  
    if (!asistencia[materia]) asistencia[materia] = [];
  
    let nuevos = 0;
    data.forEach(est => {
      if (!est.nombre || !est.dni) return;
  
      const yaExiste = estudiantes.some(e => e.dni === est.dni);
      if (!yaExiste) {
        estudiantes.push({ nombre: est.nombre, dni: est.dni });
        nuevos++;
      }
  
      const yaEnAsistencia = asistencia[materia].some(e => e.dni === est.dni);
      if (!yaEnAsistencia) {
        asistencia[materia].push({
          nombre: est.nombre,
          dni: est.dni,
          fechas: [],
          asistencias: 0,
          totalClases: 0,
          porcentaje: 0
        });
      }
    });
  
    guardarEnStorage();
  
    Swal.fire(
      "Lista procesada",
      `${nuevos} estudiantes nuevos agregados desde el Excel`,
      "success"
    );
  }
  


  function guardarAsistenciaDocente(materia, docente, fecha, estado) {
    let data = JSON.parse(localStorage.getItem("asistenciaDocente")) || [];
  
    const index = data.findIndex(r =>
      r.materia === materia &&
      r.docente === docente &&
      r.fecha === fecha
    );
  
    if (index >= 0) {
      data[index].estado = estado; // actualiza si ya existe
    } else {
      data.push({ materia, docente, fecha, estado }); // agrega nuevo
    }
  
    localStorage.setItem("asistenciaDocente", JSON.stringify(data));
  }
  
  function mostrarAsistenciaDocente() {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
    const fecha = document.getElementById("fechaAsistencia").value;
  
    const materiaObj = materias.find(m =>
      typeof m === "object" && m.nombre && `(${m.docente})` &&
      `${m.nombre} (Profe ${m.docente})` === materiaSeleccionada
    );
  
    const materia = materiaObj?.nombre || materiaSeleccionada;
    const docente = materiaObj?.docente || "Sin asignar";
  
    if (!materiaObj || docente === "Sin asignar") return;
  
    // Crear contenedor si no existe
    let contenedor = document.getElementById("asistenciaDocenteContenedor");
    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "asistenciaDocenteContenedor";
      contenedor.style.margin = "10px 0";
      document.getElementById("fechaAsistencia").parentNode.appendChild(contenedor);
    }
  
    const dia = new Date(fecha + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long" });
    const capitalizado = dia.charAt(0).toUpperCase() + dia.slice(1);
  
    contenedor.innerHTML = `
      <p><strong>📅 Hoy (${capitalizado} - ${fecha})</strong><br>
      🧑‍🏫 ${docente} - ${materia}</p>
      <button id="btnPresenteDocente" style="background-color: green; color: white; margin-right: 10px;">✅ Presente</button>
      <button id="btnAusenteDocente" style="background-color: red; color: white;">❌ Ausente</button>
    `;
  
    document.getElementById("btnPresenteDocente").addEventListener("click", () => {
      guardarAsistenciaDocente(materia, docente, fecha, "Presente");
      Swal.fire("✅ Guardado", "Asistencia docente marcada como PRESENTE", "success");
    });
  
    document.getElementById("btnAusenteDocente").addEventListener("click", () => {
      guardarAsistenciaDocente(materia, docente, fecha, "Ausente");
      Swal.fire("❌ Guardado", "Asistencia docente marcada como AUSENTE", "info");
    });
    
  }

  document.getElementById("btnVerHistorialDocente").addEventListener("click", () => {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
    const materiaObj = materias.find(m =>
      typeof m === "object" && m.nombre && materiaSeleccionada.includes(m.nombre)
    );
  
    const materia = materiaObj?.nombre || materiaSeleccionada;
    const docente = materiaObj?.docente || "Sin asignar";
  
    const historialContenedor = document.getElementById("historialDocenteContenedor");
    historialContenedor.innerHTML = "";
    historialContenedor.style.display = historialContenedor.style.display === "none" ? "block" : "none";
  
    const registros = JSON.parse(localStorage.getItem("asistenciaDocente")) || [];
  
    const historial = registros.filter(r =>
      r.materia === materia && r.docente === docente
    );
  
    if (historial.length === 0) {
      historialContenedor.innerHTML = `<p>No hay registros para <strong>${docente}</strong> - <strong>${materia}</strong>.</p>`;
      return;
    }
  
    let presentes = 0;
    let ausentes = 0;
  
    const lista = document.createElement("ul");
  
    historial.forEach(r => {
      const item = document.createElement("li");
      item.textContent = `📅 ${r.fecha} → ${r.estado}`;
      lista.appendChild(item);
  
      if (r.estado === "Presente") presentes++;
      else ausentes++;
    });
  
    const total = presentes + ausentes;
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
  
    historialContenedor.innerHTML = `
      <h3>📖 Historial de asistencia</h3>
      <p><strong>${docente}</strong> - <strong>${materia}</strong></p>
      <p>🟢 Presentes: <strong>${presentes}</strong></p>
      <p>🔴 Ausentes: <strong>${ausentes}</strong></p>
      <p>📊 Porcentaje de asistencia: <strong>${porcentaje}%</strong></p>
    `;
    historialContenedor.appendChild(lista);
  });

  document.getElementById("btnExportarHistorialDocente").addEventListener("click", () => {
    const materiaSeleccionada = document.getElementById("materiaSeleccionada").value;
    const materiaObj = materias.find(m =>
      typeof m === "object" && m.nombre && materiaSeleccionada.includes(m.nombre)
    );
  
    const materia = materiaObj?.nombre || materiaSeleccionada;
    const docente = materiaObj?.docente || "Sin asignar";
  
    const registros = JSON.parse(localStorage.getItem("asistenciaDocente")) || [];
    const historial = registros.filter(r =>
      r.materia === materia && r.docente === docente
    );
  
    if (historial.length === 0) {
      Swal.fire("Sin datos", "No hay historial para exportar", "info");
      return;
    }
  
    const datosExcel = historial.map(r => ({
      Fecha: r.fecha,
      Materia: r.materia,
      Docente: r.docente,
      Estado: r.estado
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HistorialDocente");
  
    const nombreArchivo = `Historial_${docente.replace(/ /g, "_")}_${materia.replace(/ /g, "_")}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
  });

  document.getElementById("buscadorGeneral").addEventListener("input", () => {
    const texto = document.getElementById("buscadorGeneral").value.trim().toLowerCase();
    if (!texto) return;
  
    // 🔍 Buscar entre materias y docentes
    const materiaEncontrada = materias.find(m => {
      if (typeof m === "string") return m.toLowerCase().includes(texto);
      return (
        m.nombre.toLowerCase().includes(texto) ||
        m.docente.toLowerCase().includes(texto)
      );
    });
  
    if (materiaEncontrada) {
      const nombreMateria = typeof materiaEncontrada === "string" ? materiaEncontrada : materiaEncontrada.nombre;
      document.getElementById("materiaSeleccionada").value = nombreMateria;
  
      // Mostramos lista para asegurar que se carguen los estudiantes
      mostrarLista();
      mostrarAsistenciaDocente();
      mostrarModulosDelDia();
    }
  
    // 🔍 Buscar entre estudiantes (después de mostrar lista)
    setTimeout(() => {
      const estudiante = estudiantes.find(e =>
        e.nombre.toLowerCase().includes(texto) ||
        e.dni.toLowerCase().includes(texto)
      );
  
      if (estudiante) {
        const filas = [...document.querySelectorAll("#listaEstudiantes tr")];
        const fila = filas.find(tr => tr.textContent.toLowerCase().includes(estudiante.dni.toLowerCase()));
        
        if (fila) {
          fila.scrollIntoView({ behavior: "smooth", block: "center" });
          fila.style.backgroundColor = "#ffff99";
          setTimeout(() => {
            fila.style.backgroundColor = "";
          }, 2000);
        } else {
          console.warn("👤 Estudiante encontrado pero no visible aún");
        }
      }
    }, 300); // Delay para asegurar que la tabla esté renderizada
  });
  
  document.getElementById("buscadorEstudiante").addEventListener("input", () => {
    const filtro = document.getElementById("buscadorEstudiante").value.toLowerCase();
    const filas = document.querySelectorAll("#listaEstudiantes tbody tr");
  
    filas.forEach(fila => {
      const nombre = fila.children[1]?.textContent.toLowerCase() || "";
      const dni = fila.children[2]?.textContent.toLowerCase() || "";
  
      if (nombre.includes(filtro) || dni.includes(filtro)) {
        fila.style.display = "";
      } else {
        fila.style.display = "none";
      }
    });
  });
  
  document.getElementById("btnLimpiarBusquedaEstudiante").addEventListener("click", () => {
    const buscador = document.getElementById("buscadorEstudiante");
    buscador.value = "";
  
    const filas = document.querySelectorAll("#listaEstudiantes tbody tr");
    filas.forEach(fila => fila.style.display = ""); // Mostrar todas las filas
  });
  
  document.getElementById("btnExportarExcelEstudiantes").addEventListener("click", () => {
    const materia = document.getElementById("materiaSeleccionada").value;
    const fecha = document.getElementById("fechaAsistencia").value;
  
    if (!asistencia[materia] || asistencia[materia].length === 0) {
      Swal.fire("Sin datos", "No hay estudiantes registrados para esta materia", "info");
      return;
    }
  
    const data = asistencia[materia].map(est => {
      const total = est.totalClases || 0;
      const asistencias = est.asistencias || 0;
      const porcentaje = est.porcentaje || 0;
  
      return {
        "Nombre": est.nombre,
        "DNI": est.dni,
        "Asistencias (módulos)": asistencias,
        "Clases totales (módulos)": total,
        "Porcentaje": porcentaje + "%"
      };
    });
  
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
  
    const nombreArchivo = `asistencia-estudiantes-${materia}-${fecha}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  });
  