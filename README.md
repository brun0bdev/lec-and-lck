# lec-and-lck

Proyección de Victorias para LEC y LCK

Esta aplicación web permite simular y proyectar la clasificación final de las ligas LEC y LCK de League of Legends, calculando posibles escenarios según los resultados de los partidos restantes.

## Características
- Visualización de la clasificación actual y partidos pendientes.
- Simulación interactiva de resultados de partidos.
- Proyección automática de la tabla final y gráfico de victorias.
- Soporte para LEC y LCK (cambio de liga con un switch).
- Exportación de datos a CSV.
- Interfaz bilingüe: Español/Inglés.

## Tecnologías utilizadas
- HTML, CSS y JavaScript (ES Modules)
- [Chart.js](https://www.chartjs.org/) para gráficos
- LocalStorage para escenarios

## Uso
1. Abre `index.html` en tu navegador.
2. Selecciona la liga (LEC/LCK) y el idioma.
3. Visualiza la clasificación y los partidos pendientes.
4. Haz clic en los equipos para simular el resultado de los partidos.
5. Pulsa "Calcular Proyección" para ver la tabla final y el gráfico.
6. Puedes exportar los datos a CSV o guardar/cargar escenarios personalizados.

## Estructura del proyecto
- `index.html`: Página principal.
- `styles.css`: Estilos modernos y responsivos.
- `main.js`: Inicialización y control de eventos.
- `logic.js`: Lógica de simulación y gestión de estado.
- `ui.js`: Renderizado dinámico de tablas, partidos y gráficos.
- `data.js`: Datos de equipos, partidos y traducciones.
- `utils.js`: Utilidades varias.

## Créditos
- Desarrollado por [BrunoB](https://www.brunob.dev/).