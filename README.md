#  JaMoveo - Collaborative Music Rehearsal App

Welcome to **JaMoveo**, a real-time collaborative platform where an admin (conductor) selects a song, and all musicians (clients) join in to rehearse with synchronized lyrics and chords. Built with ❤️ using Node.js, React, Socket.IO, MongoDB, and Cloudinary.

---

## Live Demo


---

## 👥 Demo Accounts

###  Admin Login
- **Username:** `JaMoveo`
- **Password:** `JaMoveo12!@`

### Musician Accounts
- **Piano Player**
  - **Username:** `JaMoveoPiano`
  - **Password:** `JaMoveo12!@`

- **Drummer**
  - **Username:** `JaMoveoDrums`
  - **Password:** `JaMoveo12!@`

---

##  How to Use

### 1. **Login as Admin or Musician**
- Visit the login page.
- Use one of the provided usernames and passwords.
- Admin users will be redirected to the **Admin Control Panel**.
- Musicians will join the **Waiting Room**.

### 2. **Admin Chooses a Song**
- Admin searches for a song using the search bar.
- Admin clicks on a song from the results.
- The system scrapes the selected song's lyrics & chords.
- Admin reviews and confirms to **start the rehearsal**.

### 3. **Musicians Join Rehearsal**
- All logged-in users will receive the selected song.
- Lyrics and chords appear in real time.
- Players see who is online and playing.

### 4. **Admin Controls the Rehearsal**
- Admin can stop the rehearsal at any time using the **"Stop"** button.
- All clients will be notified instantly.

---

##  Tech Stack

| Area         | Tech                          |
|--------------|-------------------------------|
| Frontend     | React, Tailwind CSS, Axios    |
| Backend      | Node.js, Express, Socket.IO   |
| Database     | MongoDB + Mongoose            |
| Auth         | JWT (via HTTP-only cookies)   |
| Uploads      | Cloudinary (for profile images) |
| Real-Time    | Socket.IO (with JWT auth)     |
| Scraping     | Cheerio + Axios for lyrics/chords |

---

##  Developer Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas or local instance
- Cloudinary account (for storing profile images)

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/JaMoveo.git
cd JaMoveo
