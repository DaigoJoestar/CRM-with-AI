import requests
from .config import settings

class GroqChatCompletions:
    def __init__(self, client):
        self.client = client

    def create(self, model: str, messages: list):
        headers = {
            "Authorization": f"Bearer {self.client.api_key}",
            "Content-Type": "application/json"
        }
        # Convert to OpenAI-compatible message format if needed
        if isinstance(messages, list):
            if all(isinstance(item, dict) and item.get("role") in {"user", "assistant", "system"} for item in messages):
                payload_messages = messages
            else:
                input_text = "\n".join(
                    item.get("content", "") if isinstance(item, dict) else str(item)
                    for item in messages
                )
                payload_messages = [{"role": "user", "content": input_text}]
        else:
            payload_messages = [{"role": "user", "content": str(messages)}]

        payload = {
            "model": model,
            "messages": payload_messages,
            "max_tokens": 512
        }
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

class GroqClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.chat = lambda: None
        self.chat = type("c", (), {"completions": GroqChatCompletions(self)})()

client = GroqClient(settings.groq_api_key)
