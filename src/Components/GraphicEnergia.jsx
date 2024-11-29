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
import { totalAccumulatedEnergy } from "../Utils/InfluxDB.js";
import chartGenerator from '../Utils/chartGenerator.js'

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
  const min = "2024-10-25T00:00:00Z"
  const max = "2024-11-06T00:00:00Z"

  const dataGraphicTemplate = {
    title: false,
    numVarPhysics: 1,
    namesAxisY: ['Energia (kwh)', 'Corriente (A)', 'Temperatura (°C)'],
    positionAxisY: [0],
    numDataByVarPhysics: [4],
    data: [],
    namesVar: [
      ["L1", "L2", "L3", "Total"]
    ],
    type: [1],
    minRangeAxisX: 60,
    opacity: [0.2],
    zoom: true
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const energyData = await totalAccumulatedEnergy("Energia Activa", 1, min, max)
        setDataLoaded({
          ...dataGraphicTemplate,
          data: [energyData]
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
          [[1,2,3],[2,4,3],[1,8,6],[1,12,6]],
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