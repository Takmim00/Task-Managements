
```markdown
# 📝 Task Management Application

A simple, real-time task management application where users can add, edit, delete, and reorder tasks with a drag-and-drop interface. The app categorizes tasks into **To-Do, In Progress, and Done**, ensuring seamless task tracking. Changes are instantly saved to the database, providing a persistent and real-time experience.

## 🚀 Live Demo
🔗 [Live Application](https://task-management-61d8b.web.app) 

---

## 📌 Features

✅ User authentication with Google Sign-in (Firebase)  
✅ Drag-and-drop task management  
✅ Categories: To-Do, In Progress, Done  
✅ Instant data synchronization (MongoDB + WebSockets)  
✅ Modern, responsive UI with dark mode support  
✅ Optimistic UI updates for a seamless experience  

---

## 🛠 Technologies Used

**Frontend:**  
- ⚡ Vite.js + React  
- 🎨 Tailwind CSS  
- 🔄 DnD Kit for drag-and-drop  

**Backend:**  
- 🌐 Express.js  
- 📦 MongoDB with Change Streams  
- 🔌 WebSockets (Socket.io)  

**Authentication:**  
- 🔐 Firebase Authentication (Google Sign-in)  

---

## 📦 Dependencies

```json
{
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@tailwindcss/vite": "^4.0.7",
    "axios": "^1.7.9",
    "firebase": "^11.3.1",
    "localforage": "^1.10.0",
    "match-sorter": "^8.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.2.0",
    "react-toastify": "^11.0.3",
    "socket.io-client": "^4.8.1",
    "sort-by": "^1.2.0",
    "sweetalert2": "^11.17.2",
    "tailwindcss": "^4.0.7"
}
```

---

## 📥 Installation Guide

### Prerequisites:
- Node.js (v16+)
- MongoDB (local or cloud)
- Firebase account for authentication setup

### Steps:

#### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

#### 2️⃣ Install Dependencies
```sh
npm install
```

#### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory and add:
```env
MONGO_URI=your_mongodb_connection_string
FIREBASE_API_KEY=your_firebase_api_key
```

#### 4️⃣ Start the Development Server
```sh
npm run dev
```

#### 5️⃣ Start the Backend Server
```sh
cd server
npm install
npm run start
```

---

## 🎯 Future Improvements

- 🔄 Offline support with IndexedDB  
- 📆 Task due dates & reminders  
- 📊 Analytics & task completion reports  

---

## 🤝 Contributing

Feel free to fork the project and submit pull requests. Open issues if you find bugs or have feature suggestions.

