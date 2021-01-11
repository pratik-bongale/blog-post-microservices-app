const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

commentsByPostId = {
    // postId : [ {id: commentId, content} ... ]
}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;
    const comments = commentsByPostId[postId] || [];

    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    comments.push( {id: commentId, content} );

    commentsByPostId[postId] = comments;

    // whenever a comment is created we want to emit an async event to event bus
    await axios.post("http://localhost:4005/events", { type: 'CommentCreated', data: { id: commentId, postId: postId, content } });

    res.status(201).send(comments);
});

// handle the event received from the event bus
app.post('/events', (req, res) => {
    console.log('Event received: ', req.body.type);
    res.send({});
});

app.listen(4001, () => {
    console.log('Comment service listening on port 4001');
})