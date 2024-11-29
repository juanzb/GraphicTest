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
  const DB = true;
  const fechaStart = "2024-11-07 00:00:00";
  const min = "2024-11-01T00:00:00Z"
  const max = "2024-11-05T01:00:00Z"

  const dataGraphicTemplate = {
    title: false,
    numVarPhysics: 3,
    namesAxisY: ['Voltaje (v)', 'Corriente (A)', 'Temperatura (°C)'],
    positionAxisY: [0, 1, 1],
    numDataByVarPhysics: [1, 1, 1],
    data: [],
    namesVar: [
      ["Voltaje L1", "Voltaje L2", "Voltaje L3"],
      ["Corriente L1", "Corriente L2", "Corriente L3"],
      ["Temp 1", "Temp 2", "Temp 3"],
    ],
    type: [0, 0, 0],
    minRangeAxisX: 5,
    opacity: [0.2, 0.2, 0.2],
    zoom: true
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
