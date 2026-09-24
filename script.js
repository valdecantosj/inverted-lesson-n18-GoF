/* ==========================================================================
   Patrones GoF — Fichas de estudio
   Comportamiento compartido por index.html y todas las ficha-*.html:
     1. Glosario de conceptos (datos)
     2. Progreso (fichas completadas, persistido en localStorage)
     3. Tema claro / oscuro
     4. Popover de conceptos
     5. Autoevaluación (quiz)
     6. Inicialización y eventos
   El contenido de cada ficha ya viene escrito en su HTML; este archivo
   solo agrega interactividad.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Glosario: clave -> [título, definición, nota opcional]
     Las fichas marcan los conceptos con <button class="term" data-k="clave">.
     ------------------------------------------------------------------------ */
  const GLOSARIO = {
    acopl:     ['Acoplamiento', 'Cuánto depende una clase de los detalles de otra. Menos acoplamiento = cambios más baratos.', 'Bajo acoplamiento es el objetivo.'],
    interfaz:  ['Interfaz', 'El conjunto de operaciones que una clase ofrece a quien la usa, sin mostrar cómo las implementa.', ''],
    cliente:   ['Cliente', 'La clase o módulo que usa al patrón. No sabe cómo funciona por dentro.', ''],
    indir:     ['Indirección (GRASP)', 'Poner un intermediario entre dos elementos para que no se conozcan directamente.', 'Adapter y Facade son indirecciones.'],
    vp:        ['Variaciones Protegidas (GRASP)', 'Encapsular un punto de cambio detrás de una interfaz estable, así lo que varía no rompe al resto.', ''],
    fab:       ['Fabricación Pura (GRASP)', 'Crear una clase artificial, que no existe en el dominio, para mantener alta cohesión y bajo acoplamiento.', ''],
    coh:       ['Alta cohesión', 'Una clase hace una sola cosa bien y todo lo que contiene está relacionado.', ''],
    poli:      ['Polimorfismo (GRASP)', 'Varias clases responden al mismo mensaje cada una a su manera; quien llama no pregunta de qué tipo es.', 'Reemplaza los if/switch por tipo.'],
    oc:        ['Abierto/Cerrado', 'Se puede agregar comportamiento nuevo sin modificar el código que ya funciona.', ''],
    inst:      ['Instanciar', 'Crear un objeto concreto a partir de una clase (con new).', ''],
    sub:       ['Subsistema', 'Grupo de clases que colaboran para una tarea y que el cliente no debería conocer una por una.', ''],
    algo:      ['Algoritmo / política', 'Una forma concreta de resolver algo, por ejemplo calcular un descuento o un recargo.', ''],
    global:    ['Acceso global', 'Poder llegar a un objeto desde cualquier parte sin pasarlo por parámetro. Cómodo, pero esconde dependencias.', 'Es la crítica más común a Singleton.'],
    thread:    ['Thread-safe', 'Funciona bien aunque varios hilos lo usen a la vez, sin crear dos instancias ni corromper datos.', ''],
    hoja:      ['Hoja', 'Elemento sin hijos, como un archivo dentro de una carpeta.', ''],
    comp:      ['Compuesto', 'Elemento que contiene otros elementos, como una carpeta que guarda archivos y más carpetas.', ''],
    rec:       ['Recursión', 'Una operación que se llama a sí misma sobre los hijos. Así un compuesto delega el trabajo en toda su estructura.', ''],
    adaptee:   ['Adaptee', 'Componente que ya tiene la funcionalidad que necesitamos, pero con una interfaz distinta a la que espera el cliente. No necesariamente lo diseñamos nosotros.', ''],
    sepint:    ['Separación de intereses', 'Dividir en módulos o áreas distintas los intereses diferentes, de modo que cada una tenga un propósito cohesivo (separation of concerns).', ''],
    lazy:      ['Inicialización perezosa (lazy)', 'La instancia se crea la primera vez que se pide, no antes. Requiere control de concurrencia si hay varios hilos.', 'La alternativa es la inicialización impaciente (eager).'],
    ctx:       ['Objeto de contexto', 'El objeto al que se aplica el algoritmo. Guarda su estrategia (visibilidad de atributo) y le delega parte del trabajo.', '']
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------------
     2. Progreso
     Antes vivía en memoria (un Set). Ahora cada ficha es otra página, así
     que se guarda en localStorage para sobrevivir a la navegación.
     ------------------------------------------------------------------------ */
  const CLAVE_PROGRESO = 'gof-fichas-completadas';

  const Progreso = {
    leer() {
      try {
        const crudo = localStorage.getItem(CLAVE_PROGRESO);
        return new Set(crudo ? JSON.parse(crudo) : []);
      } catch {
        return new Set(); // almacenamiento no disponible o dato corrupto
      }
    },
    marcar(id) {
      const vistas = this.leer();
      vistas.add(id);
      try {
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify([...vistas]));
      } catch {
        /* sin almacenamiento: el progreso no se conserva, pero todo sigue funcionando */
      }
    }
  };

  /** Actualiza el contador y las marcas "✓ Completada" del índice. */
  function pintarProgresoIndice() {
    const contador = $('.progress');
    if (!contador) return; // no estamos en el índice

    const vistas = Progreso.leer();
    const items = $$('.item[data-id]');
    const completadas = items.filter(item => vistas.has(item.dataset.id)).length;

    contador.textContent = `${completadas} de ${items.length} fichas completadas`;
    items.forEach(item => {
      $('.done', item).hidden = !vistas.has(item.dataset.id);
    });
  }

  /* ------------------------------------------------------------------------
     3. Tema claro / oscuro
     Sin elección guardada, se sigue la preferencia del sistema. Al tocar el
     botón, la elección queda fija en <html data-theme> y en localStorage.
     (El <script> inline del <head> la aplica antes de pintar la página.)
     ------------------------------------------------------------------------ */
  const CLAVE_TEMA = 'gof-tema';
  const sistemaOscuro = matchMedia('(prefers-color-scheme: dark)');

  const Tema = {
    actual() {
      return document.documentElement.dataset.theme || (sistemaOscuro.matches ? 'dark' : 'light');
    },
    alternar() {
      const nuevo = this.actual() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nuevo;
      try {
        localStorage.setItem(CLAVE_TEMA, nuevo);
      } catch {
        /* sin almacenamiento: el tema vale solo para esta página */
      }
      this.pintarBoton();
    },
    /** Relee la elección guardada (útil al volver con "atrás" desde otra ficha). */
    sincronizar() {
      try {
        const guardado = localStorage.getItem(CLAVE_TEMA);
        if (guardado) document.documentElement.dataset.theme = guardado;
      } catch {
        /* sin almacenamiento: se mantiene el tema actual */
      }
      this.pintarBoton();
    },
    /** El botón muestra el modo al que se va a cambiar, no el actual. */
    pintarBoton() {
      const boton = $('.theme-toggle');
      if (!boton) return;
      const oscuro = this.actual() === 'dark';
      $('span', boton).textContent = oscuro ? '☀' : '☾';
      boton.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      boton.title = boton.getAttribute('aria-label');
    }
  };

  /* ------------------------------------------------------------------------
     4. Popover de conceptos
     ------------------------------------------------------------------------ */
  const pop = $('#pop');
  let anclaActual = null; // el .term que abrió el popover

  function mostrarConcepto(boton) {
    const entrada = GLOSARIO[boton.dataset.k];
    if (!entrada) return;
    const [titulo, definicion, nota] = entrada;

    if (anclaActual && anclaActual !== boton) anclaActual.setAttribute('aria-expanded', 'false');
    anclaActual = boton;
    boton.setAttribute('aria-expanded', 'true');

    // El popover toma el color de acento del término que lo abrió
    pop.style.setProperty('--accent', getComputedStyle(boton).borderBottomColor);
    pop.innerHTML =
      `<button class="x" aria-label="Cerrar">×</button>` +
      `<b>${titulo}</b>${definicion}` +
      (nota ? `<small>${nota}</small>` : '');
    pop.hidden = false;

    // Posicionamiento: debajo del término, o arriba si no entra en pantalla
    const r = boton.getBoundingClientRect();
    const ancho = pop.offsetWidth;
    const alto = pop.offsetHeight;
    const left = Math.max(8, Math.min(r.left, innerWidth - ancho - 8));
    let top = r.bottom + 8;
    if (top + alto > innerHeight - 8) top = Math.max(8, r.top - alto - 8);

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  function ocultarConcepto() {
    pop.hidden = true;
    if (anclaActual) {
      anclaActual.setAttribute('aria-expanded', 'false');
      anclaActual = null;
    }
  }

  /** Cierra el popover y devuelve el foco al término (accesibilidad). */
  function cerrarYDevolverFoco() {
    const ancla = anclaActual;
    ocultarConcepto();
    if (ancla) ancla.focus();
  }

  /* ------------------------------------------------------------------------
     5. Autoevaluación
     Cada pregunta es un .qq con:
       data-answer  -> índice de la opción correcta
       data-explain -> explicación que se muestra al responder
     ------------------------------------------------------------------------ */
  function responder(opcion) {
    const pregunta = opcion.closest('.qq');
    const correcta = Number(pregunta.dataset.answer);
    const elegida = $$('.opt', pregunta).indexOf(opcion);
    const acierto = elegida === correcta;

    $$('.opt', pregunta).forEach((b, k) => {
      b.disabled = true;
      if (k === correcta) b.classList.add('ok');
    });
    if (!acierto) opcion.classList.add('no');

    pregunta.dataset.done = '1';
    if (acierto) pregunta.dataset.ok = '1';

    $('.fb', pregunta).innerHTML =
      (acierto ? '<b>¡Correcto!</b> ' : '<b>Casi.</b> ') + pregunta.dataset.explain;

    actualizarPuntaje();
  }

  function actualizarPuntaje() {
    const total = $$('.qq').length;
    const respondidas = $$('.qq[data-done]').length;
    const correctas = $$('.qq[data-ok]').length;

    $('#sc').textContent = `${respondidas} de ${total} respondidas · ${correctas} correctas`;

    if (respondidas === total) Progreso.marcar(document.body.dataset.ficha);
  }

  /* ------------------------------------------------------------------------
     6. Eventos
     ------------------------------------------------------------------------ */
  document.addEventListener('click', e => {
    const termino = e.target.closest('.term');
    const opcion = e.target.closest('.opt');

    if (termino) {
      anclaActual === termino && !pop.hidden ? ocultarConcepto() : mostrarConcepto(termino);
      return;
    }
    if (e.target.closest('.theme-toggle')) {
      Tema.alternar();
      return;
    }
    if (e.target.closest('#pop .x')) {
      cerrarYDevolverFoco();
      return;
    }
    if (!e.target.closest('#pop')) ocultarConcepto();

    if (opcion && !opcion.disabled) responder(opcion);
  });

  // En dispositivos con mouse, el concepto se abre al pasar por encima
  document.addEventListener('mouseover', e => {
    if (!matchMedia('(hover: hover)').matches) return;
    const termino = e.target.closest('.term');
    if (termino && anclaActual !== termino) mostrarConcepto(termino);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarYDevolverFoco();
  });

  // Al volver al índice con el botón "atrás", el navegador puede restaurar
  // la página desde caché: se repinta el progreso para que esté al día.
  addEventListener('pageshow', () => {
    pintarProgresoIndice();
    Tema.sincronizar(); // por si se cambió el tema en otra ficha
  });

  // Si el usuario no eligió tema y cambia el del sistema, se actualiza el ícono
  sistemaOscuro.addEventListener('change', () => Tema.pintarBoton());

  pintarProgresoIndice();
  Tema.pintarBoton();
})();
