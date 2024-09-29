from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from backend.models.user_model import User
from .forms import LoginForm, RegisterForm, ConfirmPasswordForm # Import the form classes

auth_route = Blueprint('auth', __name__, url_prefix='/auth')

@auth_route.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()  # Create a form instance
    if form.validate_on_submit():  # This checks CSRF and form validation
        username = form.username.data
        password = form.password.data
        user = User.get_by_username(username)
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('user.learn'))
        
        flash('Invalid credentials', 'danger')
    
    return render_template('login.html', form=form)  # Pass the form to the template

@auth_route.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()  # Create a form instance
    if form.validate_on_submit():  # This checks CSRF and form validation
        username = form.username.data
        password = form.password.data
        confirm_password = form.confirm_password.data
        
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

    return render_template('register.html', form=form)  # Pass the form to the template

@auth_route.route('/delete_user', methods=['GET', 'POST'])
@login_required
def delete_user():
    form = ConfirmPasswordForm()  # Create form instance
    if form.validate_on_submit():  # Validates CSRF and form
        password = form.password.data

        if current_user.verify_password(password):  # verify_password jest nierozpoznawana
            user_id = current_user.get_id()
            username = current_user.username

            # Delete the user account
            if User.delete(user_id):
                logout_user()
                flash(f"User '{username}' has been successfully deleted.", 'success')
                return redirect(url_for('user.index'))
            else:
                flash(f"An error occurred while deleting the account '{username}'.", 'danger')
                return redirect(url_for('user.profile'))
        else:
            flash('Incorrect password, please try again.', 'danger')

    return render_template('confirm_delete.html', form=form)  # Pass the form to the template

@auth_route.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('user.index'))
