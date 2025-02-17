# Task Manager Backend using Koa.js

![image](https://github.com/user-attachments/assets/18300ff0-1292-4b4f-94b0-97258f344075)


## 🚀 Overview
This is the **backend** for the Task Management System, built with **Koa.js and MongoDB**.  
It provides a **RESTful API** with user authentication, task management, and real-time task updates via **WebSockets**.


## 🏗️ Features
- **JWT Authentication** (Register/Login)
- **Role-Based Access Control (RBAC)**
- **Task Management API** (Create, Read, Update, Delete)
- **Task Assignment with WebSockets** (Real-time updates)
- **MongoDB Schema with Validation**
- **Security Features** (CSRF protection, Rate Limiting)
- **Seeder for Users, Admins, and Tasks**

---

## 📦 Installation

1. Clone the repo:
   ```sh
   git clone https://github.com/helmiabdefattah/task-manager.git
   cd task-manager

   1.  Install Dependencies
   npm install
    
   2.  Configure Environment VariablesCopy the example .env file and update the values as needed:cp .env.example .envOpen .env and set:PORT=5000MONGO\_URI=mongodb://localhost:27017/task-managementJWT\_SECRET=your\_secret\_key
    
   3.  Start MongoDBEnsure MongoDB is running locally or provide a cloud database URI in .env.
    
   4.  Seed the DatabaseRun the seeder to populate the database with users, admins, and tasks:npm run seedThis creates admin and user accounts and sample tasks.Admin Credentials:Email: admin@gmail.comPassword: password
    
   5.  Start the Servernpm startBackend API will be available at: http://localhost:5000/
    

Authentication & Role-Based Access Control
------------------------------------------

*   Admins can create, delete, and assign tasks.
    
*   Users can update and move assigned tasks.
    
*   WebSockets enable real-time task updates.
    

API Endpoints
-------------

### Authentication

*   POST /register → Register a new user
    
*   POST /login → Authenticate & get a JWT token
    

### Tasks

*   GET /tasks → Fetch all tasks
    
*   POST /tasks → Create a new task (Admin only)
    
*   PUT /tasks/:id → Update task details
    
*   DELETE /tasks/:id → Delete a task (Admin only)
