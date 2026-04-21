import json
from datetime import datetime, timedelta
from groq import Groq
from config import get_settings
from services import booking_service

settings = get_settings()
client = Groq(api_key=settings.groq_api_key)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_services",
            "description": "Get the list of dental services offered with prices and duration",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_available_slots",
            "description": "Check available appointment time slots for a specific date and service",
            "parameters": {
                "type": "object",
                "properties": {
                    "target_date": {
                        "type": "string",
                        "description": "The date to check in YYYY-MM-DD format",
                    },
                    "service_name": {
                        "type": "string",
                        "description": "Name of the dental service (e.g. 'Teeth Cleaning', 'Checkup', 'Extraction')",
                    },
                },
                "required": ["target_date", "service_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_booking",
            "description": "Create a confirmed dental appointment booking",
            "parameters": {
                "type": "object",
                "properties": {
                    "service_name": {
                        "type": "string",
                        "description": "Name of the dental service",
                    },
                    "customer_name": {
                        "type": "string",
                        "description": "Full name of the customer",
                    },
                    "customer_phone": {
                        "type": "string",
                        "description": "Customer's phone number",
                    },
                    "booking_date": {
                        "type": "string",
                        "description": "Date of the appointment in YYYY-MM-DD format",
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Start time of the appointment in HH:MM format (24-hour)",
                    },
                },
                "required": ["service_name", "customer_name", "customer_phone", "booking_date", "start_time"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_booking",
            "description": "Cancel an existing booking using the customer's phone number",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_phone": {
                        "type": "string",
                        "description": "Phone number used when booking",
                    },
                    "booking_date": {
                        "type": "string",
                        "description": "Date of the booking to cancel in YYYY-MM-DD format (optional)",
                    },
                },
                "required": ["customer_phone"],
            },
        },
    },
]

today = datetime.now().strftime("%Y-%m-%d")
tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
day_name = datetime.now().strftime("%A")

SYSTEM_PROMPT = f"""You are a friendly, multilingual receptionist AI for SmileCare Dental Clinic.

Today's date is {today} ({day_name}).
Tomorrow's date is {tomorrow}.

Clinic info:
- Address: 123 Main Street, Makati City
- Phone: 0917-123-4567
- Hours: Monday-Saturday, 9:00 AM - 5:00 PM (closed Sundays)

Your job:
1. Help customers book dental appointments
2. Answer questions about services and pricing
3. Help cancel or reschedule appointments
4. Be warm, professional, and concise

Booking flow:
1. Ask what service they need (or show the menu if they're unsure)
2. Ask their preferred date and time
3. Check available slots using the get_available_slots function
4. Ask for their name and phone number
5. Confirm all details before creating the booking
6. Use create_booking to finalize

Rules:
- Detect the customer's language and respond in the same language
- Always confirm details before booking
- If a slot is unavailable, suggest alternatives
- Convert relative dates like "tomorrow", "next Monday" to actual YYYY-MM-DD dates
- Show times in 12-hour format to customers (e.g., "9:30 AM" not "09:30")
- Always mention the price when discussing services
- Don't book without a name AND phone number
"""


def execute_function(name: str, args: dict) -> str:
    """Execute a booking function and return the result as a string."""
    if name == "get_services":
        result = booking_service.get_services()
        return json.dumps(result)
    elif name == "get_available_slots":
        result = booking_service.get_available_slots(
            args["target_date"], args["service_name"]
        )
        return json.dumps(result)
    elif name == "create_booking":
        result = booking_service.create_booking(
            args["service_name"],
            args["customer_name"],
            args["customer_phone"],
            args["booking_date"],
            args["start_time"],
        )
        return json.dumps(result)
    elif name == "cancel_booking":
        result = booking_service.cancel_booking(
            args["customer_phone"],
            args.get("booking_date"),
        )
        return json.dumps(result)
    return json.dumps({"error": "Unknown function"})


def get_chat_response(
    user_message: str,
    history: list[dict] | None = None,
) -> tuple[str, int]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if history:
        messages.extend(history)

    messages.append({"role": "user", "content": user_message})

    total_tokens = 0

    # Loop to handle function calls (AI might call multiple functions)
    for _ in range(5):  # Max 5 rounds of function calling
        response = client.chat.completions.create(
            model=settings.model_name,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=settings.max_tokens,
            temperature=0.7,
        )

        if response.usage:
            total_tokens += response.usage.total_tokens

        choice = response.choices[0]

        # If no tool calls, return the text response
     # If no tool calls, return the text response
        if not choice.message.tool_calls:
            # Clean up any leaked function call text
            content = choice.message.content or ""
            # Remove any raw function XML that leaked into the response
            import re
            content = re.sub(r'</?function[^>]*>', '', content)
            content = re.sub(r'function=\w+>[^<]*</function>', '', content)
            content = content.strip()
            return content, total_tokens
        
        # Process tool calls
        messages.append(choice.message)

        for tool_call in choice.message.tool_calls:
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            result = execute_function(func_name, func_args)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

    # Fallback if we hit max rounds
    return "I'm sorry, I'm having trouble processing that. Could you try again?", total_tokens


def generate_title(user_message: str) -> str:
    response = client.chat.completions.create(
        model=settings.model_name,
        messages=[
            {
                "role": "system",
                "content": "Generate a short title (max 6 words) for a conversation that starts with this message. Return ONLY the title, no quotes, no extra text.",
            },
            {"role": "user", "content": user_message},
        ],
        max_tokens=20,
        temperature=0.5,
    )
    return response.choices[0].message.content.strip()