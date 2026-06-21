import psycopg2
import psycopg2.extras
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, timedelta

DATABASE_URL = "postgresql://postgres:lXkbAOtVInUIMHWZFygvINIaKGlspqwJ@tramway.proxy.rlwy.net:33180/railway"

today = date.today()
d1 = today + timedelta(days=1)
d3 = today + timedelta(days=3)
print('Looking for tasks due on:', d1, 'or', d3)

conn = psycopg2.connect(DATABASE_URL, sslmode="require")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cursor.execute("""
    SELECT t.task_title, t.deadline, u.email
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.status != 'completed'
    AND (t.deadline::date = %s OR t.deadline::date = %s)
""", (d1, d3))

rows = cursor.fetchall()
print(f'Tasks due in 1 or 3 days: {len(rows)}')
for r in rows:
    print(r)

cursor.close()
conn.close()

# Send emails
smtp_user = "scholartrack2026@gmail.com"
smtp_password = "mgrwhqpvhpbjujhu"

for row in rows:
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = row['email']
    msg['Subject'] = f"[Scholar Track] Reminder: {row['task_title']}"
    msg.attach(MIMEText(f"Hi,\n\nYour task '{row['task_title']}' is due on {row['deadline']}.\n\nBest,\nScholar Track", 'plain'))
    
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, row['email'], msg.as_string())
        print(f"Email sent to {row['email']}")