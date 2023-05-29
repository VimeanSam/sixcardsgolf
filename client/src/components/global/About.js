import React, { useState } from 'react';

const About = () =>{ 
    return(
        <div className="mainPage fade-in" style={{color: 'white'}}>  
            <h1 style={{marginLeft: '25px'}}>About</h1>
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
                <p> This is a web clone of 6 cards Golf. Node.js, Express, MongoDB, CSS, and React.js are the frameworks used to programmed this project. 
                  JavaScript libraries such as Bcrypt for passwords, axios for transfering client-server data, and socket.io for 
                  real-time player actions. The website is deployed on AWS EC2 with NGINX configuration. Supported browsers include Google Chrome, Safari, Edge, and Firefox. 
                </p>
            </div>     
            <h2 style={{marginLeft: '25px'}}>How to play</h2>  
            <h3 style={{marginLeft: '25px'}}>The Website</h3>  
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
                <p> Players can create a lobby with up to 4 players and have the option for the game to end at 50, 80, and 100 points. Players can also join live games where
                    another player's total points isn't close enough to the final score limit {'(more than 30 points away from the limit)'} but they will have to take on the current highest point that another player has. In a live game, players have 1 minute and
                    30 seconds to make a play otherwise they will get disconnected for idling too long. 
                </p>
            </div>  
            <h3 style={{marginLeft: '25px'}}>The Deck</h3>  
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
                <p> This game uses a standard 52 card deck with Jokers. Users can create a game room with a single deck or a double deck for larger game rooms.
                </p>
            </div>     
            <h3 style={{marginLeft: '25px'}}>Dealing</h3>  
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
                <p> Each player is dealt 6 cards face down from the deck. The remainder of the card deck are placed face down, and the top card is drawn and face up to start the discard pile beside it. 
                 Players arrange their 6 cards in 2 rows of 3 in front of them and turn 2 of these cards face up during the first round. The remaining cards stay face down and cannot be looked at, only swap.
                </p>
            </div>    
            <h3 style={{marginLeft: '25px'}}>Objective</h3>  
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
                <p> The object is for players to have the lowest value of the cards in front of them by either swapping them for lesser value cards or by pairing them up with cards of equal rank.
                Players take turns drawing single cards from either the stock or discard piles. The drawn card may either be swapped for one of that player's 6 cards, or discarded.
                If the card is swapped for one of the face down cards, the card swapped in remains face up. The round ends when all of a player's cards are face-up. The player with the lowest total score is the winner
                </p>
            </div>    
            <h3 style={{marginLeft: '25px'}}>Scoring</h3>  
            <div style={{marginLeft: '25px', marginRight: '25px'}}>
              <p>Lowest to highest</p>
              <ul>
                <li>Joker: <b>-2 points</b></li>
                <li>Kings: <b>0 points</b></li>
                <li>Aces: <b>1 point</b></li>
                <li>2-10: <b>Their numerical Value</b></li>
                <li>Jacks, Queens: <b>10 points</b></li>
              </ul>
              <p>A pair of equal cards in the same column scores <b>0 points</b> regardless of the suit (even if the equal cards are Jokers).</p>
              <p><b>SPECIAL: </b> In a double deck play, it is possible to have 2 or more columns of equal cards. In this rare scenario, the 2 equal columns are worth <b>-20 points</b>.
              and if a playe somehow has all columns of the same cards, <b>-50 points</b> will be deducted from the player's total point which will swing the matchup in the player's favor and 
              potentially guarantee a victory. 
              </p>
            </div>   
        </div>
    )
}
export default About;
