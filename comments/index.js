const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

commentsByPostId = {
    // postId : [ {id: commentId, content} ... ]
}

app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    const comments = commentsByPostId[postId] || [];

    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    comments.push( {id: commentId, content} );

    commentsByPostId[postId] = comments;

    res.status(201).send(comments);
});

app.listen(4001, () => {
    console.log('Comment service listening on port 4001');
})