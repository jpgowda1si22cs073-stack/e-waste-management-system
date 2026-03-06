# E-Waste Management System (Client)

React frontend for the E-Waste Management System.

## Prerequisites

- Node.js 18+ recommended
- Python available for backend (see backend section)
- Firebase project (Authentication + Firestore)

## Frontend Setup

From `e-waste-management-system/client`:

```powershell
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## Firebase Configuration

Update `src/components/FirebaseConfig.jsx` with your Firebase Web app config.

Required Firebase services:

- Authentication: enable `Email/Password`
- Firestore Database: create database and publish rules
- Storage: optional for schedule image upload (see note below)

## Firestore Rules

Use these rules for current app flows (`users` + `ewasteSchedules`):

```txt
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /users/{userId} {
			allow create, read, update: if request.auth != null && request.auth.uid == userId;
		}

		match /ewasteSchedules/{scheduleId} {
			allow create: if request.auth != null
				&& request.resource.data.lenderId == request.auth.uid;
			allow read: if request.auth != null;
			allow update: if request.auth != null;
		}
	}
}
```

## Storage Note

Schedule image upload uses Firebase Storage. If your Firebase project/plan does not allow Storage, scheduling still works without image upload.

- Image field in schedule form is optional.
- If Storage is unavailable, submit schedule without image.

## Backend Setup (Classifier API)

From `e-waste-management-system/server`:

```powershell
python server.py
```

Backend runs at `http://127.0.0.1:5000`.

The frontend analysis page calls `POST /classify` on port `5000`.

## Model and Dataset

- Dataset path used by training script:
	`server/archive (5)/dataset`
- Training script:
	`server/model.py`
- Model artifacts:
	`server/my_model.h5`, `server/my_model.keras`

## Quick Run (Full Stack)

Terminal 1:

```powershell
cd "..\server"
python server.py
```

Terminal 2:

```powershell
npm start
```

## Troubleshooting

- `export 'auth'/'db' not found`: verify `FirebaseConfig.jsx` exports `auth` and `db`.
- `Missing or insufficient permissions`: Firestore rules are blocking writes.
- `Failed to fetch` on analysis: backend is not running or model failed to load.
- Storage permission/plan errors: submit schedule without image or configure Storage/rules.
