# Student Management System

A full-stack app where **students** see a live points leaderboard and **teachers** award or deduct points.

| Part | Technology |
|---|---|
| Mobile app | React Native (Expo SDK 58), React Navigation, Redux Toolkit (`createAsyncThunk`), Context API, Expo SecureStore |
| Backend | Spring Boot 3.5, Spring Data JPA, Spring Security + JWT, Hibernate Validator |
| Database | PostgreSQL |

```
student-management-system/
├── backend/     Spring Boot REST API (Controller → Service → Repository)
├── mobile/      Expo React Native app
└── database/    schema.sql (reference copy of the tables)
```

---

## 1. What you need installed

- **Java JDK 17 or newer**: check with `java -version`
- **PostgreSQL** (any recent version) with pgAdmin, or `psql`
- **Node.js LTS (20 or newer)**: check with `node -v`
- **Expo Go** app on your phone (Play Store / App Store), or an Android emulator

Maven does **not** need to be installed: the project includes the Maven wrapper (`mvnw`).

---

## 2. Start the database

Open pgAdmin (or `psql`) and run:

```sql
CREATE DATABASE studentdb;
```

The tables are created automatically when the backend starts.

The backend expects username `postgres` and password `postgres`. If your PostgreSQL password is different, change it in
`backend/src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_PASSWORD
```

---

## 3. Start the backend

```bash
cd backend
# Windows
mvnw.cmd spring-boot:run
# Mac / Linux
./mvnw spring-boot:run
```

The first run downloads dependencies (a few minutes). It is ready when you see
`Started StudentManagementApplication`. The API runs at `http://localhost:8080/api/v1`.

On the very first start, demo accounts are created. **All passwords: `password123`**

| Role | Email |
|---|---|
| Teacher | `teacher@school.com` |
| Students | `aarav@school.com`, `diya@school.com`, `rohan@school.com`, `ananya@school.com`, `kabir@school.com`, `meera@school.com`, `vihaan@school.com`, `isha@school.com` |

(You can also open the project in IntelliJ IDEA and run `StudentManagementApplication`.)

---

## 4. Start the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iPhone). Press `a` to open an Android emulator.

**The phone and the laptop must be on the same Wi-Fi.** The app automatically uses the laptop's IP address
(the same one Expo uses) with port 8080, so no IP needs to be typed in. The login screen shows the server address
at the bottom.

If you need a different backend address, create `mobile/.env` with:

```
EXPO_PUBLIC_API_URL=http://192.168.1.5:8080/api/v1
```

---

## 5. REST API

Base URL: `/api/v1`. Protected endpoints need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Who | Purpose | Success | Errors |
|---|---|---|---|---|---|
| POST | `/auth/register` | Public | Create account (`name`, `email`, `password`, `role`) | 201 | 400, 409 |
| POST | `/auth/login` | Public | Log in (`email`, `password`) → token + user | 200 | 400, 401 |
| GET | `/auth/me` | Logged in | Current user (used to restore the session on app start) | 200 | 401 |
| GET | `/leaderboard?page=0&size=10&sortBy=points&direction=desc` | Logged in | Paginated, sorted rank list | 200 | 400, 401 |
| GET | `/students/me` | STUDENT | Own points, rank and class size | 200 | 401, 403 |
| POST | `/students/{studentId}/points` | TEACHER | Award (+) or deduct (−) points (`points`, `reason`) | 200 | 400, 401, 403, 404 |

Leaderboard parameters: `page` ≥ 0, `size` 1–50, `sortBy` = `points` or `name`, `direction` = `asc` or `desc`.

**Example: login**
```json
POST /api/v1/auth/login
{ "email": "teacher@school.com", "password": "password123" }

200 OK
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInMs": 604800000,
  "user": { "id": 1, "name": "Mrs. Sharma", "email": "teacher@school.com", "role": "TEACHER", "studentId": null }
}
```

**Example: award points**
```json
POST /api/v1/students/8/points
{ "points": 40, "reason": "Quiz winner" }

200 OK
{ "studentId": 8, "name": "Isha Kulkarni", "email": "isha@school.com", "totalPoints": 50, "rank": 6 }
```

**Every error has the same JSON shape** (built by `GlobalExceptionHandler` with `@RestControllerAdvice`):
```json
{
  "timestamp": "2026-11-21T17:33:16Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/students/8/points",
  "fieldErrors": { "points": "Points must be between -1000 and 1000" }
}
```

---

## 6. How the requirements are met

**Authentication & RBAC**
- Passwords are stored as BCrypt hashes. Login returns a signed JWT (7-day expiry) plus the user profile and role.
- Backend: `SecurityConfig` allows `POST /students/{id}/points` for `TEACHER` only and `GET /students/me` for `STUDENT` only. Others get 403.
- App: `AppNavigator` registers different screens per role. Students have no Award screen at all, and logged-out users only have Login/Register.

**Redux & state**
- `authSlice`: login / register / logout / restoreSession thunks; token and user saved in **Expo SecureStore**, so the session survives app restarts. An expired token logs the user out automatically.
- `leaderboardSlice`: page loading with "load more" (infinite scroll), pull-to-refresh, sort direction, the student's own standing, and `awardPoints`.
- `ThemeContext`: Day / Night switch in the header of every screen; the choice is saved on the device.

**Rank list & points**
- Rank order: **points high → low; equal points → name A → Z; then student id**. No two students ever share a position, and the order never changes randomly.
- After a teacher submits points, the backend saves them (and logs them in `point_transactions`), and the Redux store immediately re-sorts the list and recalculates ranks.
- Students see a read-only list with their own row highlighted and their rank/points at the top.

**Backend & SQL**
- Tables: `users` (unique email), `student_profiles` (one per student, FK to users, `total_points` default 0), `point_transactions` (FKs to student and teacher). See `database/schema.sql`.
- Pagination and sorting are done in the database with Spring Data `PageRequest` and `Sort`.
- Points cannot be 0, must be between −1000 and 1000, and a total can never go below 0. Row locking prevents two teachers overwriting each other.

---

## 7. Suggested demo flow

1. Start PostgreSQL → backend → `npx expo start`, and open the app on the phone.
2. Register a new **student** account → show the "My standing" screen (rank, points, highlighted row).
3. Toggle **Night** mode → every screen changes. Close and reopen the app → still logged in.
4. Log out → log in as `teacher@school.com` → tap a student → award +50 → the list reorders instantly.
5. Try an invalid value (e.g. deduct more points than the student has) → readable error message.
6. Switch "Highest first / Lowest first" and scroll down to load more pages (server-side pagination).

---

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| App says "Cannot reach the server" | Backend running? Phone on the same Wi-Fi as the laptop? On Windows, allow **Java** through the firewall (or allow port 8080) on *Private* networks. |
| `password authentication failed for user "postgres"` | Put your PostgreSQL password in `application.properties`. |
| `database "studentdb" does not exist` | Run `CREATE DATABASE studentdb;` |
| `Port 8080 already in use` | Close the other program, or change `server.port` (and use `EXPO_PUBLIC_API_URL`). |
| Want fresh demo data | Drop and recreate the `studentdb` database, then restart the backend. |
