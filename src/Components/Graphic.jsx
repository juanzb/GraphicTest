import { useState, useEffect, useRef} from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
  LineController,
  Title,
  BarController,
  TimeScale,
  Decimation,
  scales,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { getDataDB } from "../Utils/InfluxDB.js";
import chartGenerator from "../Utils/chartGenerator.js";


ChartJS.register(
  LinearScale,
  Decimation,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Legend,
  Tooltip,
  LineController,
  BarController,
  TimeScale,
  zoomPlugin,
  scales,
)


function AppGraphics() {                          
  const chartRef = useRef(null);                  
  const [dataLoaded, setDataLoaded] = useState(null);
  const [error, setError] = useState(null);       
  const DB = true;                                // habilitar funcionamineto con base de datos
  const fechaStart = "2024-11-07 00:00:00";       // fecha de inicio de eje x de la grafica
  const min = "2024-11-01T00:00:00Z"              // tiempo minimo para la consulta a base de datos
  const max = "2024-11-05T01:00:00Z"              // tiempo maximo para consultar a base de datos

  const dataGraphicTemplate = {
    title: false,                                 // nombre del titulo o false
    numVarPhysics: 3,                             // numero de variables principales a mostrar
    namesAxisY: ['var 1', 'var 2', 'var 3'],      // nombres asigandos a cada variable principal
    positionAxisY: [0, 1, 1],                     // pisition del eje vertical para la variable principal
    numDataByVarPhysics: [3, 1, 1],               // numero de SUBvariables por cada variable principal
    data: [                                       // valores a mostar en la grafica por cada SUBvariable por defecto vacio
      // [[],[],[],...[]n], valores pora configucaion la variables en este ejemplo
      // [[],[],[],...[]n], valores pora configucaion la variables en este ejemplo
      // [[],[],[],...[]n] valores pora configucaion la variables en este ejemplo
    ],                                            
    namesVar: [                                   // nombres a mostar en la grafica por cada SUBvariable
      ["var 1.1", "var 1.2", "var 1.3"],          // nombres para cada SUBvariable de cada variable principal
      ["var 2.1", "var 2.2", "var 2.3"],          // nombres para cada SUBvariable de cada variable principal
      ["var 3.1", "var 3.2", "var 3.3"],          // nombres para cada SUBvariable de cada variable principal
    ],                                            // 
    type: [0, 0, 0],                              // tipo de grafica: 0:lineal, 1: barra
    minRangeAxisX: 5,                             // rango de resolucion del eje X
    opacity: [0.2, 0.2, 0.2],                     // opacidad aplicada a variables princiales
    zoom: true                                    // habilitar el zoom en la grafica
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const voltajeData = await getDataDB("Voltaje", 1, min, max, 'Medidor', dataGraphicTemplate.numDataByVarPhysics[0])
        const temperaturaData = await getDataDB("Corriente", 1, min, max, 'Medidor',dataGraphicTemplate.numDataByVarPhysics[1])
        const potenciaActivaData = await getDataDB("Temperatura", 1, min, max, 'Sensor',dataGraphicTemplate.numDataByVarPhysics[2])

        setDataLoaded({
          ...dataGraphicTemplate,
          data: [voltajeData, temperaturaData, potenciaActivaData]
        });

      } catch (error) {
        console.error("Error al obtener datos de la base de datos:", error);
        setError(true)
      }
    }

    if (DB) {
      fetchData();
    } else {
      setDataLoaded({
        ...dataGraphicTemplate,
        data : [
          [
            [19, 33, 12, 4, 15, 28, 35, 21, 27, 14, 22, 31, 18, 16, 30, 24, 29, 20, 17, 25],
            [20, 25, 35, 13, 14, 27, 22, 18, 21, 28, 30, 19, 17, 26, 31, 23, 29, 15, 20, 24],
            [50, 45, 90, 17, 32, 28, 35, 40, 38, 42, 31, 36, 34, 30, 41, 29, 33, 27, 37, 39],
          ],
          [
            [22, 25, 23, 24, 26, 27, 25, 23, 24, 28, 26, 25, 27, 26, 24, 23, 25, 27, 24, 26],
            [23, 24, 25, 23, 27, 28, 26, 24, 25, 29, 27, 28, 24, 26, 27, 25, 28, 23, 26, 27],
            [25, 27, 26, 28, 26, 25, 27, 26, 29, 28, 25, 26, 27, 29, 28, 25, 27, 26, 28, 29],
          ],
          [
            [5, 7, 6, 5, 6, 7, 6, 5, 8, 6, 7, 5, 6, 8, 7, 6, 5, 6, 7, 5],
            [7, 6, 8, 7, 5, 6, 7, 6, 8, 7, 6, 8, 5, 6, 7, 8, 6, 5, 7, 6],
            [6, 5, 7, 6, 8, 5, 6, 7, 8, 6, 5, 7, 6, 8, 7, 5, 6, 7, 6, 8],
          ]
      ]
      
      });
    }
  }, [DB]);

  if (!dataLoaded) {
    return <div>Cargando...</div>;
  }

  if (error) {
    console.log('Error DB')
  }

  const resultGraphics = chartGenerator(dataLoaded, fechaStart, DB);

  return (
    <div className="w-full">
      <Chart 
        onDoubleClick={() => { chartRef.current ?  chartRef.current.resetZoom() : '' }}
        ref={chartRef} 
        data={resultGraphics.data} 
        options={resultGraphics.options} 
      />
    </div>
  );
}

export default AppGraphics;
