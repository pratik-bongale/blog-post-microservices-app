import React, { useState } from 'react';
import Axios from 'axios';


export default () => {

    const [title, setTitle] = useState('')  // input: initialState, setTitle will reset the control bound to title to initialState

    const onSubmit = async (event) => {
        // we want to send the values to our post service when user submits the title
        event.preventDefault();

        await Axios.post("http://localhost:4000/posts", {title}); //send title in the body of post request

        setTitle('');
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="form-control" />
                </div>
                <button className="btn btn-primary" style={{marginTop:'20px'}}>Post</button>
            </form>       
        </div>
    );
};