// Cargar datos desde el archivo JSON
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('No se pudo cargar data.json');
    const data = await response.json();
    console.log("Datos cargados:", data); // Verificar que los datos se cargaron
    return data;
  } catch (error) {
    console.error("Error al cargar datos:", error);
    document.getElementById('output').innerText = "Error al cargar data.json";
    return null;
  }
}

// Función para separar nombres simples y compuestos
const separarNombres = (lista) => {
  return {
    simples: lista.filter(nombre => !nombre.includes(" ")),
    compuestos: lista.filter(nombre => nombre.includes(" "))
  };
};

// Configurar el plugin y analizar el texto
async function setupPluginAndAnalyze() {
  const data = await loadData();
  if (!data) return;

// Separar productos en nombres simples y compuestos
const productos = separarNombres(data.Productos);
const comunidades = separarNombres(data.Comunidades);
const provincias = separarNombres(data.Provincias);

console.log("Productos.compuestos", productos.compuestos);
console.log("Comunidades.compuestas", comunidades.compuestos);

  const myPlugin = {
    tags: {
      Producto: { isA: 'Noun' },
      ProductoCompuesto: { isA: 'multi-word' },
      Comunidad: { isA: 'Noun' },
      ComunidadCompuesto: { isA: 'multi-word' },
      Provincia: { isA: 'Noun' },
      ProvinciaCompuesto: { isA: 'multi-word' },
      Provincia: { isA: 'Noun' },
      Anyo: { isA: 'Value' }
    },
    words: {
      ...Object.fromEntries(productos.simples.map(prod => [prod.toLowerCase(), 'Producto'])),
      ...Object.fromEntries(productos.compuestos.map(prod => [prod.toLowerCase(), 'ProductoCompuesto'])),
      ...Object.fromEntries(comunidades.simples.map(com => [com.toLowerCase(), 'Comunidad'])),
      ...Object.fromEntries(comunidades.compuestos.map(com => [com.toLowerCase(), 'ComunidadCompuesto'])),
      ...Object.fromEntries(provincias.simples.map(prov => [prov.toLowerCase(), 'Provincia'])),
      ...Object.fromEntries(provincias.compuestos.map(prov => [prov.toLowerCase(), 'ProvinciaCompuesto'])),
      ...Object.fromEntries(data.Anyos.map(ay => [ay.toString(), 'Anyo'])) 
    }
  };

  try {
    nlp.plugin(myPlugin);
    const input = document.getElementById('input-text').value;
    const doc = nlp(input.toLowerCase());

    

    console.log(doc.debug());

    console.log(doc.match('#Producto').out('array'));

    // Obtener coincidencias
    const resultado = {
      Producto: doc.match('#Producto').out('array'),
      ProductosCompuestos: doc.match('#ProductoCompuesto').out('array'),
      Comunidad: doc.match('#Comunidad').out('array'),
      ComunidadesCompuestas: doc.match('#ComunidadCompuesto').out('array'),
      Provincia: doc.match('#Provincia').out('array'),
      ProvinciasCompuestas: doc.match('#ProvinciaCompuesto').out('array'),
      Anyo: doc.match('#Anyo').out('array')
    };

    console.log("Resultado:", resultado);

    document.getElementById('output').innerText = JSON.stringify(resultado, null, 2);
  } catch (error) {
    console.error("Error al analizar texto:", error);
    document.getElementById('output').innerText = "Error al analizar el texto.";
  }
}

// Elementos del DOM
const inputText = document.getElementById("input-text");
const suggestionsContainer = document.getElementById("suggestions");
let loadedData = null;

// Cargar los datos y almacenarlos en una variable global
loadData().then(data => loadedData = data);

// Función para mostrar sugerencias
function showSuggestions(word) {
  if (!loadedData) return;

  // Filtrar las sugerencias a partir de los datos cargados
  const suggestions = [
    ...loadedData.Productos,
    ...loadedData.Comunidades,
    ...loadedData.Provincias,
    ...loadedData.Anyos
  ].filter(suggestion => suggestion.toLowerCase().startsWith(word.toLowerCase()));

  // Limpiar sugerencias anteriores
  suggestionsContainer.innerHTML = "";

  // Mostrar nuevas sugerencias
  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement("div");
    suggestionElement.classList.add("suggestion");
    suggestionElement.textContent = suggestion;
    suggestionElement.addEventListener("click", () => {
      addSuggestionToInput(suggestion);
    });
    suggestionsContainer.appendChild(suggestionElement);
  });

  // Mostrar el contenedor si hay sugerencias
  suggestionsContainer.style.display = suggestions.length > 0 ? "block" : "none";
}

// Función para agregar la sugerencia al campo de texto
function addSuggestionToInput(suggestion) {
  const currentText = inputText.value;
  const words = currentText.split(" ");
  words.pop(); // Elimina la última palabra que está siendo escrita
  words.push(suggestion); // Agrega la sugerencia
  inputText.value = words.join(" ") + " "; // Añade un espacio al final
  
  // Oculta las sugerencias
  suggestionsContainer.style.display = "none";
}

// Evento al escribir en el campo de texto
inputText.addEventListener("input", () => {
  const currentText = inputText.value;
  const words = currentText.split(" ");
  const currentWord = words[words.length - 1];

  // Mostrar sugerencias solo si hay una palabra en curso
  if (currentWord) {
    showSuggestions(currentWord);
  } else {
    suggestionsContainer.style.display = "none";
  }
});

// Agregar el evento al botón
document.getElementById("analyze-button").addEventListener("click", setupPluginAndAnalyze);
