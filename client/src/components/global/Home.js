import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {ListGroup} from "react-bootstrap";

const Home = ({uid, username}) =>{ 
    let[ranks, setRanks] = useState([]);

    let getRanks = async () =>{
        try {
            const res = await axios.get(`/api/game/golf/ranks`);
            console.log("DATA", res.data)
            setRanks(res.data)
        }catch(err){
            console.error(err);
        }
    }

    React.useEffect(() => {
        getRanks();
    }, [])

    return(
        <>   
        <div className='row'>
          <div className='column-6'>
            <div className="bg hero" style={{backgroundImage: `linear-gradient(to left, rgba(6, 7, 7, 0.2), #153e2f), url(${require('../../images/cardStocks.jpg')})`}}>
              <div style={{padding: '25px', marginTop: '15px', color: 'white'}}>
                {/* <h1 id="greetings">Home</h1> 
                {uid? <p></p> : <p>Please <a href="/login">Log in</a> to access game rooms <a href="/signup">Sign Up</a> to create an account</p>} */}
                <div className="hero-content fade-in" style={{display: 'flex', flexDirection: 'column'}}>
                  <span className="hero-title">
                      Six Cards Golf
                  </span>
                  {uid && 
                    <span className="hero-subtitle">
                      {`Welcome, ${username}`}
                    </span>
                  }
                  <span className="hero-subtitle">
                      Get the lowest points possible and play with others in real-time
                  </span>
                  {!uid &&
                  <>
                     <span className="hero-lower">
                      To access and create game rooms,
                      </span>
                      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5px'}}>
                          <div>
                              <button className="btnSmall button greenButton" style={{marginLeft: '5px'}} onClick={()=>{window.location.href = '/login'}}>Login</button>
                          </div>
                          <div>
                              <button className="btnSmall button greenButton" style={{marginLeft: '5px'}} onClick={()=>{window.location.href = '/signup'}}>Sign Up</button>
                          </div>
                      </div>
                  </>} 
              </div>
               
              
              </div>
            </div>
          </div>
          <div className='column-6'>
            <div style={{padding: '25px', marginTop: '35px'}}>
              <h2 style={{color: 'white'}}>Leaderboard (Top 10)</h2>
                {ranks.length > 0? 
                    <table className='fade-in'>
                      <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Wins</th>
                        <th>Average Points</th>
                      </tr>
                      {ranks.map((data, index) =>
                        <tr>
                          <td>{index+1}</td>
                          <td>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div>
                                {data.avatar !== "" ?
                                    <img src={data.avatar} width="40" height="40" style={{borderRadius: '2em', objectFit: 'cover'}} />
                                    :
                                    <img src={require('../../images/default.png')} width="40" height="40" style={{borderRadius: '2em', objectFit: 'cover'}} />
                                }
                                </div>
                                <div className="clamp" style={{marginLeft: '10px', width: '100px'}}>{data.username}</div>
                            </div>
                            
                          </td>
                          <td>{data.wins}</td>
                          <td>{isNaN(Number.parseFloat(data.totalPoints/data.gamesPlayed).toFixed(2))? 0 : Number.parseFloat(data.totalPoints/data.gamesPlayed).toFixed(2)}</td>
                        </tr>
                      )}
                    </table>
                  :
                  <h4 style={{paddingTop: '150px', paddingBottom: '150px', textAlign: 'center', color: 'white'}}>No records to display.</h4>
                }
            </div>
          </div>
        </div>

        </>
    )
}
export default Home;
