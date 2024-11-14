import AppGraphics from "./Components/Graphic"
import AppEnergia from "./Components/GraphicEnergia"

function App() {

  return (
    <>
      <div className="grid grid-cols-1 w-[80%]">
        <AppEnergia/>
        <AppGraphics/>
      </div>
    </>
  )
}

export default App
