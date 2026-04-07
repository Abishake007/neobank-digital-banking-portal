## NeoBank – Digital Banking Portal

NeoBank is a full-stack digital banking web application that simulates core online banking functionalities such as 
                                                                                                                    secure authentication, account management, fund transfers, transaction history, reports, and a modern dark-mode UI.

This project demonstrates real-world banking workflows using a clean full-stack architecture.

---

## [Preview Link](https://neobank-digital-banking-portal.vercel.app/)

## 🚀 Features

### Authentication & Security
- JWT-based authentication
- Secure user login and logout
- Role-based access (USER / ADMIN)

### 💳 Banking Operations
- View account balance
- Fund transfer between accounts
- Transaction history
- Monthly transaction reports
- Secure User → Account → Transaction mapping

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


Frontend will start on:

http://localhost:4200

# ScreenShots
![dashboard page](<Screenshot 2026-01-27 215735.png>)

![Admin page](<Screenshot 2026-01-27 215800.png>)

![transactions report](<Screenshot 2025-12-22 183704.png>)

![send money](<Screenshot 2025-12-22 184333.png>)

![transactions history](<Screenshot 2025-12-22 183620.png>)

-> API Highlights

POST /api/auth/login – User authentication

GET /api/accounts/my – Fetch user account balance

POST /api/transactions/transfer – Transfer funds

GET /api/transactions – Transaction history

GET /api/transactions/monthly-report – Monthly report

🎯 Learning Outcomes

Implemented JWT-based authentication in a full-stack app

Designed RESTful APIs for real banking use cases

Built a modern Angular UI with standalone components

Improved understanding of secure application architecture

📌 Future Enhancements

   PDF/CSV statement download

   Two-factor authentication (2FA)

   Email notifications

   Admin analytics dashboard

Developed by-- Abishake A

📜 Disclaimer

This project is developed for educational purposes only and does not represent a real banking system.

