// User should be able to submit a comment in an input box and we should provide a button for that
// so we need a form with input box and a submit button
// each comment is associated with some post

import React, { useState } from "react";
import Axios from "axios";

export default ({ postId }) => {

    const [content, setContent] = useState('')

    const onSubmit = async (event) => {
        event.preventDefault();

        // template strings: they’re a nice-looking, convenient way to plug JavaScript values into a string.
        await Axios.post(`http://localhost:4001/posts/${postId}/comments`, { content });

        setContent('');
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <div className="form-group" >
                    <label>Comment</label>
                    <input value={content} onChange={e => setContent(e.target.value)} className="form-control"></input>
                </div>
                <button className="btn btn-primary">Comment</button>
            </form>
        </div>
    );
};