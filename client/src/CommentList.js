import React, { useState, useEffect } from "react";
import Axios from "axios";

export default ( { postId } ) => {

    const [commentList, setCommentList] = useState([]);

    // get all comments into comment list
    const fetchComments = async () => {
        const comments = await Axios.get(`http://localhost:4001/posts/${postId}/comments`);
        setCommentList(comments.data);
    };

    // call fetchComments using effect, we want to call it only once, whenever this component is rendered it will be called
    useEffect(() => {
        fetchComments();
    }, []);

    const renderedComments = commentList.map( comment => {
        return <li key={comment.id}>{comment.content}</li>;
    });

    return (
    <div>
        <ul>
            {renderedComments}
        </ul>
    </div>
    );
};
