import { useState, useEffect, useRef } from 'react';
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
import { getTotalMeasurement } from "../Utils/test.js";
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

function AppEnergia() {
  const chartRef = useRef(null);
  const [dataLoaded, setDataLoaded] = useState(null);
  const [error, setError] = useState(null);
  const DB = true;
  const fechaStart = "2024-11-07 00:00:00";
  const min = "2024-10-17T00:00:00Z"
  const max = "2024-11-06T00:00:00Z"

  const dataGraphicTemplate = {
    numVarPhysics: 1,
    namesAxisY: ['Energia (kwh)', 'Corriente (A)', 'Temperatura (°C)'],
    positionAxisY: [0, 1, 1],
    numDataByVarPhysics: [4, 1, 1],
    data: [],
    namesVar: [
      ["Energia M1", "Energia L2", "Energia L3", "Energia Total"],
      ["Corriente L1", "Corriente L2", "Corriente L3"],
      ["Temp 1", "Temp 2", "Temp 3"],
    ],
    type: [1, 0, 0],
    minRangeAxisX: 5,
    opacity: [0.2, 0.2, 0.2],
    zoom: true
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const voltajeData = await getTotalMeasurement("Energia Activa", 1, min, max, 1)
        // const temperaturaData = await getDataDB("Corriente", 1, min, max, 'Medidor')
        // const potenciaActivaData = await getDataDB("Temperatura", 1, min, max, 'Sensor')

        setDataLoaded({
          ...dataGraphicTemplate,
          data: [voltajeData]
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
        data: [
          [[],[],[]],
          [[],[],[]],
          [[],[],[]]
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
        onDoubleClick={() => { chartRef.current ? chartRef.current.resetZoom() : ''}}
        ref={chartRef} 
        data={resultGraphics.data} 
        options={resultGraphics.options}
      />
    </div>
  );
}

export default AppEnergia;