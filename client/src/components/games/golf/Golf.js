import React, { useReducer, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../../App.css'
import Cookies from 'universal-cookie';
import ReactCardFlip from 'react-card-flip';
const url = window.location.origin.toString()+'/game';
const socket = io.connect(url, {transports: ['websocket'], upgrade: false});


const Golf = ({uid}) =>{ 
    let path = window.location.toString();
    //const uid = cookies.get('uid');
    // const uid = sessionStorage.getItem('uid');
    const start = path.lastIndexOf('/');
    const stop = path.length;
    const form_ref = useRef()
    const messagesEndRef = useRef(null)
    let roomID = path.substring(start+1, stop);
    let[players, setPlayers] = useState([]);
    let[state, setState] = useState({});
    let[selected, setSelected] = useState(false);
    let[turn, setTurn] = useState("");
    let[winners, setWinners] = useState("");
    let[message, setMessage] = useState("");
    let[messages, setMessages] = useState([]);
    let[startgame, setStartgame] = useState(false);
    let[time, setTime] = useState(90);
    let[theme, setTheme] = useState("default");
    let[cardSlide, setcardSlide] = useState(false);
    let[canFlip, setCanFlip] = useState(true);
    let[scoreLimit, setScoreLimit] = useState(0);

    const burntRef = useRef()
    const messagesRef = useRef()


    React.useEffect(() => {
        socket.emit('joinGame', `/game/golf/${roomID}`);
        getState();
        socket.on('UPDATE_STATE', (data)=>{
            console.log('calling an api to fetch game data..');
            getState();
            if(data.event === 'USER_REMOVED'){
                if(data.uid === uid){
                    if(data.flag === "TIMEOUT"){
                        alert("you have been removed for taking too long");
                    }
                    window.location.href = "/lobby";
                }
            }
            //animate drawn card
            if(data.event === 'USER_DRAW_CARD' || data.event === 'REMATCH'){
                setcardSlide(true)
            }
            //animate card flip
            if(data.event === 'USER_FLIP_CARD'){
                setCanFlip(true)
            }
            if(data.event === 'USER_SWAP_CARD'){
                setCanFlip(false)
                setcardSlide(false)
            }
            if(data.event === 'USER_BURN_CARD'){
                setcardSlide(false)
            }
        });
        socket.on('PLAYER_TIMEOUT', async (data)=>{
            //alert(data.name+" timed out");
            //remove player from the room and update state if they timedout, set next turn to player after the disconnected one, return info of the next player and send it to reset timer
            try {
                const resp = await axios.post(`/api/game/golf/removePlayer/${roomID}`, {pid: data.id, flag: 'TIMEOUT'});
                if(resp.data.roundover && winners === ''){
                    try {
                        await axios.get(`/api/game/golf/winner/${roomID}`); 
                    }catch(err){
                        console.error(err);
                    }
                }
            } catch (err) {
                // Handle Error Here
                console.error(err.data);
                //window.location.href = "/lobby";
            }
        });
        socket.on('UPDATE_TIMER', (time)=>{
            setTime(time);
        });
    }, [])

    React.useEffect(() => {
        if(messagesRef.current?.length || 0 < messages.length){
            console.log("SCROLLING")
            scrollToBottom()

        }
        messagesRef.current = messages
    }, [messages])

    let getState = async () =>{
        try {
            const resp = await axios.get(`/api/game/golf/state/${roomID}`);
            //console.log(resp.data);
            setPlayers(resp.data.players);
            setState(resp.data);
            setTurn(resp.data.currentTurn);
            setWinners(resp.data.winners);
            setTheme(resp.data.theme)
            setScoreLimit(resp.data.pointLimits)

            // console.log("NEW MSG", resp.data.messages.length)
            // console.log("OLD MSG", messages.length)
            // console.log("MSG REF", messagesRef.current.length)

            if(resp.data.messages.length > messagesRef.current.length){
                console.log("HERE")
                setMessages(resp.data.messages)
            }
            if(Object.keys(resp.data.players).length >= 2){
                setStartgame(true);
            }else{
                setStartgame(false);
            }
            if(resp.data.winners !== ""){
                burntRef.current = null
            }else{
                burntRef.current = resp.data.burntPile[resp.data.burntPile.length-1]
            }
        } catch (err) {
            // Handle Error Here
            console.error(err.data);
            //window.location.href = "/lobby";
        }
    }

    let flipCard = async (index, pid) =>{
        try {
            const resp = await axios.post(`/api/game/golf/flipCard/${roomID}`, {pid: pid, index: index});
            if(resp.data.roundover && winners === ''){
                try {
                    await axios.get(`/api/game/golf/winner/${roomID}`); 
                }catch(err){
                    console.error(err);
                }
            }
            
        }catch(err){
            console.error(err);
        }
        setCanFlip(true)
    }

    let swapCard = async (index, pid) =>{
        try {
            const resp = await axios.post(`/api/game/golf/swapCard/${roomID}`, {pid: pid, index: index});
            if(resp.data.roundover && winners === ''){
                try {
                    await axios.get(`/api/game/golf/winner/${roomID}`);
                }catch(err){
                    console.error(err);
                }
            }
        }catch(err){
            console.error(err);
        }
    }

    let draw = async(pid) =>{
        if(turn === uid && startgame){
            if(players[pid].canDraw){
                try {
                    const resp = await axios.post(`/api/game/golf/drawCard/${roomID}`, {pid: pid});
                    setcardSlide(true)
                }catch(err){
                    console.error(err);
                }
            }
        setSelected(false);
        }
    }

    let burn = async(pid) =>{
        if(turn === uid && startgame){
            if(!players[pid].canDraw && !players[pid].firstRound){
                try {
                    await axios.post(`/api/game/golf/burnCard/${roomID}`, {pid: pid});
                }catch(err){
                    console.error(err);
                }
            }
            setSelected(false);
        }
    }

    let play = async (e, pid) =>{
        //console.log(players[pid].hand[parseInt(e.target.id)]);
        if((pid === turn && turn === uid && startgame)){
            if(players[pid].firstRound){
                flipCard(parseInt(e.target.id), pid);
            }else if(state.endgame){
                //must flip all remaining cards over after any actions
                if(selected && players[pid].canSelect){
                    swapCard(parseInt(e.target.id), pid);
                    setSelected(false);
                }else{
                    flipCard(parseInt(e.target.id), pid);
                }
            }else{
                //can't flip, only swap
                // console.log("SELECTED", selected)
                // console.log("can select", players[pid].canSelect)
    
                if(selected && players[pid].canSelect){
                    swapCard(parseInt(e.target.id), pid);
                }
                setSelected(false);
            }
        }
    }

    let rematch = async (flag) =>{
        try {
            await axios.post(`/api/game/golf/rematch/${roomID}`, {flag: flag});
            burntRef.current = null
        }catch(err){
            console.error(err);
        }
    }

    let leave = async () =>{
        try {
            const resp = await axios.post(`/api/game/golf/removePlayer/${roomID}`, {pid: uid, flag: 'DISCONNECT'});
            if(resp.data.roundover && winners === ''){
                try {
                    await axios.get(`/api/game/golf/winner/${roomID}`); 
                }catch(err){
                    console.error(err);
                }
            }
        }catch(err){
            console.error(err);
        }
    }

    let handleMessage = async (e) => {
        e.preventDefault()
        console.log("NEW MSG", message)
        if(message.trim() !== ""){
            try {
                await axios.post(`/api/game/golf/sendMessage/${roomID}`, {uid: uid, username: players[uid].username, message: message.trim()});
                if(form_ref.current){
                    form_ref.current.reset()
                }
            }catch(err){
                console.error(err);
            }
        }
    }

    let scrollToBottom = () => {
        if(messagesEndRef.current){
            messagesEndRef.current.parentElement.scrollTo({top: messagesEndRef.current.offsetTop, behavior: 'smooth'});
        }
    }

    let secondsToTime = (n) =>{
        const m = Math.floor(n % 3600 / 60).toString().padStart(2,'0'),
              s = Math.floor(n % 60).toString().padStart(2,'0');
        return  m + ':' + s;
    }

    const select = () =>{
        if(players[uid].canSelect){
            setSelected(true)
        }else{
            setSelected(false)
        }
    }

    let renderPlayers = Object.values(players).map((data, index) => 
            <div className={`${(data.uid !== turn || turn !== uid || !startgame) && 'disabled'} player${index+1}`} key={data.uid}>
                <div className="grid">
                    {data.hand.map((card, index) =>
                        (             
                            canFlip?
                                <ReactCardFlip isFlipped={card.flipped} flipDirection="horizontal" key={index}>
                                    <img className="playerCards playingCards" id={index} src={require(`../../../cards/standard52/${theme}/x.png`)} onClick={(e) => play(e, data.uid)}></img>
                                    <img className="playerCards playingCards" id={index} src={require(`../../../cards/standard52/${theme}/${card.picture}.png`)} onClick={(e) => play(e, data.uid)}></img>
                                </ReactCardFlip>
                            :
                            <div key={index}>
                                {card.flipped?
                                    <img className="playerCards playingCards" id={index} src={require(`../../../cards/standard52/${theme}/${card.picture}.png`)} onClick={(e) => play(e, data.uid)}></img>
                                :
                                    <img className="playerCards playingCards" id={index} src={require(`../../../cards/standard52/${theme}/x.png`)} onClick={(e) => play(e, data.uid)}></img>
                                }
                            </div>
                        )
                    )}
                </div>
                <div style={{marginTop: '-20px', display: 'flex', flexDirection: 'row'}}>
                    <div>
                        <img src={data.avatar? data.avatar : require('../../../images/default.png')} width="50" height="50" style={{borderRadius: '2em', objectFit: 'cover'}}></img>
                    </div>
                    <div style={{marginLeft: '15px'}}>
                        <b>{data.username}</b>
                        <br></br>
                        <span>{data.score} points</span>
                        <br></br>
                        <span><b>{data.total}</b> / {scoreLimit} total</span>            
                    </div>
                </div>    
            </div>   
    )

    let renderMessages = messages.map((data, index) => 
        <div className={`chat_container ${(data._id === uid) && 'darker'}`} key={index}>
            {(data._id === 'BOT')?
                <img src={require('../../../images/bot.png')} style={{width: '100%'}} />
                :
                <img src={(data.avatar !== "")? data.avatar : require('../../../images/default.png')} style={{width: '100%'}} className={data._id === uid? "right" : ""}/>
            }
            <span style={{fontWeight: '600', fontSize: '18px', color: data.color}}>{data.from}</span>
            <span style={{display: 'block'}}>{data.text}</span>
            <span className={`time-${(data._id === uid)? 'left' : 'right'}`}>{new Date(data.timestamp).toLocaleTimeString(window.navigator.language, {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    )

    return(
        <div className="mainPage">
            {/* <h1 style={{padding: '0 25px 0 25px'}}>6 Cards Golf </h1> */}
            <div className="row">
                <div className = "column-9" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <span style={{padding: '0 5px 0 5px', color: (time < 5? 'red' : 'white'), fontWeight: 'bold', fontSize: '32px', display: 'block'}}>{secondsToTime(time)}</span>
                    {!startgame && <span style={{padding: '0 5px 0 5px', fontWeight: 500, fontSize: '24px', color: 'white'}}>Waiting for players to join....</span>}
                    {winners ?
                        (state.gameover?
                            <div style={{display: 'flex', flexDirection: 'column', marginBottom: '15px'}}>
                                <span style={{padding: '0 5px 0 5px', fontWeight: 600, fontSize: '24px', color: 'white'}}>{winners} won the game. </span>
                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <div>
                                        <button className="btnSmall button greenButton" onClick={()=>{rematch('GAME')}} style={{marginLeft: '5px'}}>Rematch</button>
                                    </div>
                                    <div>
                                        <button className="btnSmall button redButton" onClick={leave} style={{marginLeft: '5px'}}>Leave Game</button>
                                    </div>
                                </div>
                            </div> 
                            :
                            <div style={{display: 'flex', flexDirection: 'column', marginBottom: '15px'}}>
                                <span style={{padding: '0 5px 0 5px', fontWeight: 600, fontSize: '24px', color: 'white'}}>{winners} won the round. </span>
                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    <div>
                                        <button className="btnSmall button greenButton" onClick={()=>{rematch('ROUND')}} style={{marginLeft: '5px'}}>Next Round</button>
                                    </div>
                                    <div>
                                        <button className="btnSmall button redButton" onClick={leave} style={{marginLeft: '5px'}}>Leave Game</button>
                                    </div>
                                </div>
                               
                            </div>
                        )
                        :
                        <div>
                            <button className="btnSmall button redButton" onClick={leave} style={{marginLeft: '5px'}}>Leave Game</button>
                        </div>
                    }
                    
                </div>
                <div className="column-9" style={{position: 'relative', height: '750px', background: '#004e37', color: 'white'}}>
                    <div className="gameContainer">
                        {renderPlayers}
                        <div className={`center ${(turn !== uid || !startgame) && 'disabled'}`}>
                            {/* {(turn === uid && startgame) &&
                                <span>Cards left: <b>{state.deck.length}</b></span>
                            } */}
                            <span>Cards left: <b>{(state.deck)? state.deck.length : 0}</b></span>
                            <br></br>
                            {/* <span>{JSON.stringify(burntRef.current)}</span> */}
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <img className="playingCards" src={require(`../../../cards/standard52/${theme}/x.png`)} onClick={()=>{draw(uid)}}></img>
                                {(state.burntPile) ?
                                    (state.burntPile.length > 0?
                                        <>  
                                            {burntRef.current &&
                                                <div className="pileStack" style={{position: 'fixed', zIndex: -1}}>
                                                    <img className="playingCards" src={require(`../../../cards/standard52/${theme}/${burntRef.current.picture}.png`)}></img>
                                                </div>
                                            }
                                        {cardSlide? 
                                            <div className="flip-card" style={{zIndex: 3}}>
                                                <div className={`flip-card-inner slideAndflip`} onAnimationEnd={()=>{setcardSlide(false)}}>
                                                    <div className="flip-card-front">
                                                        <img className="playingCards" src={require(`../../../cards/standard52/${theme}/x.png`)}></img>
                                                    </div>
                                                    <div className="flip-card-back">
                                                        <img className="playingCards" src={require(`../../../cards/standard52/${theme}/${state.burntPile[state.burntPile.length-1].picture}.png`)} onClick={select}></img>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div style={{zIndex: 2}}>
                                                <img className={`${selected? 'zoom' : ''} playingCards`} src={require(`../../../cards/standard52/${theme}/${state.burntPile[state.burntPile.length-1].picture}.png`)} onClick={select}></img>
                                            </div>
                                        }
                                        </>
                                        :
                                        <div></div>
                                    )
                                    :
                                    <div></div>
                                }
                            </div>
                            <div style={{textAlign: 'center'}}>
                                <button className="btnSmall button redButton" onClick={()=>{burn(uid)}}>Burn</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="column-3 chat" style={{border: '1px solid black', display: 'flex'}}>
                    <div className="chat_messages" >
                        {renderMessages}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat_input">
                        <form ref={form_ref} style={{width: '100%', paddingRight: '25px'}} onSubmit={handleMessage}>
                            <input type="text" onChange={(e)=> setMessage(e.target.value)} placeholder="Chat Message"/>
                        </form>
                        <div>
                            <button className="btnSmall button greenButton" type="submit" onClick={handleMessage}>Send</button> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Golf;
