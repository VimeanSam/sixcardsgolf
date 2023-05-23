import React, { useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import '../../App.css'

const Test = () =>{ 
    let[flipped, setFlipped] = useState(false);
    return(
        <div className="mainPage">
            <h1>Golf</h1>
            <div className="row">
               
                    <div className="column-8" style={{border: '1px solid black', position: 'relative', height: '750px', background: 'green', color: 'white'}}>

                        <div className="gameContainer" style={{padding: '45px'}}>
                            <div className="player1">
                                <div style={{textAlign: 'center'}}>
                                    <img src={"https://a.espncdn.com/i/headshots/nba/players/full/3032977.png"} width="50vw" height="50vh" style={{borderRadius: '2em'}}></img>
                                </div>
                                <div className="grid">
                                    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
                                        <img className="playerCards" src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh" onClick={()=>{setFlipped(true)}}></img>
                                        <img className="playerCards" src={require(`../../cards/standard52/default/$J.png`)} width="45vw" height="65vh"></img>
                                    </ReactCardFlip>
                                    
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                </div>
                                <div style={{maxWidth: '85px', marginTop: '-20px'}}>
                                    <b>Giannis Antetokounmpo</b>
                                    <br></br>
                                    <span>0 points</span>
                                    <br></br>
                                    <span>0 total</span>
                                </div>
                                
                            </div>
                            <div className="player2">
                                <div style={{textAlign: 'center'}}>
                                    <img src={"https://a2.espncdn.com/combiner/i?img=%2Fphoto%2F2020%2F0210%2Fr664160_1296x729_16%2D9.jpg"} width="50vw" height="50vh" style={{borderRadius: '2em'}}></img>
                                </div>
                                <div className="grid">
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                </div>
                                <div style={{maxWidth: '85px', marginTop: '-20px'}}>
                                    <b>Giannis Antetokounmpo</b>
                                    <br></br>
                                    <span>0 points</span>
                                    <br></br>
                                    <span>0 total</span> 
                                </div>
                            </div>
                            
                            <div className="player3">
                                <div style={{textAlign: 'center'}}>
                                    <img src={"https://a.espncdn.com/i/headshots/nba/players/full/3032977.png"} width="50vw" height="50vh" style={{borderRadius: '2em'}}></img>
                                </div>
                                <div className="grid">
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                </div>
                                <div style={{maxWidth: '85px', marginTop: '-20px'}}>
                                    <b>Giannis Antetokounmpo</b>
                                    <br></br>
                                    <span>0 points</span>
                                    <br></br>
                                    <span>0 total</span> 
                                </div>
                            </div>
                            <div className="player4">
                                <div style={{textAlign: 'center'}}>
                                    <img src={"https://a.espncdn.com/i/headshots/nba/players/full/3032977.png"} width="50vw" height="50vh" style={{borderRadius: '2em'}}></img>
                                </div>
                                <div className="grid">
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                    <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                </div>
                                <div style={{maxWidth: '85px', marginTop: '-20px'}}>
                                    <b>Giannis Antetokounmpo</b>
                                    <br></br>
                                    <span>0 points</span>
                                    <br></br>
                                    <span>0 total</span> 
                                </div>
                                
                            </div>
                            <div className="center">
                                <img src={require(`../../cards/standard52/default/x.png`)} width="45vw" height="65vh"></img>
                                <img src={require(`../../cards/standard52/default/mystery.png`)}  width="45vw" height="65vh"></img>
                                <div style={{textAlign: 'center'}}>
                                    <button className="btnSmall button redButton" >Burn</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column-3 chat" style={{border: '1px solid black'}}>
                        chat
                    </div>
            </div>
        </div>
    )
}
export default Test;
