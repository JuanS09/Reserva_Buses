// Lógica para admin-detalle-empresa.html
let empresaActual = "Transportes Rápido Andino";

function inicializarPanel() {
    // 1. Capturamos el parámetro 'empresa' de la URL[cite: 20]
    const urlParams = new URLSearchParams(window.location.search);
    const empParam = urlParams.get('empresa');
    if (empParam) {
        empresaActual = decodeURIComponent(empParam);
    }

    // 2. Buscamos los datos de esta empresa en el localStorage[cite: 20]
    let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
    let empresaEncontrada = empresas.find(e => e.nombre === empresaActual);

    // 3. Pintamos los datos reales en la interfaz si existen[cite: 20]
    if (empresaEncontrada) {
        document.getElementById('tituloEmpresaNav').textContent = empresaEncontrada.nombre;
        document.getElementById('lblNombreEmpresa').textContent = empresaEncontrada.nombre;
        document.getElementById('lblResponsable').textContent = empresaEncontrada.responsable || 'Sin asignar';
        document.getElementById('lblTelefono').textContent = empresaEncontrada.contacto;
    }

    // Inicializamos el selector desplegable superior[cite: 20]
    poblarSelectorEmpresas();

    cambiarPestana('empresa');
    cargarBuses();
    cargarRutas();
}

function cambiarPestana(pestana) {
    document.getElementById('seccion-empresa').classList.add('hidden');
    document.getElementById('seccion-buses').classList.add('hidden');
    document.getElementById('seccion-rutas').classList.add('hidden');

    document.getElementById('tab-empresa').classList.remove('active');
    document.getElementById('tab-buses').classList.remove('active');
    document.getElementById('tab-rutas').classList.remove('active');

    document.getElementById('seccion-' + pestana).classList.remove('hidden');
    document.getElementById('tab-' + pestana).classList.add('active');
}

// --- GESTIÓN DE BUSES ASOCIADOS A LA EMPRESA ---

function obtenerBuses() {
    let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
    return todosLosBuses[empresaActual] || [];
}

let busEditandoIndex = null;

