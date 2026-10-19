import type { Notebook, NotebookPage, TaskItem, AudioLecture, NotebookSettings } from '../types/notebook';

export const initialSettings: NotebookSettings = {
  soundEnabled: true,
  defaultTexture: 'ruled',
  coverStyle: 'leather',
  dualPageMode: true,
  showGridLines: true,
  penColor: '#2563eb',
  penWidth: 3,
  highlighterColor: '#facc15',
  highlighterWidth: 16,
};

export const samplePages: NotebookPage[] = [
  {
    id: 'page-1',
    pageNumber: 1,
    title: '📘 Bienvenido a Lumina Notebook',
    subject: 'Guía Rápida & Introducción',
    texture: 'ruled',
    handwritingFont: true,
    content: `<h2>✨ Tu Cuaderno Digital Inteligente</h2>
<p>¡Bienvenido a <strong>Lumina Notebook</strong>! Esta herramienta combina la sensación táctil y visual de un cuaderno físico real con el poder de la productividad digital y la inteligencia artificial.</p>
<br/>
<h3>🎯 Características Principales:</h3>
<ul>
  <li><strong>📚 Cuadernos por Materia:</strong> Organiza tus notas en diferentes cuadernos según cada materia académica en tu estantería personal.</li>
  <li><strong>📖 Efecto 3D de Páginas Reales:</strong> Arrastra desde las esquinas con el ratón o desliza en pantallas táctiles con sonido de papel.</li>
  <li><strong>✍️ Escritura Directa con Teclado:</strong> Haz clic en cualquier línea del cuaderno para escribir y editar con formato enriquecido al instante.</li>
  <li><strong>🎙️ Grabador & Transcriptor de Clases:</strong> Graba tus cátedras y obtén resúmenes automáticos con IA en un solo clic.</li>
  <li><strong>📑 Ingesta de Diapositivas & PDFs:</strong> Convierte presentaciones en hojas de estudio estructuradas estilo Cornell.</li>
  <li><strong>🎨 Tinta Digital & Notas Adhesivas:</strong> Dibuja con pluma o resaltador y añade notas post-it en cualquier parte.</li>
</ul>
<br/>
<p><em>👉 Pasa la hoja o abre &quot;Mis Cuadernos&quot; en la barra superior para explorar todos tus cuadernos por materia.</em></p>`,
    drawings: [
      {
        id: 'stroke-1',
        tool: 'highlighter',
        color: '#fef08a',
        width: 18,
        points: [
          { x: 30, y: 75 },
          { x: 180, y: 75 },
          { x: 320, y: 75 },
        ],
      },
    ],
    stickers: [
      {
        id: 'stk-1',
        text: '💡 ¡Tip! Puedes cambiar el tipo de hoja a cuadrícula, puntos o blanco desde la barra superior.',
        color: 'yellow',
        x: 65,
        y: 68,
        rotation: -2,
      },
    ],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'page-2',
    pageNumber: 2,
    title: '🧠 Inteligencia Artificial: Redes Neuronales & Transformers',
    subject: 'Ciencias de la Computación',
    texture: 'grid',
    handwritingFont: false,
    content: `<h2>1. Fundamentos de Arquitectura Transformer</h2>
<p>El mecanismo de <strong>Self-Attention</strong> (auto-atención) permite al modelo sopesar la relevancia de diferentes palabras en una secuencia independientemente de su distancia lineal.</p>
<blockquote>
  <strong>Fórmula de Atención Escalada:</strong><br/>
  <code>Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V</code>
</blockquote>
<h3>📌 Conceptos Clave de la Clase:</h3>
<ul>
  <li><strong>Queries, Keys y Values:</strong> Proyecciones lineales del vector de incrustación de entrada.</li>
  <li><strong>Multi-Head Attention:</strong> Permite atender información conjunta en diferentes posiciones y subespacios de representación.</li>
  <li><strong>Positional Encoding:</strong> Inyecta información del orden sintáctico dado que la atención no es secuencial.</li>
</ul>
<h3>⚡ Preguntas para el Examen:</h3>
<ol>
  <li>¿Por qué se divide por la raíz cuadrada de la dimensión <em>d_k</em>? (Para evitar que el gradiente se sature en softmax con dimensiones altas).</li>
  <li>Diferencia entre decodificador auto-regresivo (GPT) y codificador bidireccional (BERT).</li>
</ol>`,
    drawings: [
      {
        id: 'stroke-ai-1',
        tool: 'highlighter',
        color: '#bbf7d0',
        width: 14,
        points: [
          { x: 40, y: 215 },
          { x: 260, y: 215 },
        ],
      },
    ],
    stickers: [
      {
        id: 'stk-2',
        text: '🔥 Examen el Viernes: Repasar cálculo de matrices de atención.',
        color: 'pink',
        x: 68,
        y: 75,
        rotation: 3,
      },
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'page-3',
    pageNumber: 3,
    title: '📊 Presentación: Ciclo de Krebs & Fosforilación Oxidativa',
    subject: 'Bioquímica Médica',
    texture: 'ruled',
    handwritingFont: false,
    slideTitle: 'Diapositiva #04: Cadena de Transporte de Electrones',
    slideNotes: [
      'Ubicación: Cresta de la membrana interna mitocondrial.',
      'Complejos I, II, III y IV bombean protones H+ hacia el espacio intermembrana.',
      'El gradiente electroquímico impulsa el rotor de la ATP Sintasa (F0-F1).',
      'Rendimiento teórico aproximado: ~30 a 32 ATP por molécula de glucosa oxidada.',
    ],
    content: `<h2>🔬 Notas de la Diapositiva Convertida</h2>
<p>La fosforilación oxidativa acopla la oxidación de coenzimas reducidas (NADH y FADH2) con la síntesis de adenosín trifosfato (ATP).</p>
<blockquote>
  <strong>Fuerza Protón-Motriz:</strong><br/>
  Gradiente electroquímico generado a través de la membrana interna mitocondrial.
</blockquote>
<h3>🎯 Resumen Cornell:</h3>
<ul>
  <li><strong>Aceptor final:</strong> El Oxígeno molecular (O2), formando agua metabólica (H2O).</li>
  <li><strong>Inhibidores clínicos clásicos:</strong> Cianuro y Monóxido de Carbono (bloquean Citocromo c oxidasa / Complejo IV).</li>
  <li><strong>Desacopladores:</strong> Termogenina (grasa parda en recién nacidos para disipar calor).</li>
</ul>`,
    drawings: [],
    stickers: [
      {
        id: 'stk-3',
        text: '🧪 Memoria rápida: Complejo IV = Citocromo c oxidasa!',
        color: 'blue',
        x: 64,
        y: 65,
        rotation: -1,
      },
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'page-4',
    pageNumber: 4,
    title: '📆 Planificación Semanal & Metas de Estudio',
    subject: 'Organización Académica',
    texture: 'dotted',
    handwritingFont: true,
    content: `<h2>🎯 Metas Académicas de la Semana</h2>
<p>Mantener el ritmo constante es clave para el éxito en las evaluaciones continuas.</p>
<blockquote>
  <strong>Bloques de Estudio Prioritarios:</strong>
  <ul>
    <li>◻️ <strong>Lunes & Martes:</strong> Resolver 15 problemas de ecuaciones diferenciales.</li>
    <li>◻️ <strong>Miércoles:</strong> Grabar lección de laboratorio y generar resumen con IA.</li>
    <li>◻️ <strong>Jueves:</strong> Subir diapositivas de historia y crear fichas Cornell.</li>
    <li>◻️ <strong>Viernes:</strong> Simulación de examen práctico y descanso.</li>
  </ul>
</blockquote>
<p><em>&quot;La disciplina supera a la motivación en los días difíciles.&quot;</em></p>`,
    drawings: [],
    stickers: [
      {
        id: 'stk-4',
        text: '⭐ ¡Recordatorio: Beber 2L de agua y descansos Pomodoro de 5 min!',
        color: 'green',
        x: 60,
        y: 72,
        rotation: 2,
      },
    ],
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
  },
];

export const sampleNotebooks: Notebook[] = [
  {
    id: 'nb-comp-sci',
    title: 'Inteligencia Artificial & Algoritmos',
    subject: 'Ciencias de la Computación',
    coverStyle: 'navy',
    defaultTexture: 'grid',
    currentPageIndex: 0,
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    pages: [
      samplePages[0],
      samplePages[1],
      {
        id: 'page-cs-3',
        pageNumber: 3,
        title: '💻 Grafos, Dijkstra y Búsqueda Heurística A*',
        subject: 'Ciencias de la Computación',
        texture: 'grid',
        handwritingFont: false,
        content: `<h2>Algoritmos de Ruta Más Corta</h2>
<p>El algoritmo de <strong>Dijkstra</strong> encuentra el camino más corto desde un nodo origen a todos los demás en grafos ponderados con pesos positivos.</p>
<blockquote>
  <strong>Fórmula de Evaluación Heurística:</strong><br/>
  <code>f(n) = g(n) + h(n)</code> donde <em>g(n)</em> es el coste exacto y <em>h(n)</em> la heurística admisible estimada.
</blockquote>
<h3>📌 Propiedades Clave:</h3>
<ul>
  <li><strong>Admisibilidad:</strong> <code>h(n) &lt;= h*(n)</code> nunca sobreestima el costo real a la meta.</li>
  <li><strong>Consistencia:</strong> <code>h(A) &lt;= c(A,B) + h(B)</code> garantiza optimalidad sin reabrir nodos.</li>
</ul>`,
        drawings: [],
        stickers: [
          {
            id: 'stk-cs-3',
            text: '💡 ¡Importante! Practicar implementación de cola con prioridad (min-heap).',
            color: 'yellow',
            x: 65,
            y: 70,
            rotation: -1,
          },
        ],
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
      },
    ],
  },
  {
    id: 'nb-bio-chem',
    title: 'Bioquímica Clínica & Biología Celular',
    subject: 'Bioquímica Médica',
    coverStyle: 'emerald',
    defaultTexture: 'ruled',
    currentPageIndex: 0,
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 2,
    pages: [
      samplePages[2],
      {
        id: 'page-bio-2',
        pageNumber: 2,
        title: '🧬 Enzimas y Cinética de Michaelis-Menten',
        subject: 'Bioquímica Médica',
        texture: 'ruled',
        handwritingFont: false,
        content: `<h2>Cinética Enzimática & Catálisis</h2>
<p>El modelo de <strong>Michaelis-Menten</strong> describe la velocidad de reacción catalizada por una enzima en función de la concentración del sustrato <code>[S]</code>.</p>
<blockquote>
  <strong>Ecuación de Michaelis-Menten:</strong><br/>
  <code>V0 = (Vmax * [S]) / (Km + [S])</code>
</blockquote>
<h3>📌 Parámetros Fundamentales:</h3>
<ul>
  <li><strong>Km:</strong> Concentración de sustrato a la cual la velocidad es 1/2 Vmax. Refleja afinidad inversa.</li>
  <li><strong>Kcat:</strong> Constante catalítica o número de recambio molecular por unidad de tiempo.</li>
  <li><strong>Inhibición Competitiva:</strong> Aumenta el Km aparente pero no altera la Vmax máxima.</li>
</ul>`,
        drawings: [],
        stickers: [
          {
            id: 'stk-bio-2',
            text: '🧪 En el gráfico de Lineweaver-Burk: corte eje X = -1/Km',
            color: 'blue',
            x: 60,
            y: 65,
            rotation: 2,
          },
        ],
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3,
      },
    ],
  },
  {
    id: 'nb-calc-math',
    title: 'Cálculo Vectorial & Ecuaciones Diferenciales',
    subject: 'Matemáticas',
    coverStyle: 'amber',
    defaultTexture: 'grid',
    currentPageIndex: 0,
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 1,
    pages: [
      {
        id: 'page-math-1',
        pageNumber: 1,
        title: '📐 Integrales de Línea & Teorema de Green',
        subject: 'Matemáticas',
        texture: 'grid',
        handwritingFont: false,
        content: `<h2>Teorema Fundamental del Cálculo Multivariable</h2>
<p>El <strong>Teorema de Green</strong> relaciona una integral de línea sobre una curva cerrada simple <em>C</em> con una integral doble sobre la región plana <em>D</em> acotada.</p>
<blockquote>
  <strong>Enunciado:</strong><br/>
  <code>∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA</code>
</blockquote>
<h3>📌 Condiciones de Aplicabilidad:</h3>
<ul>
  <li>La curva <em>C</em> debe estar positivamente orientada (sentido antihorario).</li>
  <li>Las funciones <em>P(x,y)</em> y <em>Q(x,y)</em> tienen derivadas parciales continuas en una región abierta que contiene a <em>D</em>.</li>
</ul>`,
        drawings: [],
        stickers: [
          {
            id: 'stk-math-1',
            text: '⚡ Si ∂Q/∂x = ∂P/∂y, el campo vectorial es conservativo y la integral es cero.',
            color: 'pink',
            x: 62,
            y: 68,
            rotation: -1,
          },
        ],
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 86400000 * 4,
      },
      {
        id: 'page-math-2',
        pageNumber: 2,
        title: '📊 Transformada de Laplace para EDOs',
        subject: 'Matemáticas',
        texture: 'grid',
        handwritingFont: false,
        content: `<h2>Resolución de Ecuaciones Diferenciales</h2>
<p>La <strong>Transformada de Laplace</strong> convierte ecuaciones diferenciales con condiciones iniciales en ecuaciones algebraicas fáciles de resolver.</p>
<blockquote>
  <strong>Definición:</strong><br/>
  <code>L{f(t)} = F(s) = ∫[0 a ∞] e^(-st) * f(t) dt</code>
</blockquote>
<h3>📌 Pares de Transformada Clave:</h3>
<ul>
  <li><code>L{1} = 1/s</code></li>
  <li><code>L{e^(at)} = 1 / (s - a)</code></li>
  <li><code>L{sin(wt)} = w / (s^2 + w^2)</code></li>
  <li><code>L{cos(wt)} = s / (s^2 + w^2)</code></li>
</ul>`,
        drawings: [],
        stickers: [],
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 3,
      },
    ],
  },
  {
    id: 'nb-general-agenda',
    title: 'Agenda & Métodos de Estudio',
    subject: 'General',
    coverStyle: 'leather',
    defaultTexture: 'dotted',
    currentPageIndex: 0,
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 1,
    pages: [samplePages[3]],
  },
];

export const sampleTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Entrega de Práctica 3: Multi-Head Attention',
    description: 'Implementar la clase TransformerEncoderLayer en Python con PyTorch y verificar matrices.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '23:59',
    category: 'Ciencias de la Computación',
    priority: 'high',
    status: 'in_progress',
    linkedPageId: 'page-2',
    checklist: [
      { id: 'chk-1', text: 'Descargar dataset de entrenamiento', done: true },
      { id: 'chk-2', text: 'Programar scaled dot-product attention', done: true },
      { id: 'chk-3', text: 'Redactar conclusiones y curvas de pérdida', done: false }
    ],
    createdAt: Date.now() - 86400000
  },
  {
    id: 'task-2',
    title: 'Repasar Ciclo de Krebs & Inhibidores de Cadena',
    description: 'Estudiar fichas de resumen y diagramas de la página 3 del cuaderno.',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    dueTime: '16:00',
    category: 'Bioquímica Médica',
    priority: 'medium',
    status: 'todo',
    linkedPageId: 'page-3',
    checklist: [
      { id: 'chk-4', text: 'Aprender enzimas reguladoras alostéricas', done: false },
      { id: 'chk-5', text: 'Hacer mapa mental del espacio intermembrana', done: false }
    ],
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'task-3',
    title: 'Lectura Capítulo 5: Revolución Industrial y Efectos',
    description: 'Leer páginas 112 a 145 y subrayar eventos cronológicos principales.',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    category: 'Historia',
    priority: 'low',
    status: 'todo',
    checklist: [
      { id: 'chk-6', text: 'Lectura rápida de títulos y subtítulos', done: true },
      { id: 'chk-7', text: 'Subrayado activo y glosario de términos', done: false }
    ],
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'task-4',
    title: 'Configurar entorno de Lumina Notebook en móvil',
    description: 'Sincronizar apuntes y probar gestos táctiles de paso de página en la tableta.',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    category: 'General',
    priority: 'high',
    status: 'completed',
    linkedPageId: 'page-1',
    checklist: [
      { id: 'chk-8', text: 'Instalar aplicación o abrir en navegador móvil', done: true },
      { id: 'chk-9', text: 'Activar sonido de paso de página', done: true }
    ],
    createdAt: Date.now() - 86400000 * 4
  }
];

