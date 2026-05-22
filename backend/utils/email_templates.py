"""Email templates for notifications. Use with EmailService.send_email_sync() from background tasks"""
from typing import Tuple


def base_template(title: str, content: str) -> str:
    """Base HTML email template"""
    return f"""
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e2e2e2;border-radius:8px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a1a14 0%,#0a0a0a 100%);padding:32px 40px;border-bottom:1px solid rgba(200,137,26,0.2)">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#e5a82e;margin:0;letter-spacing:4px">AURUM</h1>
        <p style="color:#4b5563;font-size:11px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase">Luxury Hotel Management</p>
      </div>
      <div style="padding:32px 40px">
        <h2 style="color:#e5a82e;font-family:Georgia,serif;margin:0 0 16px">{title}</h2>
        {content}
      </div>
      <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
        <p style="color:#374151;font-size:11px;margin:0">© Aurum Hotels. All rights reserved.</p>
      </div>
    </div>"""


# ─── BOOKING EMAILS ───────────────────────────────────────────────────────────

def booking_confirmation(guest_name: str, booking_ref: int, hotel_name: str, check_in: str, check_out: str, total: float) -> Tuple[str, str]:
    """Email sent when booking is created"""
    subject = f"Booking Confirmed — #{str(booking_ref).zfill(6)}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 24px">Dear {guest_name}, your reservation has been confirmed.</p>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;letter-spacing:1px;text-transform:uppercase">Booking Ref</span><br><span style="color:#e5a82e;font-family:monospace;font-size:16px">#{str(booking_ref).zfill(6)}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Hotel</span><br><span style="color:#e2e2e2">{hotel_name}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Check-in</span><br><span style="color:#e2e2e2">{check_in}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Check-out</span><br><span style="color:#e2e2e2">{check_out}</span></p>
          <p style="margin:8px 0 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Total</span><br><span style="color:#e5a82e;font-size:20px;font-family:Georgia,serif">${total:.2f}</span></p>
        </div>
        <p style="color:#6b7280;font-size:13px">Your booking is pending hotel confirmation. You'll receive a confirmation email shortly.</p>
    """
    html = base_template("Booking Confirmed", content)
    return subject, html


def booking_cancelled(guest_name: str, booking_ref: int) -> Tuple[str, str]:
    """Email sent when booking is cancelled"""
    subject = f"Booking Cancelled — #{str(booking_ref).zfill(6)}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Dear {guest_name}, your booking <strong style="color:#e5a82e;font-family:monospace">#{str(booking_ref).zfill(6)}</strong> has been cancelled.</p>
        <p style="color:#6b7280;font-size:13px">If you have questions, please contact our support team.</p>
    """
    html = base_template("Booking Cancelled", content)
    return subject, html


def booking_approved_by_hotel(guest_name: str, booking_ref: int, hotel_name: str) -> Tuple[str, str]:
    """Email sent when hotel confirms booking"""
    subject = f"Booking Approved — #{str(booking_ref).zfill(6)}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Dear {guest_name}, your booking at <strong>{hotel_name}</strong> has been approved!</p>
        <p style="color:#6b7280;font-size:13px">You're all set. We look forward to welcoming you. Check your account for more details.</p>
    """
    html = base_template("Booking Approved", content)
    return subject, html


# ─── HOTEL NOTIFICATIONS ──────────────────────────────────────────────────────

def hotel_new_booking(hotel_manager_name: str, guest_name: str, booking_ref: int, hotel_name: str, check_in: str, check_out: str) -> Tuple[str, str]:
    """Email sent to hotel when new booking is made"""
    subject = f"New Booking Received — {guest_name}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {hotel_manager_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">You have a new booking at {hotel_name}:</p>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Guest</span><br><span style="color:#e2e2e2">{guest_name}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Booking Ref</span><br><span style="color:#e5a82e;font-family:monospace">#{str(booking_ref).zfill(6)}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Check-in / Check-out</span><br><span style="color:#e2e2e2">{check_in} — {check_out}</span></p>
        </div>
        <p style="color:#6b7280;font-size:13px">Please confirm or decline this booking in your admin panel.</p>
    """
    html = base_template("New Booking", content)
    return subject, html