function cargarBuses() {
    const buses = obtenerBuses();
    const tbody = document.getElementById('tablaBuses');
    const contenedorMobile = document.getElementById('tarjetasBusesMobile');
    
    if (!tbody || !contenedorMobile) return;
    
    tbody.innerHTML = '';
    contenedorMobile.innerHTML = '';

    if (buses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400 py-4">No hay buses registrados para esta empresa.</td></tr>`;
        contenedorMobile.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 bg-white p-4 rounded-xl border border-slate-200">No hay buses registrados para esta empresa.</p>`;
        return;
    }

    buses.forEach((b, i) => {
        // 1. Fila para PC
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-medium text-slate-900">${b.nombre || 'Sin nombre'}</td>
                <td class="py-3 px-4 text-slate-500">${b.placa || 'N/A'}</td>
                <td class="py-3 px-4 text-slate-500">${b.capacidad || 0} pasajero(s)</td>
                <td class="py-3 px-4 text-slate-500">${b.servicio || 'N/A'}</td>
                <td class="py-3 px-4 text-right space-x-3">
                    <a href="#" onclick="prepararEdicionBus(${i})" class="text-blue-600 hover:underline font-medium">Editar</a>
                    <a href="#" onclick="eliminarBus(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                </td>
            </tr>
        `;

        // 2. Tarjeta para Celular
        contenedorMobile.innerHTML += `
            <div class="admin-card p-4 space-y-3 text-xs">
                <div class="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                        <span class="font-bold text-slate-900 text-sm block">${b.nombre || 'Sin nombre'}</span>
                        <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${b.servicio || 'N/A'}</span>
                    </div>
                    <div class="text-right">
                        <span class="font-semibold text-slate-700">Placa: ${b.placa || 'N/A'}</span>
                    </div>
                </div>
                <div class="text-slate-600 space-y-1">
                    <p><strong>Capacidad:</strong> ${b.capacidad || 0} pasajero(s)</p>
                </div>
                <div class="flex justify-end space-x-4 pt-2 border-t border-slate-100">
                    <a href="#" onclick="prepararEdicionBus(${i})" class="text-blue-600 font-semibold hover:underline">Editar</a>
                    <a href="#" onclick="eliminarBus(${i})" class="text-red-600 font-semibold hover:underline">Eliminar</a>
                </div>
            </div>
        `;
    });
}

function guardarBus(e) {
    e.preventDefault();

    const busData = {
        nombre: document.getElementById('busNombre').value,
        placa: document.getElementById('busPlaca').value,
        capacidad: document.getElementById('busCapacidad').value,
        servicio: document.getElementById('busServicio').value
    };

    let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
    if (!todosLosBuses[empresaActual]) {
        todosLosBuses[empresaActual] = [];
    }

    if (busEditandoIndex !== null) {
        todosLosBuses[empresaActual][busEditandoIndex] = busData;
        mostrarNotificacion('¡Bus actualizado con éxito!', 'success');
        busEditandoIndex = null;
    } else {
        todosLosBuses[empresaActual].push(busData);
        mostrarNotificacion('¡Bus registrado con éxito!', 'success');
    }

    localStorage.setItem('busesTransporte', JSON.stringify(todosLosBuses));

    document.querySelector('#formBusContainer form').reset();
    restaurarBotonFormBus();
    toggleFormBus();
    cargarBuses();
}

function prepararEdicionBus(index) {
    let buses = obtenerBuses();
    const bus = buses[index];
    if (!bus) return;

    document.getElementById('busNombre').value = bus.nombre || '';
    document.getElementById('busPlaca').value = bus.placa || '';
    document.getElementById('busCapacidad').value = bus.capacidad || '';
    document.getElementById('busServicio').value = bus.servicio || 'Expreso';

    busEditandoIndex = index;

    const formContainer = document.getElementById('formBusContainer');
    if (formContainer.classList.contains('hidden')) {
        toggleFormBus();
    }

    const btnSubmit = document.querySelector('#formBusContainer form button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = 'Actualizar Bus';
        btnSubmit.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded transition';
    }

    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function restaurarBotonFormBus() {
    busEditandoIndex = null;
    const btnSubmit = document.querySelector('#formBusContainer form button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = 'Agregar Bus';
        btnSubmit.className = 'w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded transition';
    }
}

function eliminarBus(i) {
    abrirModalConfirmacion(
        '¿Estás seguro de eliminar este bus?',
        'Esta acción borrará el bus de la flota de la empresa de forma permanente.',
        'Sí, eliminar',
        () => {
            let todosLosBuses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
            if (todosLosBuses[empresaActual]) {
                todosLosBuses[empresaActual].splice(i, 1);
                localStorage.setItem('busesTransporte', JSON.stringify(todosLosBuses));
                mostrarNotificacion('Bus eliminado con éxito', 'success');
                cargarBuses();
            }
        }
    );
}

// --- FILTRAR BUSES EN TIEMPO REAL ---

function filtrarBuses() {
    const textoFiltro = (document.getElementById('filtroBusNombre').value || '').toLowerCase().trim();
    const selectServicio = document.getElementById('filtroBusServicio').value;
    const servicioFiltro = selectServicio === "Todos los tipos" ? "" : selectServicio;

    const buses = obtenerBuses();
    const tbody = document.getElementById('tablaBuses');
    const contenedorMobile = document.getElementById('tarjetasBusesMobile');
    
    if (!tbody || !contenedorMobile) return;

    tbody.innerHTML = '';
    contenedorMobile.innerHTML = '';

    const busesFiltrados = buses.filter(b => {
        const nombre = (b.nombre || '').toLowerCase();
        const placa = (b.placa || '').toLowerCase();
        const servicio = b.servicio || '';

        const coincideNombre = nombre.includes(textoFiltro) || placa.includes(textoFiltro);
        const coincideServicio = servicioFiltro === "" || servicio === servicioFiltro;
        return coincideNombre && coincideServicio;
    });

    if (busesFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400 py-4">No se encontraron buses con los criterios de búsqueda.</td></tr>`;
        contenedorMobile.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 bg-white p-4 rounded-xl border border-slate-200">No se encontraron buses con los criterios de búsqueda.</p>`;
        return;
    }

    buses.forEach((b, i) => {
        const nombre = (b.nombre || '').toLowerCase();
        const placa = (b.placa || '').toLowerCase();
        const servicio = b.servicio || '';

        const coincideNombre = nombre.includes(textoFiltro) || placa.includes(textoFiltro);
        const coincideServicio = servicioFiltro === "" || servicio === servicioFiltro;

        if (coincideNombre && coincideServicio) {
            // 1. Fila PC
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition">
                    <td class="py-3 px-4 font-medium text-slate-900">${b.nombre || 'Sin nombre'}</td>
                    <td class="py-3 px-4 text-slate-500">${b.placa || 'N/A'}</td>
                    <td class="py-3 px-4 text-slate-500">${b.capacidad || 0} pasajero(s)</td>
                    <td class="py-3 px-4 text-slate-500">${b.servicio || 'N/A'}</td>
                    <td class="py-3 px-4 text-right space-x-3">
                        <a href="#" onclick="prepararEdicionBus(${i})" class="text-blue-600 hover:underline font-medium">Editar</a>
                        <a href="#" onclick="eliminarBus(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                    </td>
                </tr>
            `;

            // 2. Tarjeta Celular
            contenedorMobile.innerHTML += `
                <div class="admin-card p-4 space-y-3 text-xs">
                    <div class="flex justify-between items-start border-b border-slate-100 pb-2">
                        <div>
                            <span class="font-bold text-slate-900 text-sm block">${b.nombre || 'Sin nombre'}</span>
                            <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${b.servicio || 'N/A'}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-semibold text-slate-700">Placa: ${b.placa || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="text-slate-600 space-y-1">
                        <p><strong>Capacidad:</strong> ${b.capacidad || 0} pasajero(s)</p>
                    </div>
                    <div class="flex justify-end space-x-4 pt-2 border-t border-slate-100">
                        <a href="#" onclick="prepararEdicionBus(${i})" class="text-blue-600 font-semibold hover:underline">Editar</a>
                        <a href="#" onclick="eliminarBus(${i})" class="text-red-600 font-semibold hover:underline">Eliminar</a>
                    </div>
                </div>
            `;
        }
    });
}

// --- RUTAS ---
function obtenerRutas() {
    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    return todas[empresaActual] || [
        {
            origen: 'Juigalpa', destino: 'Managua', salida: '06:00 am', llegada: '08:00 am',
            dias: ['Lunes', 'Miércoles', 'Viernes'], servicio: 'Expreso', precio: 'C$ 150.00',
            telefono: '+505 8888 8888', whatsapp: '+505 8888 8888', notas: 'Llamar antes de las 5pm para reservar.', paradas: []
        }
    ];
}

function cargarRutas() {
    const rutas = obtenerRutas();
    const tbody = document.getElementById('tablaRutas');
    const contenedorMobile = document.getElementById('tarjetasRutasMobile');
    
    if (!tbody || !contenedorMobile) return;
    
    tbody.innerHTML = '';
    contenedorMobile.innerHTML = '';

    if (rutas.length === 0) {
        let mensajeVacio = `<tr><td colspan="5" class="text-center text-slate-400 py-4">No hay rutas registradas para esta empresa.</td></tr>`;
        tbody.innerHTML = mensajeVacio;
        contenedorMobile.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 bg-white p-4 rounded-xl border border-slate-200">No hay rutas registradas para esta empresa.</p>`;
        return;
    }

    rutas.forEach((r, i) => {
        let diasHtml = (r.dias || []).map(d => `<span class="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-100" title="${d}">${d[0]}</span>`).join('');
        
        // 1. Renderizar fila para PC (Tabla)
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition">
                <td class="py-3 px-4 font-medium text-slate-900">${r.origen} → ${r.destino}</td>
                <td class="py-3 px-4 text-slate-500">${r.salida} - ${r.llegada}</td>
                <td class="py-3 px-4"><div class="flex space-x-1">${diasHtml}</div></td>
                <td class="py-3 px-4 text-slate-500">${r.servicio}</td>
                <td class="py-3 px-4 text-right space-x-3">
                    <a href="#" onclick="prepararEdicionRuta(${i})" class="text-blue-600 hover:underline font-medium">Editar</a>
                    <a href="#" onclick="eliminarRuta(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                </td>
            </tr>
        `;

        // 2. Renderizar tarjeta vertical para Celular (Mobile)
        contenedorMobile.innerHTML += `
            <div class="admin-card p-4 space-y-3 text-xs">
                <div class="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                        <span class="font-bold text-slate-900 text-sm block">${r.origen} → ${r.destino}</span>
                        <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${r.servicio}</span>
                    </div>
                </div>
                <div class="text-slate-600 space-y-1">
                    <p><strong>Horario:</strong> ${r.salida} - ${r.llegada}</p>
                    <div class="flex items-center space-x-1 pt-1">
                        <strong class="mr-1">Días:</strong> ${diasHtml}
                    </div>
                </div>
                <div class="flex justify-end space-x-4 pt-2 border-t border-slate-100">
                    <a href="#" onclick="prepararEdicionRuta(${i})" class="text-blue-600 font-semibold hover:underline">Editar</a>
                    <a href="#" onclick="eliminarRuta(${i})" class="text-red-600 font-semibold hover:underline">Eliminar</a>
                </div>
            </div>
        `;
    });
}

function prepararEdicionRuta(index) {
    let rutas = obtenerRutas();
    const r = rutas[index];
    if (!r) return;

    document.getElementById('rutaOrigen').value = r.origen || '';
    document.getElementById('rutaDestino').value = r.destino || '';
    document.getElementById('rutaSalida').value = r.salida || '';
    document.getElementById('rutaLlegada').value = r.llegada || '';
    document.getElementById('selectTipoServicio').value = r.servicio || 'Expreso';
    document.getElementById('rutaPrecio').value = r.precio || '';
    document.getElementById('rutaTelefono').value = r.telefono || '';
    document.getElementById('rutaWhatsapp').value = r.whatsapp || '';
    document.getElementById('rutaNotas').value = r.notas || '';

    const checkboxes = document.querySelectorAll('#grupoDias input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = r.dias && r.dias.includes(cb.value);
    });

    verificarTipoServicio();

    rutaEditandoIndex = index;

    const formContainer = document.getElementById('formRutaContainer');
    if (formContainer.classList.contains('hidden')) {
        toggleFormRuta();
    }

    const btnSubmit = document.querySelector('#formRutaContainer form button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = 'Actualizar Ruta';
        btnSubmit.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded transition';
    }

    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function restaurarBotonFormRuta() {
    rutaEditandoIndex = null;
    const btnSubmit = document.querySelector('#formRutaContainer form button[type="submit"]');
    if (btnSubmit) {
        btnSubmit.textContent = 'Agregar Ruta';
        btnSubmit.className = 'w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded transition';
    }
}

let rutaEditandoIndex = null;

function guardarRuta(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('#grupoDias input[type="checkbox"]:checked');
    let diasSeleccionados = Array.from(checkboxes).map(cb => cb.value);

    if (diasSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un día disponible.', 'blue');
        return;
    }

    let paradasLista = [];
    if (document.getElementById('selectTipoServicio').value === 'Ruteado') {
        const itemsParadas = document.querySelectorAll('#listaParadas > div');
        itemsParadas.forEach(div => {
            const inputs = div.querySelectorAll('input');
            paradasLista.push({
                nombre: inputs[0].value,
                hora: inputs[1].value,
                precio: inputs[2].value
            });
        });
    }

    const rutaData = {
        origen: document.getElementById('rutaOrigen').value,
        destino: document.getElementById('rutaDestino').value,
        salida: document.getElementById('rutaSalida').value,
        llegada: document.getElementById('rutaLlegada').value,
        dias: diasSeleccionados,
        servicio: document.getElementById('selectTipoServicio').value,
        precio: document.getElementById('rutaPrecio').value,
        telefono: document.getElementById('rutaTelefono').value,
        whatsapp: document.getElementById('rutaWhatsapp').value,
        notas: document.getElementById('rutaNotas').value,
        paradas: paradasLista
    };

    let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
    if (!todas[empresaActual]) todas[empresaActual] = [];

    if (rutaEditandoIndex !== null) {
        todas[empresaActual][rutaEditandoIndex] = rutaData;
        mostrarNotificacion('¡Ruta actualizada con éxito!', 'success');
        rutaEditandoIndex = null;
    } else {
        todas[empresaActual].push(rutaData);
        mostrarNotificacion('¡Ruta registrada con éxito!', 'success');
    }

    localStorage.setItem('rutasTransporte', JSON.stringify(todas));
    
    document.querySelector('#formRutaContainer form').reset();
    document.getElementById('listaParadas').innerHTML = '';
    restaurarBotonFormRuta();
    toggleFormRuta();
    cargarRutas();
}

function eliminarRuta(i) {
    abrirModalConfirmacion(
        '¿Estás seguro de eliminar esta ruta?',
        'Esta acción borrará la ruta y ya no estará disponible para las reservas.',
        'Sí, eliminar',
        () => {
            let todas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
            if (todas[empresaActual]) {
                todas[empresaActual].splice(i, 1);
                localStorage.setItem('rutasTransporte', JSON.stringify(todas));
                mostrarNotificacion('Ruta eliminada con éxito', 'success');
                cargarRutas();
            }
        }
    );
}

// --- FILTRAR RUTAS EN TIEMPO REAL ---

function filtrarRutas() {
    const filtroOrigen = (document.getElementById('filtroRutaOrigen').value || '').toLowerCase().trim();
    const filtroDestino = (document.getElementById('filtroRutaDestino').value || '').toLowerCase().trim();
    const selectServicio = document.getElementById('filtroRutaServicio').value;
    const filtroServicio = selectServicio === "Todos los tipos" ? "" : selectServicio;
    const selectDia = document.getElementById('filtroRutaDia').value;
    const filtroDia = selectDia === "Todos los días" ? "" : selectDia;

    const rutas = obtenerRutas();
    const tbody = document.getElementById('tablaRutas');
    const contenedorMobile = document.getElementById('tarjetasRutasMobile');
    
    if (!tbody || !contenedorMobile) return;
    
    tbody.innerHTML = '';
    contenedorMobile.innerHTML = '';

    const rutasFiltradas = rutas.filter(r => {
        const origen = (r.origen || '').toLowerCase();
        const destino = (r.destino || '').toLowerCase();
        const servicio = r.servicio || '';
        const dias = r.dias || [];

        const coincideOrigen = origen.includes(filtroOrigen);
        const coincideDestino = destino.includes(filtroDestino);
        const coincideServicio = !filtroServicio || servicio === filtroServicio;
        const coincideDia = !filtroDia || dias.includes(filtroDia);

        return coincideOrigen && coincideDestino && coincideServicio && coincideDia;
    });

    if (rutasFiltradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-400 py-4">No se encontraron rutas con los criterios de búsqueda.</td></tr>`;
        contenedorMobile.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 bg-white p-4 rounded-xl border border-slate-200">No se encontraron rutas con los criterios de búsqueda.</p>`;
        return;
    }

    rutas.forEach((r, i) => {
        const origen = (r.origen || '').toLowerCase();
        const destino = (r.destino || '').toLowerCase();
        const servicio = r.servicio || '';
        const dias = r.dias || [];

        const coincideOrigen = origen.includes(filtroOrigen);
        const coincideDestino = destino.includes(filtroDestino);
        const coincideServicio = !filtroServicio || servicio === filtroServicio;
        const coincideDia = !filtroDia || dias.includes(filtroDia);

        if (coincideOrigen && coincideDestino && coincideServicio && coincideDia) {
            let diasHtml = dias.map(d => `<span class="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-100" title="${d}">${d[0]}</span>`).join('');
            
            // 1. Renderizar fila para PC
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition">
                    <td class="py-3 px-4 font-medium text-slate-900">${r.origen} → ${r.destino}</td>
                    <td class="py-3 px-4 text-slate-500">${r.salida} - ${r.llegada}</td>
                    <td class="py-3 px-4"><div class="flex space-x-1">${diasHtml}</div></td>
                    <td class="py-3 px-4 text-slate-500">${r.servicio}</td>
                    <td class="py-3 px-4 text-right space-x-3">
                        <a href="#" onclick="prepararEdicionRuta(${i})" class="text-blue-600 hover:underline font-medium">Editar</a>
                        <a href="#" onclick="eliminarRuta(${i})" class="text-red-600 hover:underline font-medium">Eliminar</a>
                    </td>
                </tr>
            `;

            // 2. Renderizar tarjeta para Celular
            contenedorMobile.innerHTML += `
                <div class="admin-card p-4 space-y-3 text-xs">
                    <div class="flex justify-between items-start border-b border-slate-100 pb-2">
                        <div>
                            <span class="font-bold text-slate-900 text-sm block">${r.origen} → ${r.destino}</span>
                            <span class="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${r.servicio}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-emerald-600 text-sm">${r.precio}</span>
                        </div>
                    </div>
                    <div class="text-slate-600 space-y-1">
                        <p><strong>Horario:</strong> ${r.salida} - ${r.llegada}</p>
                        <div class="flex items-center space-x-1 pt-1">
                            <strong class="mr-1">Días:</strong> ${diasHtml}
                        </div>
                    </div>
                    <div class="flex justify-end space-x-4 pt-2 border-t border-slate-100">
                        <a href="#" onclick="prepararEdicionRuta(${i})" class="text-blue-600 font-semibold hover:underline">Editar</a>
                        <a href="#" onclick="eliminarRuta(${i})" class="text-red-600 font-semibold hover:underline">Eliminar</a>
                    </div>
                </div>
            `;
        }
    });
}

// --- FUNCIONES DE INTERFAZ Y NOTIFICACIONES ---
function toggleFormBus() {
    const form = document.getElementById('formBusContainer');
    const btn = document.getElementById('btnToggleBus');
    
    if (form.classList.contains('hidden')) {
        form.classList.remove('hidden');
        btn.textContent = 'Cancelar';
        btn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
    } else {
        form.classList.add('hidden');
        btn.textContent = '+ Nuevo Bus';
        btn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
        
        if (typeof restaurarBotonFormBus === 'function') {
            restaurarBotonFormBus();
            const formElement = document.querySelector('#formBusContainer form');
            if (formElement) formElement.reset();
        }
    }
}

function toggleFormRuta() {
    const form = document.getElementById('formRutaContainer');
    const btn = document.getElementById('btnToggleRuta');
    
    if (form.classList.contains('hidden')) {
        form.classList.remove('hidden');
        btn.textContent = 'Cancelar';
        btn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
    } else {
        form.classList.add('hidden');
        btn.textContent = '+ Nueva Ruta';
        btn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition';
    }
}

function verificarTipoServicio() {
    const tipo = document.getElementById('selectTipoServicio').value;
    const seccionParadas = document.getElementById('seccionParadas');
    if (tipo === 'Ruteado') seccionParadas.classList.remove('hidden');
    else seccionParadas.classList.add('hidden');
}

function agregarParada() {
    const lista = document.getElementById('listaParadas');
    const item = document.createElement('div');
    item.className = 'flex items-center space-x-2 bg-white p-2 rounded border border-slate-200';
    item.innerHTML = `
        <input type="text" placeholder="Nombre de parada" class="flex-1 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <input type="text" placeholder="Hora (ej. 6:45 am)" class="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <input type="text" placeholder="Precio (C$ 20.00)" class="w-28 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500" required>
        <button type="button" onclick="this.parentElement.remove()" class="text-red-600 font-bold px-2 text-xs">✕</button>
    `;
    lista.appendChild(item);
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('toastContainer');
    if (!contenedor) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center px-4 py-3 rounded-lg shadow-lg text-xs font-semibold text-white transition-all transform translate-y-2 opacity-0 ${
        tipo === 'success' ? 'bg-emerald-600' : 'bg-blue-600'
    }`;
    toast.innerHTML = `<span>${mensaje}</span>`;

    contenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function poblarSelectorEmpresas() {
    const select = document.getElementById('selectCambiarEmpresa');
    if (!select) return;

    let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
    select.innerHTML = '';

    empresas.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.nombre;
        option.textContent = emp.nombre;
        if (emp.nombre === empresaActual) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function cambiarEmpresaRapido(nuevaEmpresa) {
    if (!nuevaEmpresa) return;
    window.location.href = `admin-detalle-empresa.html?empresa=${encodeURIComponent(nuevaEmpresa)}`;
}

let accionConfirmarCallback = null;

function abrirModalConfirmacion(titulo, mensaje, textoBoton, callbackAccion) {
    const lblTitulo = document.getElementById('modalTitulo');
    const lblMensaje = document.getElementById('modalMensaje');
    const btnConfirmar = document.getElementById('btnConfirmarAccion');

    if (lblTitulo) lblTitulo.textContent = titulo;
    if (lblMensaje) lblMensaje.textContent = mensaje;
    if (btnConfirmar) {
        btnConfirmar.textContent = textoBoton;
        btnConfirmar.className = 'w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition';
    }

    accionConfirmarCallback = callbackAccion;

    const modal = document.getElementById('modalConfirmacion');
    if (modal) modal.classList.remove('hidden');
}

function cerrarModal() {
    const modal = document.getElementById('modalConfirmacion');
    if (modal) modal.classList.add('hidden');
    accionConfirmarCallback = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmar = document.getElementById('btnConfirmarAccion');
    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            if (typeof accionConfirmarCallback === 'function') {
                accionConfirmarCallback();
            }
            cerrarModal();
        };
    }
});

// --- EDICIÓN DE LA EMPRESA DESDE EL DETALLE ---

function toggleFormEditarEmpresaDetalle() {
    const vista = document.getElementById('vistaInfoEmpresa');
    const form = document.getElementById('formEditarEmpresaDetalle');
    const btn = document.getElementById('btnEditarEmpresaDetalle');

    if (form.classList.contains('hidden')) {
        // Cargamos los datos actuales en los inputs del formulario
        let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
        let empresaEncontrada = empresas.find(e => e.nombre === empresaActual);

        if (empresaEncontrada) {
            document.getElementById('editEmpresaNombre').value = empresaEncontrada.nombre || '';
            document.getElementById('editEmpresaResponsable').value = empresaEncontrada.responsable || '';
            document.getElementById('editEmpresaTelefono').value = empresaEncontrada.contacto || '';
        }

        form.classList.remove('hidden');
        vista.classList.add('hidden');
        btn.textContent = 'Cancelar';
        btn.className = 'bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition';
    } else {
        form.classList.add('hidden');
        vista.classList.remove('hidden');
        btn.textContent = 'Editar';
        btn.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition';
    }
}

function guardarEdicionEmpresaDetalle(e) {
    e.preventDefault();

    const nuevoNombre = document.getElementById('editEmpresaNombre').value.trim();
    const nuevoResponsable = document.getElementById('editEmpresaResponsable').value.trim();
    const nuevoTelefono = document.getElementById('editEmpresaTelefono').value.trim();

    let empresas = JSON.parse(localStorage.getItem('empresasTransporte')) || [];
    let index = empresas.findIndex(e => e.nombre === empresaActual);

    if (index !== -1) {
        // Actualizamos los datos de la empresa manteniendo su estado actual
        empresas[index].nombre = nuevoNombre;
        empresas[index].responsable = nuevoResponsable;
        empresas[index].contacto = nuevoTelefono;

        localStorage.setItem('empresasTransporte', JSON.stringify(empresas));

        // Si cambió el nombre de la empresa, debemos actualizar también las llaves asociadas en los buses y rutas del localStorage
        if (empresaActual !== nuevoNombre) {
            let buses = JSON.parse(localStorage.getItem('busesTransporte')) || {};
            if (buses[empresaActual]) {
                buses[nuevoNombre] = buses[empresaActual];
                delete buses[empresaActual];
                localStorage.setItem('busesTransporte', JSON.stringify(buses));
            }

            let rutas = JSON.parse(localStorage.getItem('rutasTransporte')) || {};
            if (rutas[empresaActual]) {
                rutas[nuevoNombre] = rutas[empresaActual];
                delete rutas[empresaActual];
                localStorage.setItem('rutasTransporte', JSON.stringify(rutas));
            }
        }

        mostrarNotificacion('¡Empresa actualizada con éxito!', 'success');

        // Redirigimos a la misma página con el nuevo nombre en la URL para mantener la sesión activa
        setTimeout(() => {
            window.location.href = `admin-detalle-empresa.html?empresa=${encodeURIComponent(nuevoNombre)}`;
        }, 1000);
    }
}