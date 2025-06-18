from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

chat_history = []
OLLAMA_URL = "http://localhost:11434/api/chat"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    chat_history.append({"role": "user", "content": user_input})
    payload = {
        "model": "llama3",
        "messages": chat_history,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    reply = response.json()["message"]["content"]
    chat_history.append({"role": "assistant", "content": reply})
    return jsonify({"reply": reply})

if __name__ == '__main__':
    app.run(debug=True)