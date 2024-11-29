/*---------------------------MODELO PARA PROBAR LA GRFICA-----------------------
  const dataGraphic = {
  // cuantas variables fisicas a comparar,  1 = no comparativa; mayot a 1 = comparativa
  numVarPhysics: 3,
  // nombre de cada uno de los ejes Y para las variables fisicas a comparar
  namesAxisY: ['Variable 1', 'Variable 2', 'Variable 3'],
  // 0 = left; 1 = right, posicion de los ejes
  positionAxisY: [0,1,1],
  // datos correspondientes a las graficas de cada variable fisica
  numDataByVarPhysics: [3,2,1],
  // datos correspondientes a las graficas de cada variable fisica
  data: [
    [[5,2,3], [12,13,10], [15,23,17]],      // var 1
    [[78,66,77], [88,78,99]],               // var 2
    [[56, 65, 89]],                         // var 3
  ],
  // nombres para las graficas de cada variable fisica
  namesVar: [
    ["Var 1.1", "Var 1.2","Var 1.3"],
    ["Var 2.1", "Var 2.2"],
    ["Var 3.1"],
  ],
  // 0 = linea; 1 = barra, tipo de grafica por variable fisica
  type: [0, 1, 1],
  // intervalo de tiempo en "MINUTOS" en que se dan los valores de la grafica
  minRangeAxisX: 5,
  // opacidad del fondo de la grafica
  opacity: [0.2, 0.6, 0.6]
}
// recibes informacion de base de datos ???? si = true, no = false
const DB = false
// fecha de donde inicia la grafica
const fechaStart = "2024-11-07 00:00:00"

const resultGraphics = genGraphic(dataGraphic, fechaStart, DB)

function AppLM() {
  return <>
    <Chart
      data={resultGraphics.data}
      options={resultGraphics.options}
    />
  </>
}
------------------------------------------------------------------------------*/

