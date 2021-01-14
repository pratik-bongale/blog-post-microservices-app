const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

posts = {};  // posts['asg123s'] = {postId: 'asg123s', title: 'some post', comments: [{id: '12nbh2', content: 'comment!'}, ...] }


app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    
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

    console.log(posts);

    res.end();

});

app.listen(4002, () => {
    console.log('Query service listening on port 4002');
});