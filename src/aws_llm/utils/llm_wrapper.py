import json
import requests

class AWSLLMWrapper:
    def __init__(self, model: str, stream: bool = False):
        self.model = model
        self.stream = stream
        self.messages = []

    def invoke(self, prompt: str):
        """Generator that yields each chunk as it arrives"""
        self.messages.append({"role": "user", "content": prompt})
        try:
            response = requests.post("http://ec2-13-49-225-30.eu-north-1.compute.amazonaws.com:8080/v1/chat/completions", 
                                json={"model": self.model, "messages": self.messages, "stream": self.stream }, 
                                headers={"Content-Type": "application/json", "Authorization": "Bearer demo"},
                                stream=True)
        except Exception as e:
            print(f"Error invoking AWS LLM: {e}")
            return
            
        full_response = ""

        if self.stream:
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data.strip() == '[DONE]':
                            break
                        
                        try:
                            chunk = json.loads(data)
                            full_response += chunk["choices"][-1]["delta"]["content"]
                            yield chunk["choices"][-1]["delta"]["content"]
                        except json.JSONDecodeError:
                            continue
        else:
            try:
                yield response.json()["choices"][-1]["message"]["content"]
            except json.JSONDecodeError as e:
                yield {"error": "Invalid JSON response"}


        self.messages.append({"role": "assistant", "content": full_response})


    