import os
import httpx
from typing import Optional

EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "brevo")   # brevo | resend | none
BREVO_API_KEY  = os.getenv("BREVO_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL     = os.getenv("FROM_EMAIL")
FROM_NAME      = os.getenv("FROM_NAME", "Aurum Hotels")


def _send_brevo(to_email: str, to_name: str, subject: str, html: str) -> bool:
    if not BREVO_API_KEY:
        print(f"[EMAIL-SKIP] Brevo key not set. Would send: {subject} → {to_email}")
        return False
    resp = httpx.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={"api-key": BREVO_API_KEY, "Content-Type": "application/json"},
        json={
            "sender": {"name": FROM_NAME, "email": FROM_EMAIL},
            "to": [{"email": to_email, "name": to_name}],
            "subject": subject,
            "htmlContent": html,
        },
        timeout=10,
    )
    return resp.status_code in (200, 201)


def _send_resend(to_email: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        print(f"[EMAIL-SKIP] Resend key not set. Would send: {subject} → {to_email}")
        return False
    resp = httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
        json={"from": f"{FROM_NAME} <{FROM_EMAIL}>", "to": [to_email], "subject": subject, "html": html},
        timeout=10,
    )
    return resp.status_code == 200


def send_email(to_email: str, to_name: str, subject: str, html: str) -> bool:
    try:
        if EMAIL_PROVIDER == "resend":
            return _send_resend(to_email, subject, html)
        elif EMAIL_PROVIDER == "brevo":
            return _send_brevo(to_email, to_name, subject, html)
        else:
            print(f"[EMAIL-NONE] {subject} → {to_email}")
            return True
    except Exception as e:
        print(f"[EMAIL-ERROR] {e}")
        return False


# ── Email templates ──────────────────────────────────────────────────────────

def _base_template(content: str) -> str:
    return f"""
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#e2e2e2;border-radius:8px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a1a14 0%,#0a0a0a 100%);padding:32px 40px;border-bottom:1px solid rgba(200,137,26,0.2)">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#e5a82e;margin:0;letter-spacing:4px">AURUM</h1>
        <p style="color:#4b5563;font-size:11px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase">Luxury Hotel Management</p>
      </div>
      <div style="padding:32px 40px">{content}</div>
      <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
        <p style="color:#374151;font-size:11px;margin:0">© Aurum Hotels. All rights reserved.</p>
      </div>
    </div>"""


def send_booking_confirmation(to_email: str, to_name: str, booking: dict) -> bool:
    content = f"""
    <h2 style="color:#e5a82e;font-family:Georgia,serif;margin:0 0 16px">Booking Confirmed</h2>
    <p style="color:#9ca3af;margin:0 0 24px">Dear {to_name}, your reservation has been received.</p>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;letter-spacing:1px;text-transform:uppercase">Booking Ref</span><br><span style="color:#e5a82e;font-family:monospace;font-size:16px">#{str(booking.get('id','---')).zfill(6)}</span></p>
      <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Hotel</span><br><span style="color:#e2e2e2">{booking.get('hotel_name','')}</span></p>
      <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Check-in</span><br><span style="color:#e2e2e2">{booking.get('check_in','')}</span></p>
      <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Check-out</span><br><span style="color:#e2e2e2">{booking.get('check_out','')}</span></p>
      <p style="margin:8px 0 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Total</span><br><span style="color:#e5a82e;font-size:20px;font-family:Georgia,serif">${booking.get('total_amount',0):.2f}</span></p>
    </div>
    <p style="color:#6b7280;font-size:13px">Your booking is currently <strong style="color:#fbbf24">pending</strong> hotel confirmation. We'll notify you once confirmed.</p>"""
    return send_email(to_email, to_name, f"Booking Confirmed — #{str(booking.get('id','---')).zfill(6)}", _base_template(content))


def send_booking_cancelled(to_email: str, to_name: str, booking: dict) -> bool:
    content = f"""
    <h2 style="color:#ef4444;font-family:Georgia,serif;margin:0 0 16px">Booking Cancelled</h2>
    <p style="color:#9ca3af;margin:0 0 16px">Dear {to_name}, your booking <strong style="color:#e5a82e;font-family:monospace">#{str(booking.get('id','---')).zfill(6)}</strong> has been cancelled.</p>
    <p style="color:#6b7280;font-size:13px">If you have any questions, please contact the hotel directly.</p>"""
    return send_email(to_email, to_name, f"Booking Cancelled — #{str(booking.get('id','---')).zfill(6)}", _base_template(content))


def send_hotel_approved(to_email: str, to_name: str, hotel_name: str) -> bool:
    content = f"""
    <h2 style="color:#10b981;font-family:Georgia,serif;margin:0 0 16px">Hotel Approved!</h2>
    <p style="color:#9ca3af;margin:0 0 16px">Congratulations! <strong style="color:#e2e2e2">{hotel_name}</strong> has been approved and is now live on the Aurum platform.</p>
    <p style="color:#6b7280;font-size:13px">You can now add rooms and start accepting bookings from your Hotel Admin portal.</p>"""
    return send_email(to_email, to_name, f"{hotel_name} — Approved on Aurum!", _base_template(content))


def send_hotel_rejected(to_email: str, to_name: str, hotel_name: str, reason: str) -> bool:
    content = f"""
    <h2 style="color:#ef4444;font-family:Georgia,serif;margin:0 0 16px">Hotel Application Update</h2>
    <p style="color:#9ca3af;margin:0 0 16px">We regret to inform you that <strong style="color:#e2e2e2">{hotel_name}</strong> has not been approved at this time.</p>
    <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:4px;padding:16px;margin-bottom:20px">
      <p style="color:#fca5a5;font-size:13px;margin:0"><strong>Reason:</strong> {reason or 'Please contact our support team for details.'}</p>
    </div>
    <p style="color:#6b7280;font-size:13px">You may re-apply with corrected information.</p>"""
    return send_email(to_email, to_name, f"{hotel_name} — Application Update", _base_template(content))


def send_pre_arrival_reminder(to_email: str, to_name: str, booking: dict) -> bool:
    content = f"""
    <h2 style="color:#e5a82e;font-family:Georgia,serif;margin:0 0 16px">Your Stay is Tomorrow!</h2>
    <p style="color:#9ca3af;margin:0 0 16px">Dear {to_name}, this is a reminder that your check-in at <strong style="color:#e2e2e2">{booking.get('hotel_name','')}</strong> is tomorrow.</p>
    <p style="color:#6b7280;font-size:13px">Check-in: <strong style="color:#e2e2e2">{booking.get('check_in','')}</strong></p>
    <p style="color:#6b7280;font-size:13px">Booking Ref: <strong style="color:#e5a82e;font-family:monospace">#{str(booking.get('id','---')).zfill(6)}</strong></p>
    <p style="color:#6b7280;font-size:13px;margin-top:16px">We look forward to welcoming you.</p>"""
    return send_email(to_email, to_name, f"Reminder: Check-in Tomorrow at {booking.get('hotel_name','')}", _base_template(content))
