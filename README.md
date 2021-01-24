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

### Handling failed micro-services
- When a service fails and comes up, we loose all the events it was supposed to receive from the event-bus. 
- This can also happen if we are creating a new service which needs to be initialized with past events that had occurred. (Ex. if query service was created in the second year, it has lost all the events by PostService and CommentService made in the past.)
- Solution: maintain a event-data store where event bus stores all the events it received and any service can ask the event-bus for all events starting from a time-stamp where it failed.
- In our case, we simply store all events in a array and add a `app.get('/events')` route in Event-bus Service and then in queryService we add code to fetch all the events from event-bus in the start-up `app.listen()` method.

-----------------
### Docker
- Why? You can containerize your applications. Makes it easy to install and run by packaging all dependancies in a docker image file. All you have to do is take that image and run `docker run -it <image-alias> <cmd>`
- It is an ecosystem: a set of tools to create and run containers. Tools are below:
  - Docker Client(CLI) - we issue docker commands in CLI
  - Docker Server(Daemon) - tool for creating images, running containers etc (runs in the background)
  - Docker Image - single file with all deps and config to run a prog. 
  - Docker Hub - 
  - Docker Compose.
- Container? Instance of an image(runs a prog). We use one image to run multiple instances of that program in seperate containers.
- How does it work? `docker run hello-world`
  - Enter this command of docker cli (local)
  - docker cli reaches out to docker server (local)
  - docker server looks in its image cache if we already have an image wt this name (local)
  - if image not found in local cache, docker server reaches out to docker hub (remote image repository)
  - if image found on docker hub, download that image and keep a copy in local image cache (remote -> local)
  - spin up a container which has a small program to print hello world
- Namespace: we can divide resources such as hdd, memory, network among different programs. This process is called namespacing
- A container is a namespace which gives a partition to hdd, mem, network, cpu to only those programs in image file and runs those programs using the run commands defined in the image file itself.
- The image has a file system snapshot, and a set of commands defining how to run those programs. files from the snapshot are copied into the dedicated hdd in the container and then run on the dedicated cpu in the container.
- Commands:
  ```bash
  docker run hello-world  // prints hello world and terminates
  docker run busybox echo hi there    // prints "hi there" and terminates
  docker create busybox echo hi there // returns a long container id like ksjdhb2i3bwebhhwsdku32y4834712
  docker start ksjdhb2i3bwebhhwsdku32y4834712   // starts the container i.e run the command in that image
  docker ps   // shows all containers currently running
  docker ps --all //shows all containers you ever created and then stopped them
  docker system prune   //removes the space tkaen by all the containers which are in stopped state
  docker stop <container-id>  // gracefuly shut down a process
  docker kill <container-id>  // force shut down a process    
  docker exec -it <container-id> redis-cli  // runs a command inside a already running container(redis server), -it gives an ability to get a command prompt after executing that command
  docker logs <container-id>  // displays what is happening in a already running container
  ```
- Creating a docker image file
  - Specify a base image | run some commands to install additional prog | specify a command to run on startup
  - Create a file Dockerfile in the folder you want to make an image of
  - Inside the Dockerfile
    ```
    FROM alpine                   #base image, which has a set of linux tools like ls, ps, echo etc
    RUN apk add --update redis    #apk is a pkg mgr like npm, this comes from alpine img
    CMD ["redis-server"]          #the startup command when a user does a docker run image-file
    ```
  - Save the file and execute `docker build .`
  - Several intermediate containers are created while building a docker image
  - The order of commands used in docker file matter
  - You can create images from a container
- Port mapping (localhost and docker)
  - You need to establish a port mapping to ensure that requests made to your server(incoming) to a certain port are directed to the container we want.
  - Use `docker run -p 5000:8080 container-id`: here all requests GET/POST to localhost:5000 will be redirected to port 8000 on the server.

