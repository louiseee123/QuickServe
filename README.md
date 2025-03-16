# QuickServe - CCTC Document Request System

## Local Setup Instructions

### Prerequisites
1. Node.js (v20 or higher)
2. XAMPP (for MySQL database)
3. NPM or Yarn package manager

### Database Setup
1. Start XAMPP Control Panel
2. Start Apache and MySQL services
3. Open phpMyAdmin (http://localhost/phpmyadmin)
4. Create a new database named `quickserve`
5. Import the `database.sql` file

### Application Setup
1. Clone or download the project files
2. Create a `.env` file based on `config.example.env`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5000 in your browser

### Default Accounts

#### Admin Account
- Username: admin
- Password: admin123

#### Test User Account
- Username: user
- Password: user123

### Project Structure
```
/
├── client/               # Frontend React code
├── server/              # Backend Express code
├── shared/              # Shared types and schemas
├── database.sql         # MySQL database schema
└── config.example.env   # Example configuration
```

## Features
- User authentication (login/register)
- Document request submission
- Request status tracking
- Admin dashboard for request management
- Email notifications for status updates
