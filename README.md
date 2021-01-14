# blog-post-microservices-app
Simple blog post application to learn how microservices interact

### Description:
The application will allow users to submit a post, comment on a existing post.

### Create Post Component:
- Blog Post title
- Post content
- Submit button

### Display Post Component:
- Post Title
- Number of comments on that post
- A bullet list of comments
- Textbox to enter a new comment
- Submit button to submit the new comment

### What services we need? 
A. For each resource in our application we create a new service. Here we have two services **Post Service** and **Comment Service**

### Post Service:
- Create Posts
- List all posts

### Comment Service:
- Create Comments
- List all comments

### Project setup:
- Create a git project
- Git Clone <project-link>
- Create a react web client(front-end): 
```npx create-react-app client```
- Create two express projects in root directory:
  ```
  mkdir posts
  cd posts
  npm init -y 
  npm install axios cors nodemon express
  ```
  ```
  mkdir comments
  cd comments
  npm init -y 
  npm install axios cors nodemon express
  ```

### Post Service:
  | Method | Route  | Body                       | Comments                               |
  |--------|--------|----------------------------|----------------------------------------|
  | GET    | /posts |                            | get all posts                          |
  | POST   | /posts | { "title" : "post-title" } | create a new post with the given title |

- create a simple node js app in posts directory listening on post 4000
- store data in memory for now in a simple javascript object `posts {id, title}`
- handle Get and Post requests to this service 
  ```Javascript
  app.get('/posts', (req, res) => {
      res.send(posts);
  });
  ```  
- test using postman

### Comments Service:
| Method | Route               | Body                           | Comments                                     |
|--------|---------------------|--------------------------------|----------------------------------------------|
| GET    | /posts/:id/comments |                                | Get all comments associated with postId = id |
| POST   | /posts/:id/comments | { "content" : "comment-data" } | Add a new comment to post with postId = id   |

- create a simple node js app in comments directory, listening on post 4001
- store data in memory for now in a simple javascript object `commentsByPostId {postId : [{commentId, content}, {commentId, content}...] }`
- handle Get and Post requests to this service 
  ```Javascript
  app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
  });
  ```  
- test using postman

### Front-end client:
- Components
  - App
    - Post List
      - Comment List
      - Comment Create
    - Post Create
- Start by creating the App component (App.js)
- Add it as a component to the ReactDOM (index.js)
- Instruct react to render it in `root` div in index.html (index.js)
- Create **PostCreate** Component (PostCreate.js) and call 
  ```Javascript
  await axios.post("http://localhost:4000/posts", {title});
  ```
- Create **PostList** Component (PostList.js) and call
  ```Javascript
  await axios.get('http://localhost:4000/posts');
  ```
- Add/import them to App component (App.js) and test it `npm start`

- **CORS Error**
  - we get a CORS error as we are trying to communicate across different applications, one running on port 4000(backend) and other on port 3000(frontend). 
  - Fix: add the following code to your backend services
    ```Javascript
    const cors = require('cors');
    const app = express();
    app.use(bodyParser.json());
    app.use(cors()); // cors library enables 
    ```

- Create **CommentCreate** Component (CommentCreate.js) similar to PostCreate and call 
  ```Javascript
  await axios.post(`http://localhost:4001/posts/${postId}/comments`, {content});  
  ```
  - Template Strings (using backticks): they’re a nice-looking, convenient way to plug JavaScript values into a string. example: while throwing an error you can use `User ${user.name} is not authorized to do ${action}.`);
- Create **CommentList** Component (CommentList.js) similar to PostCreate and call 
  ```Javascript
  await axios.get(`http://localhost:4001/posts/${postId}/comments`);  
  ```
- Add/import them to PostList.js and test

### Problems
- Multiple requests to comments service
  - Currently we fetch a list of posts by calling the Post service and display them as cards
  - However, for each of this post in that list, we separately call the comments service, so if we have 100 posts, that micro-service will be called 100 times.
  - we want to get all comments from all posts in a single data structure so we can make a single request
  - Solution 1: Sync communication between services
    - when we do get all Posts to PostService, we can ask PostService to reach out to Comments service and get all comments embedded into the same request
    - Cons: introduces dependancies, one service can slow down the entire req, if one service fails the whole req fails
  - Solution 2: Async communication
    - have an event broker that all services can submit events to and which routes these events between services.
    - also maintain a new service, called Query service which listens to events from Post Service and Comments Service. Whenever a new post/comment is created, this query service will put them together and provide the necessary data in a single data structure
    - Cons: Data duplication

### Solution
- We are going to use the 2nd approach of async communication
- Build an event bus from scratch and a new service to join the data from post and comments service and then do a single get request from this Query Service
- We do have off-the-shelf solutions for event bus like: **Kafka, RabbitMQ** etc which receive events and publish them to subscribers

### Query Service
- Create a query service which will simply join the data by using events sent by the event bus whenever a new post is created or comment is created.
- Only need to write the logic to handle events and maintain data in a large data structure which will store posts and their comments together
- `posts['asg123s'] = {postId: 'asg123s', title: 'some post', comments: [{id: '12nbh2', content: 'comment!'}, ...] }`

### Event Bus
- Our implementation will be super simple. When user submits a post, the Post Service will make a POST call to event bus, attaching some data to this request and that EventBus service will make POST call to all other services in the application.
- Set up
  ```
  mkdir event-bus
  cd event-bus
  npm init -y
  npm install nodemon axios cors express
  ```
- Event bus is just another service which relays events btw other services, so create a new node service and define a post endpoint POST "/events". 
- In this endpoint, we take the event object sent in the request and pass it on to PostService, CommentService and QueryService to their "/events" endpoints.
  ```Javascript
  const event = req.body;
  axios.post('http://localhost:4000/events', event);  // Post Service
  axios.post('http://localhost:4001/events', event);  // Comment Service
  axios.post('http://localhost:4002/events', event);  // Query service
  ```
- Make sure you keep the format of the event body consistent. Here we use: Event = {type: PostCreated, {id: 'adskj2', title:'some post'}}
- Add code to PostCreate and CommentService to handle the incoming event from Event-bus
- Create another service(node js app) called QueryService with end points
  - GET /posts  
  - POST /events  
  - data is maintained in a simple javascript object posts[]
    `posts[id] = {id: 'asg123s', title: 'some post', comments: [{id: '12nbh2', content: 'comment!'}, ...] }`
- Modify the React application so that component **PostList** now fetches posts from QueryService and passes the comment list obtained with each post to **CommentList** component. 

### New feature - Moderation service
- This service moderates comments to flag a comment as "pending"/"approved"/"rejected" if it includes an unwanted word.
- To implement this feature we need to modify the payload of a **Comment**. `{id: commentId, postId, content, status}` . 
- Listen to all events from event bus and whenever you hear "Comment Created" event, parse through the comment to find if it contains a blocked word. Ex. Orange. change the status of Comment to rejected/approved. Default status will be pending moderation. 
- Modify the QueryService so we can update the database in that service to have the latest updates
- Modify the Event bus to relay events to and from Moderation service
- Modify the comment service to handle CommentModerated event (means its time to update the comment status) generated by Moderation service.
- Finally update the react app to show the status of each comment







