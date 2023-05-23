import React, { useState } from 'react';
import axios from "axios";;

const Forgot = () =>{ 
    let [id, setID] = useState('');
    let [password, setPassword] = useState('');
    let [passwordConfirm, setPasswordConfirm] = useState('');
    let [error, setError] = useState('');

    let handleSubmit = async (e) => {
        e.preventDefault();
       
        if(id.trim() !== "" && password.trim() !== ""){
            const data = {
                _id: id,
                password: password
            };
            axios.post(`/api/user/forgotPassword`, data)
            .then((response) => {
                console.log(response.data)
                window.location.href = '/login';
            })
            .catch((error) =>{
                if(error.response.data.error){
                    //display error
                    setError(error.response.data.error);
                    //if user uploaded an avatar, delete in from database
                }else{
                    setError("Something went wrong")
                }
            });
        }else{
            setError("Fields cannot be emtpy")
        }
    }
    return(
        <div className="mainPage">  
             <div className="Login">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="cardTab">
                        <h1>Forgot Password</h1>
                        <p style={{color: 'red'}}>{error}</p>
                        <label>User ID</label>
                            <input type="text" placeholder="Enter your unique User ID" name="username" onChange={(e)=> {setID(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Password</label>
                            <input type="password" placeholder="Enter Password" name="psw" onChange={(e)=> { setPassword(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm Password" name="psw2" onChange={(e)=> { setPasswordConfirm(e.target.value); setError('')}} required/>
                            <br></br>
                        <div style={{marginTop: '1em'}}>
                            <button className="btnLarge button greenButton" type="submit">Change</button> 
                        </div>    
                    </div>
                </form>
            </div>    
        </div>
    )
}
export default Forgot;
