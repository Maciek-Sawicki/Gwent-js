import './Board.css'
import boardImg from '../assets/board/board.jpeg'

export function Board(){
    return(
        <section className="board" style={{backgroundImage: `url(${boardImg})`}}>
            <div className="enemy-half"/>
            <div className="player-half">
                <div className="player-row row-1" data-row="mele"/>
                <div className="player-row row-2" data-row="ranged"/>
                <div className="player-row row-3" data-row="siege"/>
            </div>
        </section>
    )
}