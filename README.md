# Node-Vue Application

## Project Overview

This project is a full-stack application built with Node.js and Vue.js. It includes a RESTful API on the server side that interacts with a MongoDB database and a client-side application built with Quasar for real-time data visualization and dynamic data management.

## Prerequisites

- Node.js (v14 or later)
- MongoDB (locally or a cloud version like MongoDB Atlas)
- Postman (for API testing)

## Setup Instructions

1. Clone the repository:

    ```
    git clone https://github.com/obakengmanana/node-vue-application.git

    gh repo clone obakengmanana/node-vue-application
    ```

2. Install dependencies:

    - For the server

    ```bash
    cd server-side
    npm install
    ```

    - For the client

    ```bash
    cd client-side
    npm install
    ```

3. Environment Configuration:

    - Create a .env file in the server-side directory with the following variables:

    ```bash
    MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/company?retryWrites=true&w=majority
    PORT=3000
    JWT_SECRET=your_jwt_secret
    ```
    - Replace <username>, <password>, and other placeholders with your actual credentials.

4. Starting the Server:

    - From the server-side directory, start the server:

    ```bash
    node index.js
    ```

5. Starting the Client:

    - From the client-side directory, start the client:

    ```bash
    npm run serve
    ```

6. Access the Application:

    - Open your browser and navigate to http://localhost:8080 to access the client-side application.
    - The server APIs are accessible at http://localhost:3000/api


## API Testing

1. Use Postman or CURL to test the API endpoints:

    - GET /api/users/uniqueUsers: Fetches all unique users from the database
    - GET /api/users/orderedUsers: Fetches users ordered by department and designation
    - POST /api/users/addUser: Adds a new user to the database
        - Request Body
            ```bash
            {
                "name": "John",
                "surname": "Doe",
                "department": "Engineering",
                "designation": "Technician"
            }
            ```
    - PUT /api/users/updateUser/ : Updates an existing user in the database
        - Request Body
            ```bash
            {
                "name": "John Updated",
                "surname": "Doe",
                "department": "Research",
                "designation": "Lead Technician"
            }
            ```

## WebSocket Server and Client

The application includes WebSocket functionality to enable real-time data updates, which are particularly useful for the pie chart feature. Below are the instructions on how to set up and use the WebSocket server and client.

### 1. Starting the WebSocket Server

The WebSocket server handles connections and sends data updates to clients every 5 seconds.

- File Location: server-side/websocketServer.js
- To Start the WebSocket Server:

    ```bash
    cd server-side
    node websocketServer.js
    ```
- Expected Output: You should see output similar to:
    ```bash
    WebSocket server is running on ws://localhost:3006
    ```
- This indicates that the server is up and running, ready to accept WebSocket connections.

### 2. Starting the WebSocket Client

The WebSocket client connects to the WebSocket server and sends a test message, verifying the server's response

- File Location: server-side/websocketClient.js
- To Start the WebSocket Client:

    ```bash
    cd server-side
    node websocketClient.js
    ```
- Expected Output: You should see output similar to:
    ```bash
    Connected to WebSocket server
    Sending message: HelloSedibelo
    Received reversed message: olebideSolleH
    Verification successful: The received message matches the reversed version.
    WebSocket connection closed
    ```
- This output confirms that the client successfully connected to the server, sent a message, received the correct reversed message, and verified it successfully.
- Ensure that the WebSocket server (websocketServer.js) is running before starting the WebSocket client (websocketClient.js).
- The WebSocket server listens on port 3006, so make sure this port is not blocked by any firewall or used by another service.

## Project Structure

The project is divided into two main parts:
 - server-side/: Contains all backend code, including API routes, database interactions, and utility functions.
 - client-side/: Contains the frontend Vue.js application with real-time pie charts and dynamic data tables.

## API Endpoint Documentation

The project is divided into two main parts:
 - GET /api/users/uniqueUsers: Displays unique users created in Task 1.
 - GET /api/users/orderedUsers: Displays users ordered by department and designation, created in Task 3.
 - POST /api/users/addUser: Adds a new user to the unique users collection.
 - PUT /api/users/updateUser/ : Updates an existing user.


## End