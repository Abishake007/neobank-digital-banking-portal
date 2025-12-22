# NeoBank – Digital Banking Portal

NeoBank is a full-stack digital banking web application that simulates core online banking functionalities such as secure authentication, account management, fund transfers, transaction history, reports, and a modern dark-mode UI.

This project demonstrates real-world banking workflows using a clean full-stack architecture.

---

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Secure user login and logout
- Role-based access (USER / ADMIN)

### 💳 Banking Operations
- View account balance
- Fund transfer between accounts
- Transaction history
- Monthly transaction reports
- Secure User → Account → Transaction mapping

### 🎨 User Interface
- Responsive Angular UI
- Professional banking-style dashboard
- Dark mode support
- Bootstrap 5 + Bootstrap Icons
- Smooth hover effects and animations

---

## 🛠️ Tech Stack

### Backend
- Java
- Spring Boot
- Spring Security
- JWT (JSON Web Token)
- MySQL
- RESTful APIs

### Frontend
- Angular (Standalone Components)
- TypeScript
- Bootstrap 5
- Bootstrap Icons
- Chart.js (optional for reports)

---

## 📁 Project Structure

NeoBank/
├── backend/ # Spring Boot application
│ ├── src/
│ ├── pom.xml
│ └── application.properties
│
├── frontend/ # Angular application
│ ├── src/
│ ├── angular.json
│ └── package.json
│
└── README.md


---

## ⚙️ Setup & Run Instructions

### 🔹 Backend (Spring Boot)

1. Navigate to backend folder:
   ```bash
   cd backend


Configure MySQL in application.properties

Run the application:

mvn spring-boot:run


Backend will start on:

http://localhost:8080

🔹 Frontend (Angular)

Navigate to frontend folder:

cd frontend


Install dependencies:

npm install


Start Angular app:

ng serve


Frontend will start on:

http://localhost:4200

# ScreenShots
![dashboard page](<Screenshot 2025-12-22 184022.png>)

![transactions report](<Screenshot 2025-12-22 183704.png>)

![send money](<Screenshot 2025-12-22 184333.png>)

![transactions history](<Screenshot 2025-12-22 183620.png>)

🔑 API Highlights

POST /api/auth/login – User authentication

GET /api/accounts/my – Fetch user account balance

POST /api/transactions/transfer – Transfer funds

GET /api/transactions – Transaction history

GET /api/transactions/monthly-report – Monthly report

🎯 Learning Outcomes

Implemented JWT-based authentication in a full-stack app

Designed RESTful APIs for real banking use cases

Built a modern Angular UI with standalone components

Implemented dark mode using CSS variables

Improved understanding of secure application architecture

📌 Future Enhancements

PDF/CSV statement download

Two-factor authentication (2FA)

Email notifications

Admin analytics dashboard

👤 Author

Abishake A
Final Year – Computer Science and Engineering

📜 Disclaimer

This project is developed for educational purposes only and does not represent a real banking system.

