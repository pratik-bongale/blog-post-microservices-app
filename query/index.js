const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axois = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(cors());

posts = {};  // posts['asg123s'] = {postId: 'asg123s', title: 'some post', comments: [{id: '12nbh2', content: 'comment!'}, ...] }

const handleEvent = (type, data) => {
    if(type === 'PostCreated') {
        const {postId, title} = data;
        posts[postId] = { postId, title, comments: [] };
    } 

    if(type === 'CommentCreated') {
        const { id, postId, content, status } = data;
 
        const post = posts[postId];
        post.comments.push({ id, content, status });
    }

    if(type === 'CommentUpdated') {
        const { id, postId, content, status } = data;
 
        const post = posts[postId];
        const comment = post.comments.find( c => { return c.id === id; } );
        comment.status = status;
        comment.content = content;  // it is possible that comment and content both were updated
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    
    handleEvent(type, data);

    res.end();

});

app.listen(4002, async () => {
    console.log('Query service listening on port 4002');

    // when this app starts, see if there are any events that we missed
    const res = await axois.get('http://localhost:4005/events').catch((err) => {
        console.log(err.message);
    });

    for(let e of res.data) {
        const { type, data } = e;
        console.log('Processing event: ', type);
        handleEvent(type, data);
    }
});