from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, PasswordField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired()])

class ProfileForm(FlaskForm):
    language_1 = SelectField('Język 1', choices=[], validators=[DataRequired()])
    language_2 = SelectField('Język 2', choices=[], validators=[DataRequired()])
    theme = SelectField('Motyw', choices=[('light', 'Jasny'), ('dark', 'Ciemny')], validators=[DataRequired()])
    notifications = SelectField('Powiadomienia', choices=[('email', 'Email'), ('sms', 'SMS'), ('none', 'Brak')], validators=[DataRequired()])
    privacy = SelectField('Prywatność', choices=[('public', 'Publiczny'), ('private', 'Prywatny')], validators=[DataRequired()])
    submit = SubmitField('Zapisz ustawienia')

class DeleteAccountForm(FlaskForm):
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Delete Account')