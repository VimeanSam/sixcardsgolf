import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';

const Login = () =>{ 
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [error, setError] = useState('');

    let handleSubmit = (e) => {
        axios.post(`/api/user/login`, {
            username: username,
            password: password,
        })
        .then((response) => {
            if (response.status === 200) {
               console.log(response.data);
               //cookies.set('uid', response.data._id, { path: '/' });
                //sessionStorage.setItem('uid', response.data._id);
               window.location.href = "/";
            }
        })
        .catch((error) =>{
            console.log('Invalid username or password');
            setError('Invalid username or password');
        }); 
        e.preventDefault();
    }

    return(
        <div className="mainPage">
            <div className="Login fade-in">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="cardTab">
                        <h1>Log In</h1>
                        <p>Please log in to your account to access contents</p>
                        <p style={{color: 'red'}}>{error}</p>
                        <label>Username</label>
                        <br></br>
                        <input type="text" placeholder="Enter Username" name="username" onChange={(e)=> {setUsername(e.target.value); setError('')}} required/>
                        <label>Password</label>
                        <br></br>
                        <input type="password" placeholder="Enter Password" name="password" onChange={(e)=> {setPassword(e.target.value); setError('')}} required/>
                        <span><a href="/forgot" style={{textDecoration: 'none'}}>Forgot Password</a></span>
                        <button className="btnLarge button greenButton" type="submit" style={{marginTop: '10px'}}>Login</button>
                        <br></br>
                        <p style={{textAlign: 'center'}}>No account? <a href="/signup">Sign Up</a> anytime</p>
                    </div>                 
                </form>                  
            </div>
        </div>
    )
}
export default Login;