export const sampleLectures: AudioLecture[] = [
  {
    id: 'lec-1',
    title: 'Clase Grabada: Arquitectura de Redes Neuronales & Transformers',
    date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('es-ES', { dateStyle: 'medium' }),
    duration: 324, // 5m 24s
    transcript: 'Bienvenidos a todos a la clase de hoy. Vamos a enfocarnos en los mecanismos de atención. Recuerden que a diferencia de las redes recurrentes tradicionales, la auto-atención calcula la similitud entre cada token y todos los demás tokens en paralelo. Esto permite un entrenamiento masivo en GPUs. Para el viernes, es obligatorio que entreguen la práctica 3 con la implementación de Multi-Head Attention.',
    summary: 'La sesión abordó las limitaciones computacionales de las RNNs secuenciales y cómo el mecanismo de auto-atención permite paralelización masiva en hardware acelerador. Se explicó detalladamente la matriz Q-K-V y la normalización por la raíz de d_k.',
    keyPoints: [
      'Eliminación de la recurrencia para permitir paralelismo completo.',
      'Cálculo simultáneo de dependencias a larga distancia sin decaimiento de gradiente.',
      'Importancia de la constante de escala para evitar saturación de Softmax.'
    ],
    actionItems: [
      'Completar práctica 3 antes del viernes a las 23:59.',
      'Revisar el repositorio de PyTorch con ejemplos de clase.'
    ],
    linkedPageId: 'page-2'
  }
];
