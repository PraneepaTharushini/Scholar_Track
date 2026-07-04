"""
notification_service.py
========================
Sends deadline reminder emails to students via Gmail SMTP.
"""

import smtplib
from email.mime.text import MIMEText
from flask import Flask

from models.db_queries import get_tasks_due_soon, mark_reminder_sent


def _build_email(task: dict, from_email: str) -> MIMEText:
    deadline = task["deadline"]
    deadline_str = deadline.strftime("%Y-%m-%d %H:%M") if hasattr(deadline, "strftime") else str(deadline)

    body = (
        f"Hi {task['name']},\n\n"
        f"Your task \"{task['title']}\" is due on {deadline_str}.\n\n"
        f"Log in to Scholar Track to review it.\n\n"
        f"Best,\nScholar Track Team"
    )

    msg = MIMEText(body)
    msg["Subject"] = f"[Scholar Track] Reminder: '{task['title']}' is due soon"
    msg["From"] = from_email
    msg["To"] = task["email"]
    return msg


def send_deadline_reminders(app: Flask, hours: int = 24) -> int:
    """
    Check for tasks due within `hours` and email each student once.
    Returns the number of emails sent successfully.
    """
    with app.app_context():
        due_tasks = get_tasks_due_soon(hours=hours)

        if not due_tasks:
            print("No tasks due soon. No reminders sent.")
            return 0

        try:
            server = smtplib.SMTP(app.config["SMTP_HOST"], app.config["SMTP_PORT"])
            if app.config.get("SMTP_USE_TLS"):
                server.starttls()
            server.login(app.config["SMTP_USERNAME"], app.config["SMTP_PASSWORD"])
        except Exception as e:
            print(f"SMTP connection failed: {e}")
            return 0

        sent_count = 0
        for task in due_tasks:
            try:
                msg = _build_email(task, app.config["SMTP_FROM_EMAIL"])
                server.sendmail(app.config["SMTP_FROM_EMAIL"], [task["email"]], msg.as_string())
                mark_reminder_sent(task["task_id"])
                sent_count += 1
                print(f"Reminder sent to {task['email']} for task {task['task_id']}")
            except Exception as e:
                print(f"Failed to send reminder for task {task['task_id']}: {e}")

        server.quit()
        return sent_count