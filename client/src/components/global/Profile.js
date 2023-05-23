import React, { useState } from 'react';
import axios from "axios";

const Profile = ({user}) =>{ 
    let [id, setId] = useState(user._id);
    let [username, setUsername] = useState(user.username);
    let [password, setPassword] = useState('');
    let [passwordConfirm, setPasswordConfirm] = useState('');

    let [error, setError] = useState('');
    let [avatar, setAvatar] = useState(user.avatar);

    let handleSubmit = async (e) => {
        e.preventDefault();
        if(avatar !== user.avatar || username !== user.username || (password.trim() !== "")){
            if(password.trim() !== passwordConfirm.trim()){
                setError("Password must match")
            }else{
                const data = {};
                data._id = id;
                if(avatar !== user.avatar){
                    data.avatar = avatar;
                }
                if(password.trim() !== ""){
                    data.password = password;
                }
                if(username !== user.username){
                    data.username = username;
                }
                axios.post(`/api/user/update`, data)
                .then((response) => {
                    console.log(response.data)
                    window.location.href = '/';
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
            }
        }else{
            setError("No changes were made")
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
                        <h1>Profile</h1>
                        <p style={{color: 'red'}}>{error}</p>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                            <label>ID</label>
                            <b>{id}</b>
                            <br></br>
                        </div>
                        <label>Avatar</label>
                            <div style={{marginTop: '1em'}}>
                                {avatar !== "" &&
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <img src={avatar} width="80" height="80" style={{borderRadius: '2em', objectFit: 'cover'}} />
                                        <div>
                                            <button className="btnSmall button redButton" onClick={()=>{setAvatar("")}}>Delete</button> 
                                        </div>
                                    </div>
                                }
                            </div>
                            <input style={{margin: '0.5em 0'}} type="file" name="file" onChange={handleChnage} accept="image/png, image/gif, image/jpeg, image/jpg"/>
                            <br></br>
                        <label>Username</label>
                            <input type="text" placeholder="Enter Username" name="username" value={username} onChange={(e)=> {setUsername(e.target.value); setError('')}} required/>
                            <br></br>
                        <label>New Password</label>
                            <input type="password" placeholder="Enter Password" name="psw" onChange={(e)=> { setPassword(e.target.value); setError('')}}/>
                            <br></br>
                        <label>Confirmed Password</label>
                        <input type="password" placeholder="Confirm Password" name="pswConfirm" onChange={(e)=> { setPasswordConfirm(e.target.value); setError('')}}/>
                        <br></br>
                                
                        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1em'}}>
                            <button className="btnSmall button greenButton" type="submit">Save</button> 
                        </div>    
                    </div>
                </form>
            </div>   
        </div>
    )
}
export default Profile;