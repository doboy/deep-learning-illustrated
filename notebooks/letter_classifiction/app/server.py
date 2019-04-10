import json

from flask import Flask
from flask import request
from flask import render_template
from keras.models import load_model
import tensorflow as tf
import numpy as np

model = load_model('./letters.h5')
graph = tf.get_default_graph()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=['POST'])
def predict_handler():
    with graph.as_default():
      data = json.loads(request.data.decode('utf-8'))
      print(data)
      prediction = predict(data)

      best_so_far = None
      for (i, x) in enumerate(prediction[0]):
        if not best_so_far:
            best_so_far = (i, x)
        if x > best_so_far[1]:
            best_so_far = (i, x)

      print(best_so_far)
      return json.dumps(chr(ord('a') + best_so_far[0]))

def predict(_28x28):
    _28x28 = np.array(_28x28)
    return model.predict(
        np.expand_dims(
            _28x28,
            axis=0
        ))
