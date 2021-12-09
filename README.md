# Secret Santa Web App

Made by Núcleo de Estudantes de Engenharia de Computadores e Telemática, University of Aveiro

## Setup
Create a Python Virtual Environment:
```
$ python3 -m venv env
```
Activate the environment:
```
$ source env/bin/activate
```
Install the requirements:
```
$ pip install -r requirements.txt
```
Setup Flask environment variables:
```
$ export FLASK_APP=app
$ export FLASK_ENV=development
```
Run the app:
```
$ flask run
```
The app will be running at http://127.0.0.1:5000/

## Structure
- **/data**: used to temporarily save pairings for each session still waiting for email confirmation
- **/static**: styles, scripts, images, etc...
- **/templates**: html pages 
