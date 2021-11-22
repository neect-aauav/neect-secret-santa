from flask import Flask, render_template, request, redirect
from creds import *
from email_sender import EmailSender
from bs4 import BeautifulSoup
from hashlib import md5

import random
import pprint
import re
import json
import os

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

@app.route('/verification', methods=["POST", "GET"])
def verify():
	if request.method == 'GET':
		email = request.args.get("email")
		hash_val = request.args.get("hash")
		n_members = 0
		ss_title = ''
		if md5((hash_salt+email+hash_salt_2).encode('utf-8')).hexdigest() == hash_val:
			try:
				with open("data/"+hash_val+".json", 'r') as f:
					pairs = json.load(f)
					ss_title = pairs["title"]
					del pairs["title"]
					n_members = len(pairs)*2

					for i in pairs:
						pair = pairs[i]
						for j in range(2):
							receiver = pair[j]
							partner = pair[(j-1)*(-1)]
							sender = EmailSender(smtp_server, port, sender_email, receiver[1], password)
							sender.subject("Secret Santa - Resultados")
							file = open('email-results.html', 'r')
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

				if os.path.exists("data/"+hash_val+".json"):
					os.remove("data/"+hash_val+".json")

				return render_template("verified.html", title=ss_title, members=n_members)
			except IOError:
				return render_template("error.html", title="Verificação falhada!", subtitle="Parece que este link já foi usado")
		else:
			return render_template("error.html", title="Verificação falhada!", subtitle="O link parece estar errado")
	else:
		genders = request.form.getlist("gender") if request.form.getlist("gender") else ['' for i in request.form.getlist('name')]

		# [(name1, email1), (name2, email2), ...]
		members = [(name, email, gender) for name, email, gender in zip(request.form.getlist('name'), request.form.getlist('email'), genders)]
		if len(members) % 2 == 0:
			pairs, males, females = {}, [], []
			if genders[0] != '':
				males = [member for member in members if (member[2] == 'Male')]
				females = [member for member in members if (member[2] == 'Female')]
			
			counter = 0
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

				pairs[counter]= pair
				# remove already chosen members
				members = [member for member in members if (member not in pair)]

				counter+=1

			pp.pprint(pairs)
			
			ss_title = request.form.get("ss-title")
			ss_admin_email = request.form.get("admin-email")

			pairs["title"] = ss_title

			hash_val = md5((hash_salt+ss_admin_email+hash_salt_2).encode('utf-8'))

			link = "http://192.168.1.95:5000/verification?email="+ss_admin_email+"&hash="+hash_val.hexdigest()

			# save pairs to file
			with open("data/"+hash_val.hexdigest()+".json", 'w') as f:
				f.write(json.dumps(pairs, indent=2))

			sender = EmailSender(smtp_server, port, sender_email, ss_admin_email, password)
			sender.subject("Secret Santa - Verificação")

			file = open('email-verification.html', 'r')
			soup = BeautifulSoup(file.read(), 'html.parser')

			# change title
			html_content = soup.find("div", {"id":"ss-title"})
			html_content.find(text=re.compile('Title')).replace_with(ss_title)
			# change link
			html_content = soup.find("li", {"id":"link"})
			html_content.find(text=re.compile('link')).replace_with(link)

			html = f"""\
				{soup}
			"""
			sender.body(html=html)
			sender.send()

			return render_template('verification.html', title=ss_title, email=ss_admin_email)
		else:
			return render_template("error.html", title="Não foi possível criar o Secret Santa!", subtitle="Número ímpar de participantes")
