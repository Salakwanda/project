from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy models (prepared for later DB integration)
# These are not active yet — they provide a schema to migrate to later.

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30))
    role = db.Column(db.String(20), nullable=False)  # 'patient' or 'admin'
    password_hash = db.Column(db.String(255), nullable=False)
    profile = db.relationship('PatientProfile', backref='user', uselist=False)

class PatientProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    address = db.Column(db.String(255))

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor = db.Column(db.String(255))
    scheduled_at = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='Requested')
    transport_request = db.relationship('TransportRequest', backref='appointment', uselist=False)

class TransportRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'), nullable=False)
    pickup_address = db.Column(db.String(255))
    status = db.Column(db.String(50), default='Requested')
    provider_id = db.Column(db.Integer, db.ForeignKey('transport_provider.id'))

class TransportProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    contact = db.Column(db.String(120))
