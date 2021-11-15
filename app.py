from flask import Flask, render_template
from flask import request

# __name__ holds the name of the current Python module
# Flask sets up some paths behind the scenes with this
app = Flask(__name__)

# @app.route is a decorator that turns a regular Python function
# into a Flask view function
@app.route('/')
def index():
	return render_template('index.html')

@app.route('/result', methods=['POST'])
def send():
	names = request.form.getlist('name')
	emails = request.form.getlist('email')
	return render_template('result.html')