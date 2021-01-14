// A lot of code changes here once we have the Query Service to serve the comments associated with a post
// so commenting out the old code for maintaining history
// import React, { useState, useEffect } from "react";
// import Axios from "axios";

// export default ( { postId } ) => {

//     const [commentList, setCommentList] = useState([]);

//     // get all comments into comment list
//     const fetchComments = async () => {
//         const comments = await Axios.get(`http://localhost:4001/posts/${postId}/comments`);
//         setCommentList(comments.data);
//     };

//     // call fetchComments using effect, we want to call it only once, whenever this component is rendered it will be called
//     useEffect(() => {
//         fetchComments();
//     }, []);

//     const renderedComments = commentList.map( comment => {
//         return <li key={comment.id}>{comment.content}</li>;
//     });

//     return (
//     <div>
//         <ul>
//             {renderedComments}
//         </ul>
//     </div>
//     );
// };


import React from "react";

export default ( { comments } ) => {
    const commentList = comments;   // list of comments associated with the post

    const renderedComments = commentList.map( comment => {
        let content = "";

        if(comment.status === "approved") {
            content = comment.content;
        } else if(comment.status === "rejected") {
            content = "Comment removed by admin";
        } else if(comment.status === "pending") {
            content = "Waiting for moderation";
        }

        return <li key={comment.id}>{content}</li>;
    });

    return (
    <div>
        <ul>
            {renderedComments}
        </ul>
    </div>
    );
};
