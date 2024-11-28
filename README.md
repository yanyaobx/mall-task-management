# Mall Task Management System

A **WeChat Mini Program** designed to streamline daily task management for malls. The system provides role-based interfaces for administrators and merchants, automates task allocation, tracks task completion with photo verification, and ensures real-time updates.

---

## Features

### Administrator Features:
- **Dashboard**: Monitor overall task progress for all merchants in real time.
- **Task Monitoring**: Verify task completion with uploaded photos.
- **User Tracking**: Track online users and their statuses.
- **History Records**: Access historical data for auditing and analysis.

### Merchant Features:
- **Daily Task Management**: Automatically receive daily tasks, track their progress, and upload proof of completion.
- **Photo Upload**: Capture and upload photos for task completion verification.
- **History Access**: Review past task records for self-assessment.
- **Notifications**: Receive alerts for pending or overdue tasks.

---

## Technologies Used

### Frontend:
- **WeChat Mini Program Framework**: WXML, WXSS, JavaScript.
- **Dynamic UI**: Role-based TabBar and customized views for different users.

### Backend:
- **Cloud Functions**:
  - `getTasks`: Fetch and allocate daily tasks.
  - `updateTaskPhoto`: Handle photo uploads and update task statuses.
  - `getAllUserStatus`: Provide real-time user and task data for administrators.
  - `login/logout`: Secure user authentication with JWT.
- **Node.js**: Core backend logic for cloud functions.

### Database:
- **Cloud Database**:
  - `tasks`: Stores task details (status, photo proof, assignments).
  - `merchants`: Manages merchant profiles and task ownership.
  - `admins`: Stores administrator profiles and permissions.
  - `sessions`: Tracks user sessions with JWT tokens.

### Tools:
- **JWT**: For secure user authentication and session management.
- **Camera API**: WeChat Mini Program camera integration for photo capture.

---

## Project Structure

```plaintext
Mall Task Management
├── cloudfunctions/
│   ├── getTasks/
│   ├── updateTaskPhoto/
│   ├── getAllUserStatus/
│   ├── login/
│   └── logout/
├── miniprogram/
│   ├── pages/
│   │   ├── admin/
│   │   ├── task/
│   │   ├── history/
│   │   ├── voip/
│   │   ├── user-center/
│   │   └── photoCapture/
│   ├── utils/
│   └── custom-tab-bar/
├── README.md
└── package.json
```

---

## Installation and Deployment

### Prerequisites:
- WeChat Developer Tools installed.
- CloudBase environment configured in the WeChat Mini Program.

### Steps:
1. Clone this repository:
   git clone https://github.com/yanyaobx/mall-task-management.git
   cd mall-task-management
2. Open the project in **WeChat Developer Tools**.
3. Configure CloudBase in the `project.config.json` file.
4. Deploy cloud functions:
   - Navigate to the `cloudfunctions` folder.
   - Deploy each function via WeChat Developer Tools.
5. Run the Mini Program on the emulator or a connected device.

---

## Usage

1. **Login**: Merchants and admins can log in using assigned credentials.
2. **Admin Features**:
   - Navigate to the "Dashboard" tab to monitor and manage tasks.
   - Use the "Photos" tab to verify task completions.
3. **Merchant Features**:
   - View and manage daily tasks in the "Tasks" tab.
   - Upload task completion proof via the "Photo Capture" page.

---

## Screenshots

### Admin Dashboard
*(Insert an image or placeholder)*

### Task Management
*(Insert an image or placeholder)*

### Photo Upload
*(Insert an image or placeholder)*

---

## Future Enhancements

- **Push Notifications**: Notify merchants of upcoming task deadlines.
- **Analytics Dashboard**: Provide detailed insights for admins.
- **Performance Optimization**: Use Redis caching for faster database queries.

---


## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For questions or feedback, contact:
- **Author**: yanyaobx
- **GitHub**: [yanyaobx](https://github.com/yanyaobx)
