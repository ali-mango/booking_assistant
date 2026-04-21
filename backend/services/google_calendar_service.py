import json
import os
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from config import get_settings

settings = get_settings()

SCOPES = ["https://www.googleapis.com/auth/calendar"]
TOKEN_FILE = "google_token.json"

CLIENT_CONFIG = {
    "web": {
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uris": [settings.google_redirect_uri],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
}


# Store flow state for PKCE verification
_active_flow = {}


def get_auth_url() -> str:
    """Generate the Google OAuth2 authorization URL."""
    global _active_flow
    flow = Flow.from_client_config(CLIENT_CONFIG, scopes=SCOPES)
    flow.redirect_uri = settings.google_redirect_uri

    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )

    # Save the flow so we can reuse it in the callback (preserves code_verifier)
    _active_flow[state] = flow
    return auth_url


def handle_callback(authorization_code: str, state: str = None) -> dict:
    """Exchange the authorization code for tokens and save them."""
    global _active_flow

    # Reuse the same flow that generated the auth URL
    if state and state in _active_flow:
        flow = _active_flow.pop(state)
    else:
        flow = Flow.from_client_config(CLIENT_CONFIG, scopes=SCOPES)
        flow.redirect_uri = settings.google_redirect_uri

    flow.fetch_token(code=authorization_code)
    credentials = flow.credentials

    # Save tokens to file
    token_data = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
    }

    with open(TOKEN_FILE, "w") as f:
        json.dump(token_data, f)

    return {"success": True, "message": "Google Calendar connected!"}


def get_credentials() -> Credentials | None:
    """Load saved credentials from file."""
    if not os.path.exists(TOKEN_FILE):
        return None

    with open(TOKEN_FILE, "r") as f:
        token_data = json.load(f)

    credentials = Credentials(
        token=token_data["token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri=token_data["token_uri"],
        client_id=token_data["client_id"],
        client_secret=token_data["client_secret"],
        scopes=token_data.get("scopes"),
    )

    return credentials


def is_connected() -> bool:
    """Check if Google Calendar is connected."""
    creds = get_credentials()
    return creds is not None


def create_calendar_event(
    summary: str,
    description: str,
    start_date: str,
    start_time: str,
    end_time: str,
    customer_name: str,
    customer_phone: str,
) -> dict:
    """
    Create a Google Calendar event for a booking.
    Returns the event ID or an error.
    """
    creds = get_credentials()
    if not creds:
        return {"error": "Google Calendar not connected"}

    try:
        service = build("calendar", "v3", credentials=creds)

        # Build datetime strings (Asia/Manila timezone)
        start_datetime = f"{start_date}T{start_time}:00"
        end_datetime = f"{start_date}T{end_time}:00"

        event = {
            "summary": f"{summary} - {customer_name}",
            "description": f"Customer: {customer_name}\nPhone: {customer_phone}\n\n{description}",
            "start": {
                "dateTime": start_datetime,
                "timeZone": "Asia/Manila",
            },
            "end": {
                "dateTime": end_datetime,
                "timeZone": "Asia/Manila",
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 60},
                    {"method": "popup", "minutes": 15},
                ],
            },
        }

        created_event = service.events().insert(
            calendarId="primary", body=event
        ).execute()

        return {
            "success": True,
            "event_id": created_event.get("id"),
            "link": created_event.get("htmlLink"),
        }

    except Exception as e:
        return {"error": str(e)}


def delete_calendar_event(event_id: str) -> dict:
    """Delete a Google Calendar event."""
    creds = get_credentials()
    if not creds:
        return {"error": "Google Calendar not connected"}

    try:
        service = build("calendar", "v3", credentials=creds)
        service.events().delete(
            calendarId="primary", eventId=event_id
        ).execute()
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}