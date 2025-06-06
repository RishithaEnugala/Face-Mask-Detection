from __future__ import division, print_function
import sys
import os
import glob
import re
import numpy as np
from flask import jsonify

from keras.applications.imagenet_utils import preprocess_input, decode_predictions
from keras.models import load_model
from keras.preprocessing import image

from flask import Flask, redirect, url_for, request, render_template
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIServer

from PIL import Image
app = Flask(__name__)

MODEL_PATH = 'ourmodel.h5'

model = load_model(MODEL_PATH) 
model.make_predict_function()       

def model_predict(img_path, model):
    img = image.load_img(img_path, target_size=(128, 128))

    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)

    preds = model.predict(x)
    pre_c = np.argmax(preds)
    classn= [0,1]
    pcn = classn[pre_c]
    return pcn



@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']

        basepath = os.path.dirname(__file__)
        file_path = os.path.join(
            basepath, 'uploads', secure_filename(f.filename))
        f.save(file_path)

        pcn = model_predict(file_path, model)

        if pcn ==0:
            result = "Person is not having mask"
        else:
            result = "Person is with mask"
        return jsonify(result=result)
    return None

if __name__ == '__main__':
    app.run(debug=True)
