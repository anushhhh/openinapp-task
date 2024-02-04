# Introduction

This assignment is a task management system with a set of APIs to manage tasks and their associated subtasks. It provides functionalities such as creating tasks, creating subtasks, updating task and subtask statuses, and soft deletion of tasks and subtasks.

# Features

- Create, update, and delete tasks
- Create, update, and delete subtasks associated with tasks
- Get tasks with filters (priority, due date) and pagination
- Get subtasks associated with tasks
- Automatic update of task status based on subtask statuses
- Soft deletion for tasks and subtasks
- Authentication using JWT tokens
- Twilio integration for voice calls based on user priorities

# Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Twilio API for voice calls

# API Endpoints
  
- Create User: POST /users
- Get User: GET /users/:userId
- User Login: POST /user/login
- Create Task: POST /tasks
- Create Subtask: POST /subtasks
- Get User Tasks: GET /tasks
- Get User Subtasks: GET /subtasks
- Update Task: PUT /tasks/:taskId
- Update Subtask: PUT /subtasks/:subtaskId
- Delete Task: DELETE /tasks/:taskId
- Delete Subtask: DELETE /subtasks/:subtaskId

# Folder Structure

- db: MongoDB connection logic. (conn.js)
- models: MongoDB schema models for tasks, subtasks, and users.
- middleware: Authentication/Authorization middleware function.
- services:
            - Contains Cron Jobs for task priority updation and voice calling as per user's priority using twilio.
            - Subtask status updation logic when Task status is updated and Task status updation logic when subtask status is updated. 
- app.js: Entry point of the application.
- env.js: To be renamed ".env" after cloning. 
