# Belpw Health — Frontend MVP (Flask)

This repository contains a frontend-first MVP for a private healthcare appointment and transport request system.

Features in this stage:

- User registration and login (session; in-memory demo store)
- Appointment booking with optional transport request
- Patient dashboard to view appointments
- Admin dashboard to view appointments and assign transport
- Mobile-first responsive templates
- Improved modern UI and subtle animations (CSS + JS)

Security notes:

- Passwords are hashed using Werkzeug
- Session-based authentication is used

How to run (development):

1. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

2. Start the dev server

```powershell
python app.py
```

3. Open http://127.0.0.1:5000 in your browser

Recommended (create a venv):

Windows (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

macOS / Linux (bash):

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Demo admin credentials:

- Email: `admin@clinic.local`
- Password: `adminpass`

Next steps:

- Replace in-memory stores with SQLAlchemy models and migrate to SQLite
- Add server-side validation and tests
- Expand transport management features
