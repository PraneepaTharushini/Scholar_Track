import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta


def send_email(to_email, subject, body):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 465))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Scholar Track <{smtp_user}>"
    msg["To"] = to_email

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px;">
            <h2 style="color: #4F46E5;">📚 Scholar Track Reminder</h2>
            <p>{body}</p>
            <hr/>
            <p style="color: #999; font-size: 12px;">This is an automated reminder from Scholar Track.</p>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, to_email, msg.as_string())
            print(f"Email sent to {to_email}")
            return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False


def send_deadline_reminders(app):
    with app.app_context():
        print("Checking for upcoming deadlines...")
        try:
            from extensions import db

            now = datetime.utcnow()
            in_1_day = now + timedelta(days=1)
            in_3_days = now + timedelta(days=3)

            query = """
                SELECT t.task_title, t.deadline, u.email, u.full_name
                FROM tasks t
                JOIN users u ON t.user_id = u.id
                WHERE t.status != 'completed'
                AND (
                    t.deadline::date = :day1 OR
                    t.deadline::date = :day3
                )
            """

            with db.engine.connect() as conn:
                rows = conn.execute(query, {
                    "day1": in_1_day.date(),
                    "day3": in_3_days.date()
                }).fetchall()

            for row in rows:
                title, due_date, email, name = row
                days_left = (due_date.date() - now.date()).days

                if days_left == 1:
                    subject = f"⚠️ Task Due Tomorrow: {title}"
                    body = f"Hi {name},<br><br>Your task <strong>{title}</strong> is due <strong>tomorrow</strong> ({due_date.strftime('%B %d, %Y')}).<br><br>Please make sure to complete it on time!"
                else:
                    subject = f"📅 Task Due in 3 Days: {title}"
                    body = f"Hi {name},<br><br>Your task <strong>{title}</strong> is due in <strong>3 days</strong> ({due_date.strftime('%B %d, %Y')}).<br><br>Don't forget to work on it!"

                send_email(email, subject, body)

            print(f"Reminder check complete. {len(rows)} emails sent.")

        except Exception as e:
            print(f"Error sending reminders: {e}")