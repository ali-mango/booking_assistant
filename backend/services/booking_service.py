from services import google_calendar_service as gcal
from datetime import date, time, datetime, timedelta
from services.supabase_service import supabase

BUSINESS_ID = "a0000000-0000-0000-0000-000000000001"


def get_services() -> list[dict]:
    """Get all active services."""
    result = (
        supabase.table("services")
        .select("id, name, duration_minutes, price, description")
        .eq("business_id", BUSINESS_ID)
        .eq("is_active", True)
        .execute()
    )
    return result.data


def get_business_info() -> dict:
    """Get business details."""
    result = (
        supabase.table("business")
        .select("*")
        .eq("id", BUSINESS_ID)
        .execute()
    )
    return result.data[0] if result.data else {}


def get_available_slots(target_date: str, service_name: str) -> list[str]:
    """
    Get available time slots for a given date and service.
    target_date format: 'YYYY-MM-DD'
    Returns list of available times like ['09:00', '09:30', '10:00']
    """
  # Get business info
    business = get_business_info()
    if not business:
        return []

    opening_str = str(business["opening_time"])
    closing_str = str(business["closing_time"])
    time_format = "%H:%M:%S" if len(opening_str) > 5 else "%H:%M"
    opening = datetime.strptime(opening_str, time_format)
    closing = datetime.strptime(closing_str, time_format)

    # Convert days_open to integers (handles both int and string arrays)
    days_open = [int(d) for d in business["days_open"]]

    # Check if the date is a valid business day
    booking_date = date.fromisoformat(target_date)
    if booking_date.isoweekday() not in days_open:
        return []

    # Don't allow booking in the past
    today = datetime.now().date()
    if booking_date < today:
        return []

    # Get service duration
    service = (
        supabase.table("services")
        .select("duration_minutes")
        .eq("business_id", BUSINESS_ID)
        .ilike("name", f"%{service_name}%")
        .execute()
    )
    if not service.data:
        return []
    duration = service.data[0]["duration_minutes"]

    # Get existing bookings for that date
    existing = (
        supabase.table("bookings")
        .select("start_time, end_time")
        .eq("business_id", BUSINESS_ID)
        .eq("booking_date", target_date)
        .eq("status", "confirmed")
        .execute()
    )

    booked_slots = []
    for b in existing.data:
        start = datetime.strptime(str(b["start_time"]), "%H:%M:%S")
        end = datetime.strptime(str(b["end_time"]), "%H:%M:%S")
        booked_slots.append((start, end))

    # Get blocked times for that date
    blocked = (
        supabase.table("blocked_times")
        .select("start_time, end_time, is_full_day")
        .eq("business_id", BUSINESS_ID)
        .eq("blocked_date", target_date)
        .execute()
    )

    for b in blocked.data:
        if b["is_full_day"]:
            return []  # Entire day is blocked
        start = datetime.strptime(str(b["start_time"]), "%H:%M:%S")
        end = datetime.strptime(str(b["end_time"]), "%H:%M:%S")
        booked_slots.append((start, end))

    # Generate all possible slots
    available = []
    current = opening
    while current + timedelta(minutes=duration) <= closing:
        slot_end = current + timedelta(minutes=duration)

        # Check if this slot overlaps with any booking
        is_available = True
        for booked_start, booked_end in booked_slots:
            if current < booked_end and slot_end > booked_start:
                is_available = False
                break

        if is_available:
            available.append(current.strftime("%H:%M"))

        current += timedelta(minutes=30)  # Move by slot_duration

    return available


def create_booking(
    service_name: str,
    customer_name: str,
    customer_phone: str,
    booking_date: str,
    start_time: str,
) -> dict:
    """
    Create a new booking.
    Returns the booking details or an error.
    """
    # Find the service
    service = (
        supabase.table("services")
        .select("id, name, duration_minutes, price")
        .eq("business_id", BUSINESS_ID)
        .ilike("name", f"%{service_name}%")
        .execute()
    )
    if not service.data:
        return {"error": f"Service '{service_name}' not found"}

    svc = service.data[0]
    duration = svc["duration_minutes"]

    # Calculate end time
    start_dt = datetime.strptime(start_time, "%H:%M")
    end_dt = start_dt + timedelta(minutes=duration)
    end_time_str = end_dt.strftime("%H:%M")

# Normalize start_time to HH:MM 24-hour format
    start_time = start_time.strip()
    # Handle 12-hour format (e.g., "9:00 AM", "2:00 PM")
    if "AM" in start_time.upper() or "PM" in start_time.upper():
        try:
            parsed = datetime.strptime(start_time.upper().replace(" ", ""), "%I:%M%p")
            start_time = parsed.strftime("%H:%M")
        except ValueError:
            try:
                parsed = datetime.strptime(start_time.upper(), "%I:%M %p")
                start_time = parsed.strftime("%H:%M")
            except ValueError:
                pass
    # Handle missing leading zero (e.g., "9:00")
    if len(start_time) == 4 and start_time[1] == ":":
        start_time = "0" + start_time
        
    # Verify the slot is still available
    available = get_available_slots(booking_date, service_name)
    if start_time not in available:
        return {
            "error": f"The {start_time} slot is not available. Available slots: {', '.join(available)}"
        }
    # Create the booking
    result = supabase.table("bookings").insert({
        "business_id": BUSINESS_ID,
        "service_id": svc["id"],
        "customer_name": customer_name,
        "customer_phone": customer_phone,
        "booking_date": booking_date,
        "start_time": start_time,
        "end_time": end_time_str,
        "status": "confirmed",
    }).execute()

    if result.data:
            booking_id = result.data[0]["id"]

            # Sync to Google Calendar if connected
            google_event_id = ""
            if gcal.is_connected():
                cal_result = gcal.create_calendar_event(
                    summary=svc["name"],
                    description=f"Service: {svc['name']}\nPrice: ₱{float(svc['price'])}\nBooked via AI Assistant",
                    start_date=booking_date,
                    start_time=start_time,
                    end_time=end_time_str,
                    customer_name=customer_name,
                    customer_phone=customer_phone,
                )
                if cal_result.get("success"):
                    google_event_id = cal_result.get("event_id", "")
                    # Save the Google event ID to the booking
                    supabase.table("bookings").update(
                        {"google_event_id": google_event_id}
                    ).eq("id", booking_id).execute()

            return {
                "success": True,
                "booking_id": booking_id,
                "service": svc["name"],
                "price": float(svc["price"]),
                "date": booking_date,
                "start_time": start_time,
                "end_time": end_time_str,
                "customer_name": customer_name,
                "calendar_synced": bool(google_event_id),
            }
    return {"error": "Failed to create booking"}


def cancel_booking(customer_phone: str, booking_date: str = None) -> dict:
    """Cancel a booking by phone number."""
    query = (
        supabase.table("bookings")
        .select("id, booking_date, start_time, services(name)")
        .eq("customer_phone", customer_phone)
        .eq("status", "confirmed")
    )
    if booking_date:
        query = query.eq("booking_date", booking_date)

    result = query.order("booking_date").execute()

    if not result.data:
        return {"error": "No confirmed bookings found with that phone number."}

    # Cancel the most recent/matching booking
    booking = result.data[0]
    supabase.table("bookings").update(
        {"status": "cancelled"}
    ).eq("id", booking["id"]).execute()

    return {
        "success": True,
        "cancelled_booking": booking,
    }