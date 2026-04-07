## NeoBank – Digital Banking Portal

#### NeoBank is a high-performance, full-stack digital banking application. It features a modern, secure architecture for managing digital assets, featuring real-time transaction processing, automated reporting, and a professional corporate user experience.

<a href="https://neobank-digital-banking-portal.vercel.app/">
  <p align="center">
    <img src="home.png" width="600" alt="Click to View Live Demo">
    <br>
    <em>Click the image above to view the live portal</em>
  </p>
</a>

### Key Features
### Security and Access Control
#### - JWT Authentication: Robust stateless security using JSON Web Tokens for session management.
#### - Role-Based Access Control (RBAC): Distinct workflows and permissions for User and Admin roles.

### Banking Operations
#### - Real-Time Dashboard: Instant access to available and locked balances with automated UI synchronization.
#### - Virtual Pockets: Create and manage targeted savings goals with automated fund stashing and claim functionality.
#### - Fund Transfers: Secure peer-to-peer transfers with category-based tracking and transaction mapping.
#### - Data Analytics: Interactive spending breakdowns and financial summaries powered by Chart.js.

### User Interface
#### - Angular 19: Built using the latest framework standards, including Standalone Components and Signals.
#### - Adaptive Theming: Full support for professional Dark Mode and Light Mode with persistent state management.
#### - Responsive Design: Optimized for mobile, tablet, and desktop environments using Bootstrap 5.

### Tech Stack
   - Frontend -	Angular 19, TypeScript, Bootstrap 5, Chart.js
   - Backend -	Java 21, Spring Boot 3, Spring Security, JWT
   - Database - TiDB Cloud (MySQL-compatible Distributed SQL)
   - DevOps	- Docker, Vercel (Frontend), Render (Backend API)

### Setup and Installation
#### Prerequisites
     JDK 21 or higher
     Node.js 18 or higher (with Angular CLI)
     Maven 3.8+

#### Backend Setup
  - Navigate to the backend directory:

        cd backend-banking-portal
  - Configure your database connection in src/main/resources/application.properties.
  - Build and run the application:

        mvn spring-boot:run

#### Frontend Setup
 - Navigate to the frontend directory:
   
       cd frontend-banking-portal-ui
 - Install the required dependencies:

        npm install
 - Launch the development server:
   
        ng serve

#### API Documentation
 -  POST /api/auth/login: Authenticates user and returns JWT.
 - GET /api/accounts/my: Retrieves current user account details and balance.
 - POST /api/transactions/transfer: Executes a fund transfer between accounts.
 - GET /api/savings/my-pockets: Fetches all savings goals associated with the user.
 - POST /api/savings/stash: Moves funds from available balance to a specific pocket.


# ScreenShots
![dashboard with transaction analytics and virtual pockets with money locking for Emi or other savings](<analytics.png>)

![Admin page](<admin.png>)

![transactions report](<monthlyreport.png>)

![send money](<sendmoney.png>)

![transactions history](<transhistory.png>)

![deposite money](<inputfund.png>)

![login](<login.png>)

📌 Future Enhancements

   PDF/CSV statement download

   Two-factor authentication (2FA)

   Email notifications

   Admin analytics dashboard
