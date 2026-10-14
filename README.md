# 🎓 CampusHub — College Event Management System

A full-stack web application that helps students discover, 
browse, and register for college events. Admin can manage 
events, post notices, and track student registrations 
through a dedicated dashboard.

---
### Student
- 🔐 Secure Sign Up & Login (bcrypt password hashing)
- 📅 Browse all upcoming events
- 🔍 Search & filter events by category
- ⏱️ Live countdown timer for next event
- 🎟️ Register for events with details form
- 📋 View My Registered Events
- 💬 Share thoughts & encouragement

### Admin
- 🛡️ Secure Admin Login
- ➕ Add & Delete Events
- 📢 Post & Delete Notices
- 👥 View all student registrations with details
- 🗑️ Auto-deletion of expired events

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, Tailwind CSS, JavaScript |
| Backend    | Node.js, Express.js               |
| Database   | MySQL                             |
| Security   | bcryptjs, express-session         |
| Tools      | XAMPP, phpMyAdmin, VS Code, nodemon |

---

## 🗄️ Database Tables

- **users** — Student information & authentication
- **events** — Event details & management  
- **registrations** — Student event registrations
- **notices** — Admin announcements
- **thoughts** — Student thoughts & feedback

---

## 🚀 How to Run

### Prerequisites
- Node.js installed
- XAMPP installed (Apache + MySQL)

### Steps

1. **Clone the repository**
   git clone https://github.com/LalitaDubole/CampusHub.git
   cd CampusHub

2. **Install dependencies**
   npm install

3. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache & MySQL

4. **Setup Database**
   - Open http://localhost/phpmyadmin
   - Create database: campushub
   - Import the SQL file or run the queries manually

5. **Configure .env file**
   Create a .env file in root:
   
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=campushub
   SESSION_SECRET=campushub_secret_123

6. **Start the server**
   npm run dev

7. **Open in browser**
   http://localhost:3000

---

## 👤 Admin Credentials
- Username: admin
- Password: admin123

---

## 📁 Project Structure

campus-event/
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/script.js
├── routes/
│   ├── auth.js
│   ├── events.js
│   └── admin.js
├── controllers/
│   ├── authController.js
│   └── eventController.js
├── db/
│   └── connection.js
├── middleware/
│   └── isAdmin.js
├── .env
├── server.js
└── package.json


## 🔮 Future Enhancements

- 📧 Email notifications for new events
- 📱 Mobile app version
- 📊 Analytics dashboard for admin
- 🎫 QR code based attendance system
- 🖼️ Event image upload feature

---

## 👩‍💻 Developer

Developed by [Lalita Dubole]
MCA Student | MET'S Institude Of Management ,Nashik

---

