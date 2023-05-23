import React, { useState } from 'react';
import axios from 'axios';
import settings from '../../settings/settings.json';
import io from 'socket.io-client';
const url = window.location.origin.toString()+'/lobby';
const socket = io.connect(url);

const Lobby = ({uid}) =>{ 
    const [show, setShow] = useState(false);
    // const uid = sessionStorage.getItem('uid');
    let[game, setGame] = useState("golf");
    let[gameSettings, setGameSettings] = useState(settings["golf"]);
    let[gameConfig, setGameConfig] = useState({});
    let[roomname, setRoomname] = useState("");
    let[rooms, setRooms] = useState([]);

    React.useEffect(() => {
        var temp = {};
        for (var key in gameSettings) {
            if (gameSettings.hasOwnProperty(key)) {
                temp[key] = gameSettings[key].default;
                setGameConfig(temp);
            }
        }
        getRooms();
        socket.on('LIST_ROOMS', () =>{
            console.log('Getting rooms...');
            getRooms();
        });
    }, [])

    let selectgame = (e)=> {
        setGame(e.target.value);
        let loadSettings = settings[e.target.value];
        setGameSettings(loadSettings);
        var temp = {};
        for (var key in loadSettings) {
            if (loadSettings.hasOwnProperty(key)) {
                temp[key] = loadSettings[key].default;
                setGameConfig(temp);
            }
        }
    }
    
    let options = [];
    var setconfig = {};
    for (var key in gameSettings) {
        if (gameSettings.hasOwnProperty(key)) {
            var obj = {key: key, option: gameSettings[key].choices, default: gameSettings[key].default}
            options.push(obj);
            setconfig[key] = gameSettings[key].default;
        }
    }
    let changeConfig = (e)=> {
        //console.log(game+": "+e.target.value);
        let bar = e.target.value.toString().indexOf('|');
        let key = e.target.value.substring(0, bar);
        let config = e.target.value.substring(bar+1, e.target.value.toString().length);
        gameConfig[key] = config;
        setGameConfig(gameConfig);
        console.log('CHANGE')
        console.log(gameConfig)
    }

    let createGame = (e) => {
        if(roomname.trim() !== ''){
            axios.post(`/api/game/${game}/create`, {
                uid: uid,
                roomname: roomname.trim(),
                settings: gameConfig
            })
            .then((response) => {
                if(response.status === 200){
                    //console.log(response.data);
                    window.location.href = `game/${response.data.type}/${response.data.rid}`;
                }else{
                    alert('error');
                }
            })
            .catch((error) =>{
                console.log(error);
            }); 
        }else{
            alert('roomname cannot be empty');
        }
        e.preventDefault();
    }

    let getRooms = () =>{
        axios.get(`/api/lobby/rooms`)
        .then((response) => {
            setRooms(response.data);
        })
        .catch((error) =>{
            console.log(error);
        }); 
    }

    let join = (e, type) =>{
        let roomID = e.target.id;
        axios.post(`/api/game/${type}/join/${roomID}`, {uid: uid})
        .then((response) => {
           //console.log(response.data);
           if(response.status === 200){
                window.location.href = `game/${response.data.type}/${response.data.rid}`;
           }
        })
        .catch((error) =>{
          console.log(error.response);
          //window.location.href = "/lobby"
        }); 
    }

    return(
        <div className="mainPage">
            <div className="Login fade-in">
                <form onSubmit={(e) => createGame(e)} style={{maxWidth: '500px'}}>
                    <div className="cardTab">
                        <h2>Create a Game Server</h2>
                        <label>Room Name: </label>
                        <input type="text" placeholder="Enter Room name" name="roomname" style={{marginBottom: '0.5em'}} onChange={(e) => setRoomname(e.target.value)} required/>
                        <br></br>

                        <label>Game:</label>
                        <select className="select-css" style={{marginBottom: '0.5em', marginTop: '0.5em'}} onChange={(e) => selectgame(e)}>
                            <option value="golf">6 Cards Golf</option>
                        </select>

                        <label>Game Settings:</label>
                        <span className="settingsIcon" onClick={() => setShow(true)}>&#9881;</span>
                        
                        <div style={{textAlign: 'center', marginTop: '1em'}}>
                            <button className="btnSmall button greenButton" type="submit">Create</button> 
                        </div>
                    </div>
                </form>
            </div>

            <h3 style={{textAlign: 'center', color: 'white'}}>Current Games</h3>
            <div className="rooms fade-in">
                <br></br>
                <div style={{width: '500px'}}>
                {rooms.length < 1? 
                      <h5 style={{paddingTop: '150px', paddingBottom: '150px', textAlign: 'center', color: 'white'}}>No games at the moment...</h5>
                      :
                      rooms.map((data, index) => 
                          (Object.keys(data.state.players).length < parseInt(data.settings.occupancy) && (data.state.canJoin || data.state.players[uid]))?
                              <div className="list-group-item list-group-item-success" key={index} style={{display: 'flex', flexDirection: 'column'}}>
                                  <span style={{fontWeight: '600', fontSize: '24px'}}>{data.name}</span>
                                  <span>{Object.keys(data.state.players).length}/{data.settings.occupancy} players</span>
                                  <span>Created by: {data.creator.username}</span>
                                  <span>Created at: {new Date(data.date).toLocaleString(window.navigator.language, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                                  <span>Game: {data.type}</span>
                                  <span>Points Limit: {data.settings.scorelimit}</span>
                                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <button id={data.rid} className="btnSmall button greenButton" onClick={(e) => join(e, data.type)}>Join</button>
                                    </div>
                              </div>
                              :
                              <div className="list-group-item list-group-item-danger" key={index} style={{display: 'flex', flexDirection: 'column'}}>
                                  <span style={{fontWeight: '600', fontSize: '24px'}}>{data.name}</span>
                                  <span>{Object.keys(data.state.players).length}/{data.settings.occupancy} players</span>
                                  <span>Created by: {data.creator.username}</span>
                                  <span>Created at: {new Date(data.date).toLocaleString(window.navigator.language, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                                  <span>Game: {data.type}</span>
                                  <span>Points Limit: {data.settings.scorelimit}</span>
                                  {/* <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                     <button id={data.rid} className="btnSmall button redButton" disabled={true}>Join</button>
                                    </div> */}
                              </div>       
                  )}
                </div>
               
            </div>
            <div className="modal" style={{display: show? 'block' : 'none'}}>
                <div className="modal-content">
                    <div style={{marginTop: '0.8em', marginBottom: '3em'}}>
                        <span className="closeButton" onClick={() => setShow(false)}>&times;</span>
                        <h2>Game settings for: {game}</h2>
                        {options.map((data, index) =>
                            <div key={index}>
                                <br></br>
                                <label>{data.key}</label>
                                <select className="select-css" style={{marginBottom: '0.5em', marginTop: '0.5em'}} onChange={(e) => changeConfig(e)}>
                                    {data.option.map((choices, index) =>
                                    (Object.keys(choices)[0] === gameConfig[data.key])?  
                                    <option value={data.key+"|"+Object.keys(choices)[0]} key={index} selected>{choices[Object.keys(choices)[0]]}</option>
                                    :  
                                    <option value={data.key+"|"+Object.keys(choices)[0]} key={index}>{choices[Object.keys(choices)[0]]}</option> 
                                    )}
                                </select>
                            </div>
                        )}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <button className="btnSmall button greenButton" onClick={() => setShow(false)}>Save</button>
                    </div>
                </div>
            </div>
            
        </div>
    )
}
export default Lobby;
