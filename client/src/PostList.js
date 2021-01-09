import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default () => {

    const [posts, setPosts] = useState({});

    const fetchPosts = async () => {
        const allPosts = await axios.get('http://localhost:4000/posts');
        setPosts(allPosts.data);
    };


    // this is a side effect of render.. whenever this component is rendered the func provided here will be run
    // used in logging, clean up, manual DOM mutations, network requests etc
    useEffect(() => {
        fetchPosts();   // our network request
    }, []); // the empty array tells React that your effect doesn’t depend on any values from props or state, so it never needs to re-run.
    // you can also pass all the state variables instead of the empty array.. this tells react that if my variable changes, run the func

    // console.log(posts);  // looks good

    // posts is a JS object, Object.values will turn it into an array of objects
    const renderedPosts = Object.values(posts).map(post => {
        return (<div className="card" 
                    style={{width: '30%', marginBottom: '20px'}}
                    key={post.postId}    
                >
                    <div className="card-body">
                        <h3>{post.title}</h3>
                    </div>
                </div>);
        });

    return <div className="d-flex flex-row flex-wrap justify-content-between">
        {renderedPosts}
    </div>;
        
};

