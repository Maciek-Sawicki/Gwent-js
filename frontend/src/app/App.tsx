import './App.css'
import {Board} from '../game/Board'

import c11 from '../assets/cards/card_1_1.png'
import c12 from '../assets/cards/card_1_2.png'
import c13 from '../assets/cards/card_1_3.png'
import c14 from '../assets/cards/card_1_4.png'
import c21 from '../assets/cards/card_2_1.png'
import c22 from '../assets/cards/card_2_2.png'
function App() {
  const hand = [c11,c12,c13,c14,c21,c22]

  return (
    <main className="app">
      <Board/>
      <section className="hand">
        {hand.map((src, i) => (
          <img key={i} src={src} alt={'card-${i + 1}'} className="hand-card"/>
        ))}
      </section>
    </main>
  )
}

export default App
