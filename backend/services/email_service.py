import httpx
import json
from config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Email service supporting Brevo and Resend - for background task usage"""

    @staticmethod
    def send_email_sync(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
        """Synchronous email sending (use in background tasks)"""
        if not settings.EMAIL_PROVIDER or settings.EMAIL_PROVIDER == "none":
            logger.info(f"Email notifications disabled. Would send to {to_email}: {subject}")
            return True

        try:
            if settings.EMAIL_PROVIDER.lower() == "brevo":
                return EmailService._send_brevo_sync(to_email, subject, html_body, text_body)
            elif settings.EMAIL_PROVIDER.lower() == "resend":
                return EmailService._send_resend_sync(to_email, subject, html_body, text_body)
            else:
                logger.warning(f"Unknown email provider: {settings.EMAIL_PROVIDER}")
                return False
        except Exception as e:
            logger.error(f"Email error: {e}", exc_info=True)
            return False

    @staticmethod
    def _send_brevo_sync(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
        """Send via Brevo (formerly Sendinblue) - Synchronous
        Supports both xsmtpsib- and xkeysib- API key formats
        """
        if not settings.BREVO_API_KEY:
            logger.warning("Brevo API key not configured")
            return False

        try:
            response = httpx.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={
                    "api-key": settings.BREVO_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "sender": {
                        "name": settings.FROM_NAME,
                        "email": settings.FROM_EMAIL,
                    },
                    "to": [{"email": to_email}],
                    "subject": subject,
                    "htmlContent": html_body,
                    "textContent": text_body or subject,
                },
                timeout=10,
            )
            success = response.status_code in [200, 201]
            if success:
                logger.info(f"Email sent to {to_email}: {subject}")
            else:
                logger.error(f"Brevo error ({response.status_code}): {response.text}")
            return success
        except Exception as e:
            logger.error(f"Brevo email error: {e}", exc_info=True)
            return False

    @staticmethod
    def _send_resend_sync(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
        """Send via Resend - Synchronous"""
        if not settings.RESEND_API_KEY:
            logger.warning("Resend API key not configured")
            return False

        try:
            response = httpx.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
                    "to": to_email,
                    "subject": subject,
                    "html": html_body,
                },
                timeout=10,
            )
            success = response.status_code == 200
            if success:
                logger.info(f"Email sent to {to_email}: {subject}")
            else:
                logger.error(f"Resend error ({response.status_code}): {response.text}")
            return success
        except Exception as e:
            logger.error(f"Resend email error: {e}", exc_info=True)
            return False


class GroupBookingEmailTemplates:
    """Email templates for group booking notifications"""

    @staticmethod
    def guest_booking_confirmation(gb: dict, hotel: dict) -> tuple[str, str]:
        """Email sent to guest when booking is created"""
        subject = f"Group Booking Request Received - {hotel['name']}"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 20px; border-radius: 8px; color: #fff;">
                <h1 style="margin: 0; color: #d4af37;">Aurum Hotels</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Luxury Hotel Management</p>
            </div>

            <div style="padding: 30px; background: #f9f7f4;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Group Booking Request Received</h2>

                <p>Dear {gb['contact_name']},</p>
                <p>Thank you for submitting your group booking request. We have received your request and will review it shortly.</p>

                <div style="background: #fff; padding: 20px; border-left: 4px solid #d4af37; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #d4af37;">Booking Details</h3>
                    <p><strong>Hotel:</strong> {hotel['name']}<br/>
                    <strong>Location:</strong> {hotel['city']}<br/>
                    <strong>Check-in:</strong> {gb['check_in']}<br/>
                    <strong>Check-out:</strong> {gb['check_out']}<br/>
                    <strong>Rooms:</strong> {gb['num_rooms']} {gb['room_type']}<br/>
                    <strong>Total Guests:</strong> {gb['total_guests']}<br/>
                    <strong>Total Amount:</strong> ${gb['total_amount']:.2f} (10% group discount applied)<br/>
                    <strong>Status:</strong> <span style="color: #ff9800; font-weight: bold;">Pending Approval</span></p>
                </div>

                <p>We will contact you at <strong>{gb['contact_phone']}</strong> within 24 hours with our response.</p>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    Best regards,<br/>
                    <strong>Aurum Hotels Management Team</strong>
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html

    @staticmethod
    def guest_booking_confirmed(gb: dict, hotel: dict) -> tuple[str, str]:
        """Email sent to guest when booking is confirmed"""
        subject = f"Group Booking Confirmed - {hotel['name']}"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 20px; border-radius: 8px; color: #fff;">
                <h1 style="margin: 0; color: #d4af37;">Aurum Hotels</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Luxury Hotel Management</p>
            </div>

            <div style="padding: 30px; background: #f9f7f4;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Your Group Booking is Confirmed!</h2>

                <p>Dear {gb['contact_name']},</p>
                <p>Great news! Your group booking request has been approved by {hotel['name']}.</p>

                <div style="background: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #2e7d32;">✓ Booking Confirmed</h3>
                    <p><strong>Hotel:</strong> {hotel['name']}<br/>
                    <strong>Check-in:</strong> {gb['check_in']}<br/>
                    <strong>Check-out:</strong> {gb['check_out']}<br/>
                    <strong>Rooms:</strong> {gb['num_rooms']} {gb['room_type']}<br/>
                    <strong>Total Amount:</strong> ${gb['total_amount']:.2f}<br/>
                    <strong>Reservation ID:</strong> #{str(gb['id']).zfill(6)}</p>
                </div>

                <p>The hotel will contact you shortly with check-in details and any special accommodations you requested.</p>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    Best regards,<br/>
                    <strong>Aurum Hotels Management Team</strong>
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html

    @staticmethod
    def guest_booking_cancelled(gb: dict, hotel: dict) -> tuple[str, str]:
        """Email sent to guest when booking is cancelled"""
        subject = f"Group Booking Cancelled - {hotel['name']}"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 20px; border-radius: 8px; color: #fff;">
                <h1 style="margin: 0; color: #d4af37;">Aurum Hotels</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Luxury Hotel Management</p>
            </div>

            <div style="padding: 30px; background: #f9f7f4;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Group Booking Cancelled</h2>

                <p>Dear {gb['contact_name']},</p>
                <p>Unfortunately, your group booking request for {hotel['name']} has been cancelled.</p>

                <div style="background: #ffebee; padding: 20px; border-left: 4px solid #f44336; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #c62828;">Booking Cancelled</h3>
                    <p><strong>Reservation ID:</strong> #{str(gb['id']).zfill(6)}<br/>
                    <strong>Check-in:</strong> {gb['check_in']}<br/>
                    <strong>Rooms:</strong> {gb['num_rooms']} {gb['room_type']}</p>
                </div>

                <p>Please feel free to contact the hotel for more information or to explore other options.</p>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    Best regards,<br/>
                    <strong>Aurum Hotels Management Team</strong>
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html

    @staticmethod
    def hotel_new_group_booking(gb: dict, guest: dict) -> tuple[str, str]:
        """Email sent to hotel when new group booking arrives"""
        subject = f"New Group Booking Request - {gb['num_rooms']} rooms"
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 20px; border-radius: 8px; color: #fff;">
                <h1 style="margin: 0; color: #d4af37;">Aurum Hotels - Admin</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">New Group Booking Request</p>
            </div>

            <div style="padding: 30px; background: #f9f7f4;">
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">New Group Booking Request</h2>

                <p>A new group booking request has been received and awaits your review.</p>

                <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #ff9800; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #e65100;">Request Details</h3>
                    <p><strong>Contact Person:</strong> {gb['contact_name']}<br/>
                    <strong>Phone:</strong> {gb['contact_phone']}<br/>
                    <strong>Number of Rooms:</strong> {gb['num_rooms']} × {gb['room_type']}<br/>
                    <strong>Total Guests:</strong> {gb['total_guests']}<br/>
                    <strong>Check-in:</strong> {gb['check_in']}<br/>
                    <strong>Check-out:</strong> {gb['check_out']}<br/>
                    <strong>Estimated Revenue:</strong> ${gb['total_amount']:.2f}</p>
                </div>

                {f'<div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 4px;"><strong>Special Requests:</strong><br/>{gb["special_requests"]}</div>' if gb.get('special_requests') else ''}

                <p><a href="http://localhost:5173/app/bookings" style="background: #d4af37; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Review in Dashboard</a></p>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    Reservation ID: #{str(gb['id']).zfill(6)}<br/>
                    <strong>Aurum Hotels Management System</strong>
                </p>
            </div>
        </body>
        </html>
        """
        return subject, html
