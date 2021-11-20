from creds import password
from email_sender import EmailSender

smtp_server = "mail.ua.pt"
port = 25#587  # For starttls
receiver_email  = "digas_correia@hotmail.com"
sender_email = "diogo.correia99@ua.pt"

text = """\
Hi,
How are you?
Real Python has many great tutorials:
www.realpython.com"""

html = """\
<html>
	<body>
		<style>
			body, ul {
				margin: 0;
				padding: 0;
			}

			a, a:hover, a:focus, a:active {
				text-decoration: none !important;
				color: inherit !important;
			}

			li {
				list-style: none;
			}
			
			.main {
				text-align: center;
				width: 500px;
				margin: auto;
				border: 1px solid silver;
			}

			.top {
				background-color: #62bb9a;
			}

			.top>div {
				margin: auto;
				width: fit-content;
				font-size: 30px;
				color: white;
				padding: 20px;
			}

			.result>div {
				font-size: 25px;
				background-color: #494949;
				color: white;
				padding: 5px;
			}

			.result>ul {
				display: inline-flex;
				height: 200px;
				width: 100%;
				margin: auto;
			}

			.result>ul>li {
				width: 50%;
				margin: auto;
			}

			.name {
				margin-top: 18px;
				font-size: 25px;
				background-color: #62bb9a;
				color: white;
				padding: 5px;
				border-radius: 30px;
				height: 28px;
				overflow: hidden;
				padding-bottom: 10px;
			}
		</style>
		
		<div class="main">
			<div class="top">
			  <div><a href="https://www.google.com">Secret Santa</a></div>
			</div>

			<div class="result">
				<div>Resultado</div>
				<ul>
					<li style="border-right: 1px solid silver; padding: 10px;">
						<ul>
							<li><img style ="width: 100px; opacity: 0.72;" src="https://i.imgur.com/MMuZ4j7.png" alt="Participante"></li>
							<li title="Tu" class="name">Tu</li>
						</ul>
					</li>
					<li style="padding: 10px;">
						<ul>
							<li><img style ="width: 100px; opacity: 0.72;" src="https://i.imgur.com/MMuZ4j7.png" alt="Participante"></li>
							<li title="Joana Resende Almeida" class="name">Joana Resende Almeida</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</body>
</html>
"""

sender = EmailSender(smtp_server, port, sender_email, receiver_email, password)
sender.subject("Secret Santa - Resultados")
sender.body(text, html)
sender.send()