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
	if request.method == 'GET':
		print(request.args)
		members = request.args.get('members') if request.args.get('members') and int(request.args.get('members')) > 2 else 2
		title = request.args.get('title') if request.args.get('title') else ''
	return render_template('index.html', members = members, title=title)

@app.route('/result', methods=["POST"])
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
		#pp.pprint(pairs)
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