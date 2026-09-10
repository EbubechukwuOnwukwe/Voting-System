import os
from brevo import Brevo
from brevo.transactional_emails import (
    SendTransacEmailRequestSender,
    SendTransacEmailRequestToItem,
)


def send_password_reset_email(
    recipient_email,
    reset_url,
):
    api_key = os.environ.get("BREVO_API_KEY")
    sender_email = os.environ.get("BREVO_SENDER_EMAIL")
    sender_name = os.environ.get(
        "BREVO_SENDER_NAME",
        "NMA Voting System"
    )

    if not api_key:
        raise ValueError("BREVO_API_KEY is not configured.")

    if not sender_email:
        raise ValueError("BREVO_SENDER_EMAIL is not configured.")

    client = Brevo(api_key=api_key)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f7f5;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 40px;
        ">

            <h2 style="color: #006400;">
                NMA Voting System
            </h2>

            <h1>
                Reset your password
            </h1>

            <p>
                Hello,
            </p>

            <p>
                We received a request to reset your NMA Voting System password.
            </p>

            <p>
                Click the button below to create a new password:
            </p>

            <p style="margin: 30px 0;">
                <a
                    href="{reset_url}"
                    style="
                        display: inline-block;
                        padding: 14px 24px;
                        background-color: #006400;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>
                If you did not request a password reset, you can safely ignore
                this email.
            </p>

            <p>
                For security reasons, this link will expire.
            </p>

            <p>
                NMA Voting System
            </p>

        </div>

    </body>
    </html>
    """

    result = client.transactional_emails.send_transac_email(
        subject="NMA Voting System Password Reset",

        html_content=html_content,

        sender=SendTransacEmailRequestSender(
            name=sender_name,
            email=sender_email,
        ),

        to=[
            SendTransacEmailRequestToItem(
                email=recipient_email,
            )
        ],
    )

    return result