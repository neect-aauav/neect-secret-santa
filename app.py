from flask import Flask, render_template, request, redirect
import random
import pprint

pp = pprint.PrettyPrinter(indent=2)

# __name__ holds the name of the current Python module
# Flask sets up some paths behind the scenes with this
app = Flask(__name__)

# @app.route is a decorator that turns a regular Python function
# into a Flask view function
@app.route('/')
def index():
	return render_template('index.html')

@app.route('/result', methods=['POST'])
def result():
	# [(name1, email1), (name2, email2), ...]
	members = [(name, email) for name, email in zip(request.form.getlist('name'), request.form.getlist('email'))]
	if len(members) % 2 == 0:
		pairs = []
		while len(members) > 0:
			pair = random.sample(members, 2)
			pairs.append(pair)
			# remove already chosen members
			members = [member for member in members if (member not in pair)]
		pp.pprint(pairs)
		return render_template('result.html', pairs = pairs, title = request.form['ss-title'])
	else:
		return "Odd number of members! Were you really going to leave someone without a mate?"