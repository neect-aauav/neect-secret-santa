from flask import Flask, render_template, request, redirect
from creds import *
from email_sender import EmailSender
from bs4 import BeautifulSoup

import random
import pprint
import re

pp = pprint.PrettyPrinter(indent=2)

# __name__ holds the name of the current Python module
# Flask sets up some paths behind the scenes with this
app = Flask(__name__)

# @app.route is a decorator that turns a regular Python function
# into a Flask view function
@app.route('/')
def index():
	members = 2
	title = ''
	gender = ''
	if request.method == 'GET':
		print(request.args)
		members = request.args.get('members') if request.args.get('members') and int(request.args.get('members')) > 2 else 2
		title = request.args.get('title') if request.args.get('title') else ''
		gender = request.args.get('gender') if request.args.get('gender') else ''
	return render_template('index.html', members = members, title=title, gender=gender)

@app.route('/result', methods=["POST"])
def result():
	print(request.form.getlist("gender"));
	genders = request.form.getlist("gender") if request.form.getlist("gender") else ['' for i in request.form.getlist('name')]

	# [(name1, email1), (name2, email2), ...]
	members = [(name, email, gender) for name, email, gender in zip(request.form.getlist('name'), request.form.getlist('email'), genders)]
	if len(members) % 2 == 0:
		pairs, males, females = [], [], []
		if genders[0] != '':
			males = [member for member in members if (member[2] == 'Male')]
			females = [member for member in members if (member[2] == 'Female')]
			
		while len(members) > 0:
			pair = []
			if len(males) == 0 or len(females) == 0:
				pair = random.sample(members, 2)
			else:
				pair.append(random.sample(males, 1)[0])
				pair.append(random.sample(females, 1)[0])
				# remove already chose males and females
				males = [member for member in males if (member not in pair)]
				females = [member for member in females if (member not in pair)]

			pairs.append(pair)
			# remove already chosen members
			members = [member for member in members if (member not in pair)]

		pp.pprint(pairs)
		ss_title = request.form['ss-title']

		for pair in pairs:
			for i in range(2):
				receiver = pair[i]
				partner = pair[(i-1)*(-1)]
				sender = EmailSender(smtp_server, port, sender_email, receiver[1], password)
				sender.subject("Secret Santa - Resultados")
				file = open('email.html', 'r')
				soup = BeautifulSoup(file.read(), 'html.parser')

				# change partner's name
				html_content = soup.find("li", {"id":"partner"})
				html_content.find(text=re.compile('Partner')).replace_with(partner[0])
				# change title
				html_content = soup.find("div", {"id":"ss-title"})
				html_content.find(text=re.compile('Title')).replace_with(ss_title)
				# change email
				html_content = soup.find("div", {"id":"email"})
				html_content.find(text=re.compile('email')).replace_with(partner[1])

				html = f"""\
					{soup}
				"""
				sender.body(html=html)
				sender.send()


		return render_template('result.html', pairs = pairs, title = ss_title)
	else:
		return "Odd number of members! Were you really going to leave someone without a mate?"