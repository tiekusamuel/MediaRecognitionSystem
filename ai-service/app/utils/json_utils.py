import json


def parse_json(text: str):

    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    return json.loads(text)