# Chategorize
#### Video Demo:  https://www.youtube.com/watch?v=mGVDbHdM5ps
#### Description:
Chategorize is a simple chat app where users can chat with friends and organise their chats by event, topic name or anything they like. This project was developed as part of the Harvard CS50X course for my final project. I used Nodejs, Express and MongoDB as well as the socket.io library to allow for real time communication. Basic auth has been implemented by way of passport to allow users to register for an account and view their chat history. I used EJS as my templating language and Bootstrap and custom CSS for styling. Since submitting this project, I have also added email functionality by means of Nodemailer using an SMTP to send emails upon registering and receiving new chat messages to users. I plan to expand this to updating forgotton password capabilities in the near future.

##### Design Choices
I chose to use EJS templating language rather than HTML due to the ability to include dynamic Javascript in the markup. The ease of accessing variables from the app was a plus as it meant that I could rely less on using socket events to pass variables from server to client. The project developed over the past few months of working on it and had several names such as Bubble Chat, and Socket Chat but I settled on Chategorize as it made sense for my idea. The name reflects the nature of the app, which is less of a general chat app and more or a way to organize and easily find your message history.

##### File Contents
###### Views
My app is split into several directories containing many small files. I organised the app this way so that it would reduce repetition of code abiding by the DRY principle. Therefore, I have a partials folder within the views directory containing several ejs files which combine together to build the pages on the site. For example, there is a navbar.ejs file which is used on each page of the site so as not to repeat the code.

###### Public
The public directory contains JS and CSS files for the app. As previously mentioned, the app uses Bootstrap for much of the styling but I have customs styles and animation in the styles.css file. App.js is the client side application and socket connections which communicate with server.js.

###### Routes
Main routes are on the server.js file but I have separated user routes for registering and login for organising the code.

###### Models
Mongoose schema models for users, rooms and messages are found in the models directory.

###### Utils
The utils directory has 2 files which are both helper functions for catching errors and are reused several times on the main code.

#### Instructions to run project:

1. Install MongoDB (required for storing data on on your local storage)

2. Run the npm init command in the terminal to install node modules  (required dependencies are in the package.json file)

3. Run node server.js in the terminal to start the application and go to localhost:5000
