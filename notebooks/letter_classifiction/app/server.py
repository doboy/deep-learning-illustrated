from flask import Flask
from flask import request
from flask import render_template
from keras.models import load_model

app = Flask(__name__)
model = load_model('./letters.h5')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict")
def predict():
    print(request.body)
    return
