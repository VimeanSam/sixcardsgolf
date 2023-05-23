import React, { useState } from 'react';
import axios from "axios";

const Signup = () =>{ 
    let [username, setUsername] = useState('');
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [passwordConfirm, setPasswordConfirm] = useState('');
    let [error, setError] = useState('');
    let [avatar, setAvatar] = useState('');

    let handleSubmit = async (e) => {
        e.preventDefault();
        if(username.trim() !== "" && email.trim() !== "" && password !== ""){
            if(password.trim() !== passwordConfirm.trim()){
                setError("Password must match")
            }else{
                const data = {};
                data.username = username;
                data.email = email;
                data.password = password;
                data.avatar = avatar;

                // console.log(data)

                axios.post(`/api/user/signup`, data)
                .then((response) => {
                    console.log(response.data)
                    window.location.href = '/login';
                })
                .catch((error) =>{
                    console.log(error.response.data);
                    setError(error.response.data)
                    if(error.response.data.error){
                        //display error
                        setError(error.response.data.error);
                        //if user uploaded an avatar, delete in from database
                    }
                });
            }
        }else{
            setError("Fields cannot be empty")
        }
    }

    const handleChnage=(e)=>{
        var imageType = /image.*/;
        if(e.target.files[0].type.match(imageType)){
            if(e.target.files[0].size > 10000000){
                setError('Image may not exceed 10 MB')
            }else{
                const data = new FileReader()
                data.addEventListener('load',()=>{
                    setAvatar(data.result)
                })
                data.readAsDataURL(e.target.files[0])
            }
        }else{
            setError('You can only select images')
        }
    }

    return(
        <div className="mainPage">
            <div className="Login fade-in">
                <form onSubmit={(e) => handleSubmit(e)}>
                    <div className="cardTab">
                        <h1>Sign Up</h1>
                        <p>Please fill in this form to create an account.</p>
                        <p style={{color: 'red'}}>{error}</p>
                        <label>Username</label>
                            <input type="text" placeholder="Enter Username" name="username" onChange={(e)=> {setUsername(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Email</label>
                            <input type="text" placeholder="Enter Email" name="email" onChange={(e)=> {setEmail(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Password</label>
                            <input type="password" placeholder="Enter Password" name="psw" onChange={(e)=> { setPassword(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Confirm Password</label>
                            <input type="password" placeholder="Confirm Password" name="psw2" onChange={(e)=> { setPasswordConfirm(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>Avatar</label>
                            {avatar !== "" &&
                                <div style={{marginTop: '1em'}}>
                                    <img src={avatar} width="80" height="80" style={{borderRadius: '2em', objectFit: 'cover'}} />
                                </div>
                            }
                            <br></br>
                            <input style={{marginTop: '0.5em'}} type="file" name="file" onChange={handleChnage} accept="image/png, image/gif, image/jpeg, image/jpg"/>
                            <br></br>
                        <div style={{marginTop: '1em'}}>
                            <button className="btnLarge button greenButton" type="submit">Sign Up</button> 
                        </div>    
                    </div>
                </form>
            </div>   
        </div>
    )
}
export default Signup;