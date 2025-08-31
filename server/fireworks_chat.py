import requests
import json

url = "https://api.fireworks.ai/inference/v1/chat/completions"
payload = {
  "model": "accounts/fireworks/models/deepseek-v3p1",
  "max_tokens": 512,
  "top_p": 1,
  "top_k": 40,
  "presence_penalty": 0,
  "frequency_penalty": 0,
  "temperature": 0.5,
  "messages": [
    {
      "role": "user",
      "content": "Hello, can you help me?"
    }
  ]
}
headers = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "Authorization": "Bearer fw_3ZV5jxHGEEtfYgFKhqP3wA2J"
}

response = requests.request("POST", url, headers=headers, data=json.dumps(payload))
print(response.json())
