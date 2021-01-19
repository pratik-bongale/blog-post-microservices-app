# Define what base image we want to use
FROM node:alpine

# Define work directory in the base image FS snapshot
WORKDIR /app

# Additional commands we want to run to install dependancies and set up the container
COPY ./package.json ./
RUN npm install
COPY ./ ./

# run command to execute when this container is run
CMD ["npm start"]