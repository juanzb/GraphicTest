// "Corriente",
// "Energia Activa",
// "Factor de Potencia",
// "Potencia Activa",
// "circuito"
// "Compuestos Organicos Volatiles",
// "Concentración de CO2",
// "Humedad Relativa",
// "Lumenes",
// "Presencia"

async function getDataDB(nameData, numberdata, timeMin, timeMax, type) {
  let queryDB = ''
  let totalToAddResult = [];
  let result = [];

  if(type == 'Medidor'){ // -----------Cosulta a medidor
    queryDB = `SELECT
    "${nameData}"
    FROM edificio WHERE "nombre"='${type} ${numberdata}' AND time > '${timeMin}' + 5h AND time < '${timeMax}' + 5h GROUP BY "circuito"`
  } else if (type == 'Sensor') { // ------------------Cosulta a sensores
    queryDB = `SELECT 
    "${nameData}"
    FROM edificio WHERE "nombre"='${type} ${numberdata}' AND time > '${timeMin}' + 5h AND time < '${timeMax}' + 5h`
  }


  const response = fetch('http://74.208.139.232:1880/greenyellow', {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: queryDB
    }
  )
  let dataGet = await response
  .then(r => r.json())
  .then(res => {
    if(type == 'Medidor') {
      res.map(e => {
        if(e.circuito != "Total") {
          result[e.circuito-1] = !result[e.circuito-1] ? [] : result[e.circuito-1]
          result[e.circuito-1].push({x:e.time,y:e[`${nameData}`] || 0})
        } else if (e.circuito == "Total") {
          totalToAddResult.push({x:e.time,y:e[`${nameData}`]})
        }
      })
      result[result.length] = totalToAddResult

    } else if (type == 'Sensor'){
      res.forEach((e) => {
        result[0] = !result[0] ? [] : result[0]
        result[0].push({x:e.time, y:e[`${nameData}`] || 0})
      })
    }
    return result
  })
  .catch(error => console.error('Error:', error))
  return dataGet
}

async function getTotalMeasurement(nameData, numberdata, timeMin, timeMax, numberOfDays) {
  let queryDB = ''
  let result = [];
  let totalToAddResult = [];


  queryDB =`SELECT LAST("${nameData}") - FIRST("${nameData}") AS "consumo" FROM edificio WHERE "nombre"='Medidor ${numberdata}' AND time > '${timeMin}' AND time < '${timeMax}' GROUP BY time(24h), "circuito"`

  let response = await fetch( "http://74.208.139.232:1880/greenyellow", {
  method: 'POST',
  headers: {'Content-Type': 'text/plain'},
  body: queryDB,
  })
  .then(r => r.json())
  .then(res => {
    res.map(e => {
      // console.log(numberOfDays)
      if(e.circuito != 'Total') {
        result[e.circuito - 1] = !result[e.circuito-1] ? [] : result[e.circuito-1]
        result[e.circuito - 1].push({x: e.time, y:e.consumo})
      } else { 
        totalToAddResult.push({x: e.time, y:e.consumo})
      }
    })
    result[result.length] = totalToAddResult
    return result
  })
  .catch(error => console.error('Error:', error))

  return response
}

export { getDataDB, getTotalMeasurement }