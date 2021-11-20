import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailSender:
  def __init__(self, smtp_server, port, sender_email, receiver_email, password):
    self.smtp_server = smtp_server
    self.port = port
    self.sender = sender_email
    self.receiver = receiver_email
    self.password = password
    
    msg = MIMEMultipart("alternative")
    msg["From"] = sender_email
    msg["To"] = receiver_email
    self.message = msg

  def subject(self, subject):
    self.message["Subject"] = subject

  def body(self, text, html):
    if text:
      self.message.attach(MIMEText(text, "plain"))
    if html:
      self.message.attach(MIMEText(html, "html"))

  def send(self):
    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP(self.smtp_server, self.port) as server:
        server.ehlo()  # Can be omitted
        server.starttls(context=context)
        server.ehlo()  # Can be omitted
        server.login(self.sender, self.password)
        server.sendmail(
          self.sender, self.receiver, self.message.as_string()
        )