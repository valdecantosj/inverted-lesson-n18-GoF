const G = {
  acopl: ["Acoplamiento", "Cuánto depende una clase de los detalles de otra. Menos acoplamiento = cambios más baratos.", "Bajo acoplamiento es el objetivo."],
  interfaz: ["Interfaz", "El conjunto de operaciones que una clase ofrece a quien la usa, sin mostrar cómo las implementa.", ""],
  cliente: ["Cliente", "La clase o módulo que usa al patrón. No sabe cómo funciona por dentro.", ""],
  indir: ["Indirección (GRASP)", "Poner un intermediario entre dos elementos para que no se conozcan directamente.", "Adapter y Facade son indirecciones."],
  vp: ["Variaciones Protegidas (GRASP)", "Encapsular un punto de cambio detrás de una interfaz estable, así lo que varía no rompe al resto.", ""],
  fab: ["Fabricación Pura (GRASP)", "Crear una clase artificial, que no existe en el dominio, para mantener alta cohesión y bajo acoplamiento.", ""],
  coh: ["Alta cohesión", "Una clase hace una sola cosa bien y todo lo que contiene está relacionado.", ""],
  poli: ["Polimorfismo (GRASP)", "Varias clases responden al mismo mensaje cada una a su manera; quien llama no pregunta de qué tipo es.", "Reemplaza los if/switch por tipo."],
  oc: ["Abierto/Cerrado", "Se puede agregar comportamiento nuevo sin modificar el código que ya funciona.", ""],
  inst: ["Instanciar", "Crear un objeto concreto a partir de una clase (con new).", ""],
  sub: ["Subsistema", "Grupo de clases que colaboran para una tarea y que el cliente no debería conocer una por una.", ""],
  algo: ["Algoritmo / política", "Una forma concreta de resolver algo, por ejemplo calcular un descuento o un recargo.", ""],
  global: ["Acceso global", "Poder llegar a un objeto desde cualquier parte sin pasarlo por parámetro. Cómodo, pero esconde dependencias.", "Es la crítica más común a Singleton."],
  thread: ["Thread-safe", "Funciona bien aunque varios hilos lo usen a la vez, sin crear dos instancias ni corromper datos.", ""],
  hoja: ["Hoja", "Elemento sin hijos, como un archivo dentro de una carpeta.", ""],
  comp: ["Compuesto", "Elemento que contiene otros elementos, como una carpeta que guarda archivos y más carpetas.", ""],
  rec: ["Recursión", "Una operación que se llama a sí misma sobre los hijos. Así un compuesto delega el trabajo en toda su estructura.", ""],
  adaptee: ["Adaptee", "Componente que ya tiene la funcionalidad que necesitamos, pero con una interfaz distinta a la que espera el cliente. No necesariamente lo diseñamos nosotros.", ""],
  sepint: ["Separación de intereses", "Dividir en módulos o áreas distintas los intereses diferentes, de modo que cada una tenga un propósito cohesivo (separation of concerns).", ""],
  lazy: ["Inicialización perezosa (lazy)", "La instancia se crea la primera vez que se pide, no antes. Requiere control de concurrencia si hay varios hilos.", "La alternativa es la inicialización impaciente (eager)."],
  ctx: ["Objeto de contexto", "El objeto al que se aplica el algoritmo. Guarda su estrategia (visibilidad de atributo) y le delega parte del trabajo.", ""]
};

const pop = document.getElementById("pop");
let anchor = null;

function showPop(b) {
  const g = G[b.dataset.k];
  if (!g || !pop) return;
  anchor = b;
  pop.style.setProperty("--accent", getComputedStyle(b).borderBottomColor);
  pop.innerHTML = `<button class="x" onclick="hidePop()" aria-label="Cerrar">×</button><b>${g[0]}</b>${g[1]}${g[2] ? `<small>${g[2]}</small>` : ""}`;
  pop.hidden = false;
  const r = b.getBoundingClientRect();
  let l = Math.max(8, Math.min(r.left, window.innerWidth - pop.offsetWidth - 8));
  let t = r.bottom + 8;
  if (t + pop.offsetHeight > window.innerHeight - 8) t = Math.max(8, r.top - pop.offsetHeight - 8);
  pop.style.left = l + "px";
  pop.style.top = t + "px";
}

function hidePop() {
  if (pop) pop.hidden = true;
}

document.addEventListener("click", e => {
  const t = e.target.closest(".term");
  if (t) { showPop(t); return; }
  if (!e.target.closest("#pop")) hidePop();
});

document.querySelectorAll(".opt").forEach(btn => {
  btn.addEventListener("click", function() {
    const parent = this.closest(".qq");
    const isCorrect = this.dataset.correct === "true";
    const fbText = this.dataset.fb || (isCorrect ? "¡Correcto!" : "Revisa el concepto en la ficha.");
    parent.querySelectorAll(".opt").forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === "true") b.classList.add("ok");
    });
    if (!isCorrect) this.classList.add("no");
    parent.querySelector(".fb").innerHTML = (isCorrect ? "<b>¡Correcto!</b> " : "<b>Casi.</b> ") + fbText;
  });
});