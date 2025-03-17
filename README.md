

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