def hotel_booking_cancelled(hotel_manager_name: str, guest_name: str, booking_ref: int, hotel_name: str, check_in: str, check_out: str) -> Tuple[str, str]:
    """Email sent to hotel when guest cancels booking"""
    subject = f"Booking Cancelled — Guest {guest_name} (#{str(booking_ref).zfill(6)})"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {hotel_manager_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">A guest has cancelled their booking at {hotel_name}:</p>
        <div style="background:rgba(255,107,107,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Guest</span><br><span style="color:#e2e2e2">{guest_name}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Booking Ref</span><br><span style="color:#ef4444;font-family:monospace">#{str(booking_ref).zfill(6)}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Original Check-in / Check-out</span><br><span style="color:#e2e2e2">{check_in} — {check_out}</span></p>
        </div>
        <p style="color:#6b7280;font-size:13px">The room will be available for other guests. Please update your availability calendar accordingly.</p>
    """
    html = base_template("Booking Cancelled", content)
    return subject, html


# ─── MESSAGE NOTIFICATIONS ────────────────────────────────────────────────────

def new_message_notification(recipient_name: str, sender_name: str, booking_ref: int, message_preview: str) -> Tuple[str, str]:
    """Email sent when new message is received"""
    subject = f"New Message from {sender_name} on Booking #{str(booking_ref).zfill(6)}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {recipient_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">{sender_name} sent you a message on booking #{str(booking_ref).zfill(6)}:</p>
        <div style="background:rgba(255,255,255,0.03);border-left:4px solid #e5a82e;border-radius:4px;padding:16px;margin:16px 0">
          <p style="color:#e2e2e2;margin:0;font-style:italic">{message_preview[:200]}...</p>
        </div>
        <p style="color:#6b7280;font-size:13px"><a href="YOUR_APP_URL" style="color:#e5a82e;text-decoration:none">View full conversation →</a></p>
    """
    html = base_template("New Message", content)
    return subject, html


def hotel_registration_pending(hotel_manager_name: str, hotel_name: str, submission_date: str) -> Tuple[str, str]:
    """Email sent to hotel admin when they register hotel (awaiting approval)"""
    subject = f"Hotel Registration Submitted — {hotel_name}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {hotel_manager_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">Your hotel <strong>{hotel_name}</strong> has been successfully submitted for approval.</p>
        <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:4px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Status</span><br><span style="color:#60a5fa;font-weight:bold">⏳ Awaiting Platform Approval</span></p>
          <p style="margin:8px 0 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Submitted On</span><br><span style="color:#e2e2e2">{submission_date}</span></p>
        </div>
        <p style="color:#6b7280;font-size:13px;margin:0 0 12px">Our platform team will review your hotel details and approve it within 24-48 hours. You'll receive another email once your hotel is approved.</p>
        <p style="color:#6b7280;font-size:13px">In the meantime, you can add rooms and set pricing in your hotel dashboard.</p>
    """
    html = base_template("Hotel Registration Submitted", content)
    return subject, html


def hotel_approved(hotel_manager_name: str, hotel_name: str) -> Tuple[str, str]:
    """Email sent to hotel admin when platform approves their hotel registration"""
    subject = f"🎉 {hotel_name} — Approved on Aurum!"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {hotel_manager_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">Congratulations! <strong style="color:#10b981">{hotel_name}</strong> has been approved and is now live on the Aurum platform.</p>
        <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:4px;padding:20px;margin:20px 0">
          <p style="color:#10b981;font-size:16px;font-weight:bold;margin:0 0 12px">✅ Your hotel is now live!</p>
          <p style="color:#6b7280;font-size:13px;margin:0">Next steps:</p>
          <ul style="color:#6b7280;font-size:13px;margin:8px 0 0">
            <li>Add rooms with photos and descriptions</li>
            <li>Set room pricing and availability</li>
            <li>Configure amenities and house rules</li>
            <li>Start accepting bookings!</li>
          </ul>
        </div>
        <p style="color:#6b7280;font-size:13px">Log in to your Hotel Admin portal to get started. You'll begin receiving booking requests from guests immediately.</p>
    """
    html = base_template("Hotel Approved!", content)
    return subject, html


def hotel_rejected(hotel_manager_name: str, hotel_name: str, rejection_reason: str) -> Tuple[str, str]:
    """Email sent to hotel admin when platform rejects their hotel registration"""
    subject = f"{hotel_name} — Application Update"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Hello {hotel_manager_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">Thank you for your interest in joining the Aurum platform. We regret to inform you that <strong>{hotel_name}</strong> has not been approved at this time.</p>
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:4px;padding:16px;margin:20px 0">
          <p style="color:#fca5a5;font-size:13px;margin:0"><strong>Reason for Rejection:</strong></p>
          <p style="color:#fca5a5;font-size:13px;margin:8px 0 0">{rejection_reason or 'Please contact our support team for specific details.'}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">You may reapply with corrected information once you've addressed the feedback. If you have questions about the decision, please reach out to our support team.</p>
    """
    html = base_template("Application Status", content)
    return subject, html

# ─── GROUP BOOKING NOTIFICATIONS ──────────────────────────────────────────────

def group_booking_request_received(guest_name: str, hotel_name: str, num_rooms: int, check_in: str, check_out: str, total: float) -> Tuple[str, str]:
    """Email sent when group booking request is created"""
    subject = f"Group Booking Request Received — {hotel_name}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Dear {guest_name},</p>
        <p style="color:#9ca3af;margin:0 0 16px">Thank you for submitting your group booking request for {hotel_name}. We'll review it shortly.</p>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Hotel</span><br><span style="color:#e2e2e2">{hotel_name}</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Rooms</span><br><span style="color:#e2e2e2">{num_rooms} rooms</span></p>
          <p style="margin:8px 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Dates</span><br><span style="color:#e2e2e2">{check_in} to {check_out}</span></p>
          <p style="margin:8px 0 0"><span style="color:#4b5563;font-size:12px;text-transform:uppercase">Estimated Total</span><br><span style="color:#e5a82e;font-size:16px">${total:.2f}</span></p>
        </div>
        <p style="color:#6b7280;font-size:13px">We'll contact you to finalize the booking.</p>
    """
    html = base_template("Group Booking Request", content)
    return subject, html


def group_booking_confirmed(guest_name: str, hotel_name: str) -> Tuple[str, str]:
    """Email sent when group booking is confirmed"""
    subject = f"Group Booking Confirmed — {hotel_name}"
    content = f"""
        <p style="color:#9ca3af;margin:0 0 16px">Dear {guest_name},</p>
        <p style="color:#10b981;margin:0 0 16px;font-size:18px;font-weight:bold">🎉 Your group booking has been confirmed!</p>
        <p style="color:#9ca3af;margin:0 0 16px">Your group booking at <strong>{hotel_name}</strong> is all set. Check your account for complete details and next steps.</p>
        <p style="color:#6b7280;font-size:13px">Thank you for choosing Aurum Hotels!</p>
    """
    html = base_template("Group Booking Confirmed", content)
    return subject, html
