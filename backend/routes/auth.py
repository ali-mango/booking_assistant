from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, HTMLResponse
from services import google_calendar_service as gcal

router = APIRouter()


@router.get("/auth/google")
async def google_auth():
    """Redirect to Google OAuth2 login."""
    auth_url = gcal.get_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/auth/callback")
async def google_callback(request: Request):
    """Handle Google OAuth2 callback."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code:
        return HTMLResponse("<h1>Error: No authorization code received</h1>", status_code=400)

    result = gcal.handle_callback(code, state)

    if result.get("success"):
        return HTMLResponse("""
            <html>
            <body style="font-family: Arial; text-align: center; padding-top: 100px;">
                <h1>Google Calendar Connected!</h1>
                <p>You can close this window and go back to your assistant.</p>
            </body>
            </html>
        """)
    else:
        return HTMLResponse(f"<h1>Error: {result.get('error')}</h1>", status_code=500)


@router.get("/auth/status")
async def auth_status():
    """Check if Google Calendar is connected."""
    return {"connected": gcal.is_connected()}