### Kubernetes
- Why? To manage multiple containers, pass messages between containers, scale(add more containers). For our blog application, we should maintain each service in its own container. Doing it this way, we can make our service in any language or environment and it would be easy to install on any server system.
- Terminologies:
  - Kubernetes cluster: Collection of nodes + a master to manage them
  - Node: VM that will run our containers, a cluster can have one or more Nodes
  - Pod: a running container, in reality a pod can run multiple containers
  - Deployment: Monitors ser of pods, restarts them if they crash
  - Service: Provides a simple URL to access a running container, this is the common bus that talks to a set of pods like the PostService service-bus will connect all PostService pods.
  - Config file: tells kubernetes about diff deployments, pods, services(objects) written in YAML

### Kubernetes config file
- Tells kubernetes about different pods, services and deployments (objects) in our cluster
- Written in YAML syntax (similar to JSON, without curly bracecs)
- A simple yaml file looks as below
  ```YAML
  apiVersion: v1
  kind: Pod     # what do you want?
  metadata:
    name: posts # name of the object
  spec:         # define config for the object
    containers:
      - name: posts # we can provide a list of containers
        image: pratikbongale/posts:0.0.1
  ```
- This tells kubernetes that you want the cluster to run a Pod which has a single container and that when you spin up this container use the given docker image
- Kubernetes commands
  ```bash
  kubectl get pods  # similar to docker ps
  kubectl exec -it [podname] [cmd]  # run a command inside the pod like docker exec
  kubectl logs
  kubectl delete [podname]
  kubectl apply -f <filename>.yaml  # apply this config to the current cluster
  kubectl describe pod [podname]  # prints more info about this pod
  ```
- we dont usually create pods directly in config file as shown above. we create deployments where we specify config for pods
- Deployment: manager of multiple pods, ensures if a pod goes down its containers are restarted, also helps when we want to update our app from v1 to v2
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: posts-depl
  spec:           # config for the depl
    replicas: 1   # number of pods you want at any given time
    selector:     # select which pods(defined in template below) you want me to run, by matching labels
      matchLabels:  
        app: posts
      template:   # define pods and label them
        metadata:
          labels:
            app: posts  
        spec:     # config for pods
          containers:
            - name: posts
              image: pratikbongale/posts:0.0.1
  ```
- To apply deployment use `kubectl apply -f posts-depl.yaml`
- all other commands for pods are also applicable for deployments. If we delete a pod, the deployment will automatically recreate it.. 
- How to update your apps and let kubernetes know?
  - instead of specifying a version for your image, put pratikbongale/posts:latest
  - when docker sees the latest tag, after looking in your local machine, it will go to docker hub and look for your image
  - make your modification, build a new image and then push the image to docker hub.. `docker push pb/posts:latest`
  - commands to push to dockerhub: 
    ```bash
    docker tag local-image:tagname new-repo:tagname
    docker login
    docker push new-repo:tagname
    ```
  - run `kubectl rollout restart deployment posts-depl`. This will automatically take the latest image from docker hub which has your modifications
- Notes about debugging:
  - whenever you change your code, you need to rebuild the docker image using `docker build -t pb/posts` and push that new image to docker hub
  - whenever you make any change to the config file for pods/deployment (posts-depl.yaml), you need to apply that change to the kubernetes cluster using `kubectl apply -f posts-depl.yaml`
  - whenever you push new image to docker hub and your local image name does not match the remote image name, you need to:
    ```
    docker login
    docker tag pratikbongale/posts psb4346/posts
    docker push psb4346/posts
    ```
  - In my case, my local image is tagged as pratikbongale/posts and my docker id is psb4346, so the above command will create a new repository for posts.
  - Process: 
    - Modify code, build docker image, push to docker hub, restart the deployment(so that it pulls the latest copy from docker hub)

### Kubernetes services
- whenever we are thinking about any communication/networking between pods(ex. event bus) or with the outside world(ex. browser) we are going to callout our service object.
- create another yaml config file to define a service and apply it to our cluster
- 