# blog-post-microservices-app
Simple blog post application to learn how microservices interact

Description:
The application will allow users to submit a post, comment on a existing post.

Create Post Component:
- Blog Post title
- Post content
- Submit button

Display Post Component:
- Post Title
- Number of comments on that post
- A bullet list of comments
- Textbox to enter a new comment
- Submit button to submit the new comment

What services we need? 
A. For each resource in our application we create a new service. Here we have two services **Post Service** and **Comment Service**

Post Service:
- Create Posts
- List all posts

Comment Service:
- Create Comments
- List all comments

Project setup:
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

Post Service:
| Method | Route  | Body                       | Comments                               |
|--------|--------|----------------------------|----------------------------------------|
| GET    | /posts |                            | get all posts                          |
| POST   | /posts | { "title" : "post-title" } | create a new post with the given title |

- create a simple node js app
- listening on post 4000
- store data in memory for now in a simple posts {id, title}
- test using postman




