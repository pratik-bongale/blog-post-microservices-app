const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
    //  look at the content and see if it has the word orange in it
    const { type, data } = req.body

    if(type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';

        // send the new status to event-bus
        await axios.post('http://localhost:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                content: data.content,
                status
            }
        }).catch((err) => {
            console.log(err.message);
        });
    }

    res.end();
    
});

app.listen(4003, () => {
    console.log('moderation service listening on port 4003');
});