function chartGenerator(dataGraphic, fechaStart, DB) {
  if (!dataGraphic || !fechaStart) {
    throw new Error("Parámetros inválidos: 'dataGraphic' o 'fechaStart' están ausentes.");
  }

  const dataVars = [];
  const valuesVars = [];
  const datasetGraphic = [];
  const scalesGraphic = {};
  let timeStampOrder = [];
  let timeStampOrderJoin = [];
  const dateTimeStart = Math.floor(new Date(fechaStart).getTime());
  const colors = [
    [255, 87, 34], 
    [255, 193, 7], 
    [0, 188, 212], 
    [76, 175, 80],
    [156, 39, 176], 
    [233, 30, 99], 
    [63, 81, 181], 
    [255, 152, 0],
    [0, 150, 136], 
    [244, 67, 54]
  ];

  // Validación de dataGraphic.numVarPhysics
  const numVarPhysics = dataGraphic.numVarPhysics || 0;
  if (!Array.isArray(dataGraphic.data) || numVarPhysics !== dataGraphic.data.length) {
    throw new Error("El número de variables físicas y los datos no coinciden.");
  }

  // Generación de dataVars según DB
  for (let index = 0; index < numVarPhysics; index++) {
    dataVars[index] = [];
    for (let idx = 0; idx < dataGraphic.numDataByVarPhysics[index]; idx++) {
      dataVars[index][idx] = [];

      if (DB) {
        // Caso: Datos provenientes de base de datos
        const dataEntries = dataGraphic.data[index]?.[idx] || [];
        dataVars[index][idx] = dataEntries.map((e) => ({
          x: new Date(e.x).getTime(),
          y: e.y,
        }));
      } else {
        // Caso: Datos generados localmente
        const localData = dataGraphic.data[index]?.[idx] || [];
        const oneMin = 60000; // 1min expresado en timestampt en milisegundos equivale a 60000ms
        const minOneDay = 1440; // cantidad de minutos que tiene un dia
        localData.forEach((value, i) => {
          dataVars[index][idx].push({
            x: dataGraphic.minRangeAxisX >= minOneDay
              ? dateTimeStart + (i * oneMin * dataGraphic.minRangeAxisX)
              : dateTimeStart + ((i + 1) * oneMin * dataGraphic.minRangeAxisX),
            y: value,
          });
        });
      }
    }
  }

  // Ordenar y unir timestamps
  for (let index = 0; index < numVarPhysics; index++) {
    timeStampOrder[index] = [];
    for (let i = 0; i < dataGraphic.numDataByVarPhysics[index]; i++) {
      timeStampOrder[index] = timeStampOrder[index].concat(
        dataVars[index][i].map((e) => e.x)
      );
    }
    timeStampOrderJoin = timeStampOrderJoin.concat(timeStampOrder[index]).sort((a, b) => a - b);
  }

  // Eliminar duplicados y generar etiquetas para el eje X
  const datesOrder = [...new Set(timeStampOrderJoin)];
  const labelsGraphic = datesOrder.map((timestamp) => {
    const date = new Date(timestamp);
    const firstDate = new Date(datesOrder[0]).toLocaleDateString();
    const lastDate = new Date(datesOrder[datesOrder.length - 1]).toLocaleDateString();

    return firstDate === lastDate
      ? `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
      : `${date.toLocaleDateString()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  });

  // Generar valores para el eje Y
  for (let index = 0; index < numVarPhysics; index++) {
    valuesVars[index] = [];
    for (let idx = 0; idx < dataGraphic.numDataByVarPhysics[index]; idx++) {
      valuesVars[index][idx] = [];
      datesOrder.forEach((timestamp, i) => {
        const dataFound = dataVars[index][idx].find((entry) => entry.x === timestamp);
        valuesVars[index][idx][i] = dataFound ? dataFound.y : null;
      });
    }
  }

  // Generar datasets y escalas para cada variable física
  let cont = 0;
  for (let index = 0; index < numVarPhysics; index++) {
    const axisPosition = ['left', 'right'];
    const chartTypes = ['line', 'bar'];
    const idAxisY = `y${index}`;
    scalesGraphic[idAxisY] = {
      type: 'linear',
      position: axisPosition[dataGraphic.positionAxisY[index]] || 'left',
      title: {
        display: true,
        text: dataGraphic.namesAxisY[index] || `Eje ${index + 1}`,
      },
      grid: {
        display: true,
        drawOnChartArea: false,
      },
    };

    for (let idx = 0; idx < dataGraphic.numDataByVarPhysics[index]; idx++) {
      const color = colors[cont % colors.length]; // Evitar desbordamiento de colores
      datasetGraphic.push({
        type: chartTypes[dataGraphic.type[index]] || 'line',
        data: valuesVars[index][idx],
        label: dataGraphic.namesVar[index]?.[idx] || `Variable ${index + 1}.${idx + 1}`,
        borderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${dataGraphic.opacity[index] || 0.5})`,
        borderWidth: 1,
        fill: true,
        spanGaps: true,
        showLine: true,
        pointRadius: 2,
        pointHoverBackgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        yAxisID: idAxisY,
      });
      cont++;
    }
  }

  // Configuración final del gráfico
  const options = {
    interaction: { mode: 'index', intersect: false },
    scales: scalesGraphic,
    decimation: { enabled: true, samples: 12 },
    animations: {
      tension: {
        duration: 500,
        easing: 'linear',
        from: 0,
        to: 0,
        loop: false,
      },
    },
    plugins: {
      legend: {
        display: true,
        title: {
          display: Boolean(dataGraphic.title),
          text: dataGraphic.title || '',
          font: { size: 15 },
        },
      },
      tooltip: { enabled: true },
      responsive: true,
      zoom: {
        pan: {
          enabled: dataGraphic.zoom || false,
          mode: 'xy',
          modifierKey: 'ctrl',
        },
        zoom: {
          drag: { enabled: dataGraphic.zoom || false },
          mode: 'x',
        },
      },
    },
  };

  const data = {
    labels: labelsGraphic,
    datasets: datasetGraphic,
  };

  return { options, data };
}

export default chartGenerator;
