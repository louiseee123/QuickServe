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
5. Import the `quickserve.sql` file

### Application Setup
1. Clone or download the project files
2. Create a `.env` file based on `config.example.env`
   ```env
   # MySQL Database Configuration for XAMPP
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=quickserve
   DB_PORT=3306

   # Session Secret (Change this to a secure random string)
   SESSION_SECRET=your-secret-key-here
   ```
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
├── quickserve.sql      # MySQL database schema
└── config.example.env   # Example configuration
```

## Features
- User authentication (login/register)
- Document request submission
- Request status tracking with real-time updates
- Admin dashboard for request management
- Email notifications for status updates

## Real-time Updates
The application uses WebSocket for real-time status updates:
- Students receive instant notifications when their document status changes
- The requests list automatically updates without refreshing
- Connection status is logged in the browser console

## Troubleshooting
If you encounter any issues:
1. Make sure XAMPP MySQL service is running
2. Check that the database connection details in `.env` are correct
3. Verify that port 5000 is available on your machine
4. Check the browser console for WebSocket connection status