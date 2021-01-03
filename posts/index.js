const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// our in memory database for now
posts = {
    // id: title
}

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', (req, res) => {
    
    const postId = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[postId] = { 
        postId,
        title
    };

    res.status(201).send(posts[postId]);
});

app.listen(4000, () => {
    console.log('listening on port 4000');
});