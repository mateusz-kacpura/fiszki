from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import login_user, logout_user, login_required
from backend.models.user_model import User

auth_route = Blueprint('auth', __name__, url_prefix='/auth')

@auth_route.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.get_by_username(username)
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('user.learn'))
        
        flash('Invalid credentials', 'danger')
    
    return render_template('login.html')

@auth_route.route('/register', methods=['GET', 'POST'])
def register():
    # Uzyskaj dostęp do konfiguracji przy użyciu current_app
    if not current_app.config.get('REGISTRATION_ENABLED', True):  # Domyślnie włączona
        flash('Registration is currently disabled', 'danger')
        return redirect(url_for('auth.login'))
        
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return redirect(url_for('auth.register'))

        if User.get_by_username(username):
            flash('Username already exists', 'danger')
            return redirect(url_for('auth.register'))

        hashed_password = generate_password_hash(password)
        user = User(username=username, password=hashed_password)
        User.save(user)
        flash('Registration successful, please login', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_route.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index.index'))