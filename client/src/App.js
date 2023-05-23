import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link} from 'react-router-dom'
import About from './components/global/About';
import Home from './components/global/Home';
import Forgot from './components/global/Forgot';
import Lobby from './components/global/Lobby';
import Login from './components/global/Login';
import Profile from './components/global/Profile';
import Signup from './components/global/Signup';
import Golf from './components/games/golf/Golf';
import Test from './components/global/Test';
import axios from 'axios';
import Cookies from 'universal-cookie';
import './App.css';

const InvalidRoute = ({ location }) => (
    <div className="mainPage" style={{color: 'white'}}>
      <br></br>
      <h2 style={{textAlign: 'center'}}>Error: 404 not found</h2>
      <h3 style={{textAlign: 'center'}}>Cannot find pages with the link of <code>{location.pathname}</code></h3>
    </div>
);

const App = () =>{
  //const uid = cookies.get('uid');
  let [user, setUser] = React.useState({});

  React.useEffect(() => {
    getUser();
  }, []);

  let getUser = async () =>{
    try{
      const resp = await axios.get(`/api/user/getuser`)
      if(resp.status === 200){
        if(resp.data.user){
          console.log(resp.data.user);
          setUser(resp.data.user);
        }
      }
    }catch(err){
      console.log('no user')
    }
  }

  const logout = async () =>{
    try{
      const res = await axios.post(`/api/user/logout`)
      if(res.status === 200){
          setUser(null);
          window.location.href = "/login";
      }
    }catch(err){
      console.log(err)
    }
}

  return (
    <React.Fragment>
      <Router>
        <div>
          <nav className="fixed-nav-bar">
            <div id="menu" className="menu">
              <a className="sitename" href="/">6 Cards Golf</a>
              <a className="show" href="#menu">&#9776;</a>
              <a className="hide" href="#hidemenu">x</a>
              <ul className="menu-items">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                {user._id && (<li><Link to="/lobby">Lobby</Link></li>)}
                {user._id && (<li><Link to="/profile">Profile</Link></li>)}
                {user._id && (<li><button className="mobileMenu" onClick={logout}>Log Out</button></li>)}
                {!user._id && (<li><Link to="/login" className="mobileMenu">Login</Link></li>)}
                {!user._id && (<li><Link to="/signup" className="mobileMenu">Signup</Link></li>)}
              </ul>
              <div className="menuRight">
                  <ul className="menu-items">
                    {user._id && (<li><button className="btnSmall button whiteOutline" style={{marginTop: '-2em'}} onClick={logout}>Log Out</button></li>)}
                    {!user._id &&(<li><Link to="/login">Login</Link></li>)}
                    {!user._id &&(<li><Link to="/signup">Signup</Link></li>)}
                  </ul>
              </div>
            </div>
          </nav>
        </div>
        <Routes>
          <Route exact path="/" element={<Home uid={user._id} username={user.username}/>} />
          {/* <Route exact path="/test">
              <Test  />
          </Route> */}
          <Route exact path="/login" element={!user._id? (<Login />): (<Link to="/" />)} />
          <Route exact path="/signup" element= {!user._id? (<Signup />): (<Link to="/" />)} />
          <Route exact path="/about" element={<About/>} />
          <Route exact path="/forgot" element={<Forgot/>} />

          {user._id && (<Route exact path="/game/golf/:id" element={<Golf uid={user._id}/>}/>)}
          {user._id && (<Route exact path="/lobby" element={<Lobby uid={user._id}/>}></Route>)}
          {user._id && (<Route exact path="/profile" element={<Profile user={user}/>}></Route>)}

          <Route element={InvalidRoute} />
        </Routes>
      </Router>    
    </React.Fragment> 
  );
}

export default App;
