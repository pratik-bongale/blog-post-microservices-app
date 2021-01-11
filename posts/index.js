const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// our in memory database for now
posts = {
    // id, title
}

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', async (req, res) => {
    
    const postId = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[postId] = { 
        postId,
        title
    };

    // whenever a post is created we want to emit an async event to event bus
    await axios.post("http://localhost:4005/events", { type: 'PostCreated', data: { postId, title } });

    res.status(201).send(posts[postId]);
});

// handle the event received from the event bus
app.post('/events', (req, res) => {
    console.log('Event received: ', req.body.type);
    res.send({});
});

app.listen(4000, () => {
    console.log('listening on port 4000');
});