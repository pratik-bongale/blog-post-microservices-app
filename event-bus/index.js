const express= require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express();
app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {

    const event = req.body;
    
    events.push(event);    
    
    // await axios.post('http://localhost:4000/events', event);    // post service
    // await axios.post('http://localhost:4001/events', event);    // comments service
    // await axios.post('http://localhost:4002/events', event);    // query service
    // await axios.post('http://localhost:4003/events', event);    // moderation service

    axios.post('http://posts-clusterip-srv:4000/events', event).catch((err) => {
        console.log(err.message);
    });
    // axios.post('http://localhost:4001/events', event).catch((err) => {
    //     console.log(err.message);
    // });
    // axios.post('http://localhost:4002/events', event).catch((err) => {
    //     console.log(err.message);
    // });
    // axios.post('http://localhost:4003/events', event).catch((err) => {
    //     console.log(err.message);
    // });

    res.send( { status: 'OK' } );

}); 

app.get("/events", (req, res) => {
    res.send(events);
});

app.listen(4005, () => {
    console.log("Event bus listening on port 4005");
});
