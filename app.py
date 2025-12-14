from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import datetime

# Minimal Flask app for frontend-first MVP
app = Flask(__name__)
app.secret_key = "dev-secret-key-change-me"  # Replace with secure key in production

# In-memory stores for demo (will move to DB later)
USERS = {}  # email -> {name, phone, role, password_hash}
APPOINTMENTS = []  # list of dicts
TRANSPORT_PROVIDERS = [
    {"id": 1, "name": "SafeRide Medical Transport"},
    {"id": 2, "name": "CareVan Services"},
]

# Helpers
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if session.get('user', {}).get('role') != role:
                flash('Permission denied')
                return redirect(url_for('index'))
            return f(*args, **kwargs)
        return decorated
    return decorator

@app.route('/')
def index():
    if 'user' in session:
        role = session['user']['role']
        if role == 'admin':
            return redirect(url_for('admin_dashboard'))
        return redirect(url_for('patient_dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        password = request.form.get('password')
        # Basic validation
        if not (name and email and password):
            flash('Name, email, and password are required')
            return redirect(url_for('register'))
        if email in USERS:
            flash('Email already registered')
            return redirect(url_for('register'))
        USERS[email] = {
            'name': name,
            'phone': phone,
            'role': 'patient',
            'password_hash': generate_password_hash(password)
        }
        flash('Registration successful — please log in')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    # For demo: a single admin credential
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        # Admin quick-login
        if email == 'admin@clinic.local' and password == 'adminpass':
            session['user'] = {'email': email, 'name': 'Admin', 'role': 'admin'}
            flash('Logged in as admin')
            return redirect(url_for('admin_dashboard'))
        user = USERS.get(email)
        if not user or not check_password_hash(user['password_hash'], password):
            flash('Invalid credentials')
            return redirect(url_for('login'))
        session['user'] = {'email': email, 'name': user['name'], 'role': user['role']}
        flash('Logged in')
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user', None)
    flash('Logged out')
    return redirect(url_for('index'))

@app.route('/book', methods=['GET', 'POST'])
@login_required
def book():
    # Patient booking page
    if session['user']['role'] != 'patient':
        flash('Only patients can book appointments')
        return redirect(url_for('index'))
    if request.method == 'POST':
        doctor = request.form.get('doctor')
        date = request.form.get('date')
        time = request.form.get('time')
        needs_transport = request.form.get('needs_transport') == 'yes'
        pickup_address = request.form.get('pickup_address') if needs_transport else None
        appt = {
            'id': len(APPOINTMENTS) + 1,
            'patient_email': session['user']['email'],
            'patient_name': session['user']['name'],
            'doctor': doctor,
            'datetime': f"{date} {time}",
            'status': 'Requested',
            'transport': {
                'requested': needs_transport,
                'pickup_address': pickup_address,
                'status': 'Requested' if needs_transport else 'N/A',
                'provider': None
            }
        }
        APPOINTMENTS.append(appt)
        flash('Appointment requested')
        return redirect(url_for('patient_dashboard'))
    # Simple list of doctors/hospitals for selection
    providers = ["Dr. Jane Smith - Internal Medicine", "City Clinic - Outpatient"]
    return render_template('book.html', providers=providers)

@app.route('/patient/dashboard')
@login_required
def patient_dashboard():
    if session['user']['role'] != 'patient':
        flash('Access denied')
        return redirect(url_for('index'))
    user_email = session['user']['email']
    user_appts = [a for a in APPOINTMENTS if a['patient_email'] == user_email]
    return render_template('patient_dashboard.html', appointments=user_appts)

@app.route('/admin/dashboard')
@login_required
@role_required('admin')
def admin_dashboard():
    return render_template('admin_dashboard.html', appointments=APPOINTMENTS, providers=TRANSPORT_PROVIDERS)

@app.route('/admin/assign', methods=['POST'])
@login_required
@role_required('admin')
def admin_assign():
    appt_id = int(request.form.get('appointment_id'))
    provider_id = int(request.form.get('provider_id'))
    for a in APPOINTMENTS:
        if a['id'] == appt_id:
            a['transport']['provider'] = next((p for p in TRANSPORT_PROVIDERS if p['id'] == provider_id), None)
            a['transport']['status'] = 'Confirmed'
            a['status'] = 'Transport Confirmed'
            flash('Assigned transport')
            break
    return redirect(url_for('admin_dashboard'))

@app.route('/admin/update_status', methods=['POST'])
@login_required
@role_required('admin')
def admin_update_status():
    appt_id = int(request.form.get('appointment_id'))
    new_status = request.form.get('status')
    for a in APPOINTMENTS:
        if a['id'] == appt_id:
            a['status'] = new_status
            if not a['transport']['requested']:
                a['transport']['status'] = 'N/A'
            flash('Updated status')
            break
    return redirect(url_for('admin_dashboard'))

# Simple API to fetch providers (front-end convenience)
@app.route('/api/providers')
def api_providers():
    return jsonify(TRANSPORT_PROVIDERS)

# Disclaimer route fragment (could be included in footer)
@app.context_processor
def inject_disclaimer():
    return dict(transport_disclaimer='Transport services are provided by third parties.')

if __name__ == '__main__':
    app.run(debug=True)
