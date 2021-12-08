from flask import Flask, render_template, request, redirect
from creds import *
from email_sender import EmailSender
from bs4 import BeautifulSoup
from hashlib import md5

import random
import re
import json
import os
import pprint

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
					ss_date = ''
					try:
						ss_date = pairs["date"]
						del pairs["date"]
					except KeyError:
						ss_date = None

					n_members = len(pairs)*2

					for i in pairs:
						pair = pairs[i]
						for j in range(2):
							receiver = pair[j]
							partner = pair[(j-1)*(-1)]
							sender = EmailSender(smtp_server, port, sender_email, receiver[1], password)
							sender.subject("Secret Santa - Resultados")
							file = open('static/emails/email-results.html' if ss_date else 'static/emails/email-results-no-date.html', 'r')
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
							if ss_date:
								# change date
								html_content = soup.find("p", {"id":"date"})
								html_content.find(text=re.compile('date')).replace_with("Compra-lhe algo até "+ss_date)

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
		receivers = [(name, email, gender) for name, email, gender in zip(request.form.getlist('name'), request.form.getlist('email'), genders)]
		givers = receivers
		pairs, males_rec, females_rec, males_giv, females_giv = {}, [], [], [], []
		size = len(receivers)
		if genders[0] != '':
			males_rec = [m for m in receivers if (m[2] == 'Masculino')]
			females_rec = [m for m in receivers if (m[2] == 'Feminino')]
			males_giv = males_rec
			females_giv = females_rec

		print("Males: ")
		pp.pprint(males_rec)
		print("Females: ")
		pp.pprint(females_rec)

		counter = 0
		receiver, giver = "", ""
		while len(givers) > 0:
			print(counter)
			# if gender pairing is possible
			if (len(males_rec) > 0 and len(females_giv) > 0) or (len(females_rec) > 0 and len(males_giv) > 0):
				if len(males_rec) > 0:
					print("male - female")
					# if 2 iterations left
					# check for common a member in both lists
					commonMember = set(males_rec) & set(females_giv)
					if counter == (size-1) and commonMember:
						print("SPECIAL CASE")
						# if common member, then make sure last iteration doesn't end with the same member
						receiver = commonMember
						giver = [m for m in females_giv if (m != commonMember)][0]
					else:
						receiver = random.sample(males_rec, 1)[0]	
						giver = random.sample(females_giv, 1)[0]
						# update changed arrays
						males_rec = [m for m in males_rec if (m != receiver)]
						females_giv = [m for m in females_giv if (m != giver)]
				else:
					print("female - male")
					# if 2 iterations left
					# check for common a member in both lists
					commonMember = set(females_rec) & set(males_giv)
					if counter == (size-1) and commonMember:
						print("SPECIAL CASE")
						# if common member, then make sure last iteration doesn't end with the same member
						receiver = commonMember
						giver = [m for m in males_giv if (m != commonMember)][0]
					else:
						receiver = random.sample(females_rec, 1)[0]
						giver = random.sample(males_giv, 1)[0]
						# update changed arrays
						females_rec = [m for m in females_rec if (m != receiver)]
						males_giv = [m for m in males_giv if (m != giver)]
			else:
				print("any")
				receiver = random.sample(givers, 1)[0]
				giver = random.sample([m for m in receivers if (m != receiver)], 1)[0]

			pair = [receiver, giver]
			pairs[counter] = pair

			# remove already chosen giver
			receivers = [m for m in receivers if (m != giver)]
			# remove already paired receiver
			givers = [m for m in givers if (m != receiver)]
		
			print(receiver)
			print(giver)
			print("givers")
			pp.pprint(givers)
			print("receivers")
			pp.pprint(receivers)
			print("\n")

			counter+=1

		pp.pprint(pairs)
		
		ss_title = request.form.get("ss-title")
		ss_admin_email = request.form.get("admin-email")
		ss_date = request.form.get("ss-date")

		pairs["title"] = ss_title
		if ss_date and ss_date != '':
			pairs["date"] = ss_date

		hash_val = md5((hash_salt+ss_admin_email+hash_salt_2).encode('utf-8'))

		link = request.host_url+"verification?email="+ss_admin_email+"&hash="+hash_val.hexdigest()

		curpath = os.path.abspath(os.curdir)
		print(curpath)

		# save pairs to file
		with open("data/"+hash_val.hexdigest()+".json", 'w') as f:
			f.write(json.dumps(pairs, indent=2))

		sender = EmailSender(smtp_server, port, sender_email, ss_admin_email, password)
		sender.subject("Secret Santa - Verificação")

		file = open('static/emails/email-verification.html', 'r')
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
		# sender.send()

		return render_template('verification.html', title=ss_title, email=ss_admin_email)
		

@app.errorhandler(403)
def page_not_found(e):
    return render_template('error.html', title="403", subtitle="Acesso negado"), 403

@app.errorhandler(404)
def page_not_found(e):
    return render_template('error.html', title="404", subtitle="Página não encontrada"), 404

@app.errorhandler(500)
def page_not_found(e):
    return render_template('error.html', title="Erro no servidor", subtitle="Pedimos desculpa pelo incómodo"), 500