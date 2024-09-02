import pytest
import json
from flask import Flask
from app import app  # Import your Flask app

# Define the app for testing
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_no_data(client):
    response = client.post('/download_configuration', json={
        'columns': ['Word', 'Translation'],
        'format': 'json'
    })
    assert response.status_code == 400
    assert json.loads(response.data) == {"error": "No data available to download"}

def test_no_columns(client):
    global data
    data = [{'Word': 'Hello', 'Translation': 'Bonjour'}, {'Word': 'Bye', 'Translation': 'Au revoir'}]
    response = client.post('/download_configuration', json={
        'columns': [],
        'format': 'json'
    })
    assert response.status_code == 400
    assert json.loads(response.data) == {"error": "No columns selected"}

def test_invalid_format(client):
    global data
    data = [{'Word': 'Hello', 'Translation': 'Bonjour'}, {'Word': 'Bye', 'Translation': 'Au revoir'}]
    response = client.post('/download_configuration', json={
        'columns': ['Word', 'Translation'],
        'format': 'invalid_format'
    })
    assert response.status_code == 400
    assert json.loads(response.data) == {"error": "Unsupported format"}

def test_json_format(client):
    global data
    data = [{'Word': 'Hello', 'Translation': 'Bonjour'}, {'Word': 'Bye', 'Translation': 'Au revoir'}]
    response = client.post('/download_configuration', json={
        'columns': ['Word'],
        'format': 'json'
    })
    assert response.status_code == 200
    response_data = json.loads(response.data)
    assert response_data == [{'Word': 'Hello'}, {'Word': 'Bye'}]
    assert response.headers['Content-Disposition'] == 'attachment; filename=configuration.json'

def test_csv_format(client):
    global data
    data = [{'Word': 'Hello', 'Translation': 'Bonjour'}, {'Word': 'Bye', 'Translation': 'Au revoir'}]
    response = client.post('/download_configuration', json={
        'columns': ['Word'],
        'format': 'csv'
    })
    assert response.status_code == 200
    assert response.headers['Content-Disposition'] == 'attachment; filename=configuration.csv'
    assert response.headers['Content-Type'] == 'text/csv'
    assert b'Word' in response.data
    assert b'Hello' in response.data

def test_excel_format(client):
    global data
    data = [{'Word': 'Hello', 'Translation': 'Bonjour'}, {'Word': 'Bye', 'Translation': 'Au revoir'}]
    response = client.post('/download_configuration', json={
        'columns': ['Word'],
        'format': 'excel'
    })
    assert response.status_code == 200
    assert response.headers['Content-Disposition'] == 'attachment; filename=configuration.xlsx'
    assert response.headers['Content-Type'] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    assert b'Word' in response.data
    assert b'Hello' in response.data
