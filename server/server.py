from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os
import sys
from werkzeug.utils import secure_filename

try:
    import tensorflow as tf
    TENSORFLOW_IMPORT_ERROR = None
except Exception as e:
    tf = None
    TENSORFLOW_IMPORT_ERROR = str(e)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# E-waste data
e_waste_data = {
    "Mobile": {
        "Gold": {"Percentage Composition (%)": 0.03, "Category": "Metal", "Amount (USD)": 18.0},
        "Silver": {"Percentage Composition (%)": 0.05, "Category": "Metal", "Amount (USD)": 0.375},
        "Copper": {"Percentage Composition (%)": 15.0, "Category": "Metal", "Amount (USD)": 1.5},
        "Lithium": {"Percentage Composition (%)": 10.0, "Category": "Battery", "Amount (USD)": 15.0},
        "Neodymium": {"Percentage Composition (%)": 0.1, "Category": "Rare Earth", "Amount (USD)": 0.05}
    },
    "TV": {
        "Aluminum": {"Percentage Composition (%)": 25.0, "Category": "Metal", "Amount (USD)": 0.625},
        "Lead": {"Percentage Composition (%)": 3.0, "Category": "Metal", "Amount (USD)": 0.045}
    },
    "camera": {
        "Aluminum": {"Percentage Composition (%)": 20.0, "Category": "Metal", "Amount (USD)": 0.5},
        "Copper": {"Percentage Composition (%)": 15.0, "Category": "Metal", "Amount (USD)": 1.5},
        "Gold": {"Percentage Composition (%)": 0.05, "Category": "Metal", "Amount (USD)": 30.0},
        "Lithium": {"Percentage Composition (%)": 10.0, "Category": "Battery", "Amount (USD)": 15.0},
        "Neodymium": {"Percentage Composition (%)": 0.1, "Category": "Rare Earth", "Amount (USD)": 0.05}
    },
    "microwave": {
        "Aluminum": {"Percentage Composition (%)": 20.0, "Category": "Metal", "Amount (USD)": 0.5},
        "Copper": {"Percentage Composition (%)": 10.0, "Category": "Metal", "Amount (USD)": 1.0},
        "Steel": {"Percentage Composition (%)": 40.0, "Category": "Other", "Amount (USD)": 0.2}
    },
    "smartwatch": {
        "Gold": {"Percentage Composition (%)": 0.03, "Category": "Metal", "Amount (USD)": 18.0},
        "Silver": {"Percentage Composition (%)": 0.05, "Category": "Metal", "Amount (USD)": 0.375},
        "Copper": {"Percentage Composition (%)": 10.0, "Category": "Metal", "Amount (USD)": 1.0},
        "Lithium": {"Percentage Composition (%)": 5.0, "Category": "Battery", "Amount (USD)": 7.5},
        "Aluminum": {"Percentage Composition (%)": 10.0, "Category": "Metal", "Amount (USD)": 0.25}
    },
    "keyboard": {
        "Copper": {"Percentage Composition (%)": 10.0, "Category": "Metal", "Amount (USD)": 1.0},
        "Lead": {"Percentage Composition (%)": 5.0, "Category": "Metal", "Amount (USD)": 0.1},
        "ABS": {"Percentage Composition (%)": 50.0, "Category": "Plastic", "Amount (USD)": 0.05},
        "Circuit Boards": {"Percentage Composition (%)": 20.0, "Category": "Other", "Amount (USD)": 5.0}
    },
    "mouse": {
        "Aluminum": {"Percentage Composition (%)": 15.0, "Category": "Metal", "Amount (USD)": 0.5},
        "Copper": {"Percentage Composition (%)": 10.0, "Category": "Metal", "Amount (USD)": 1.0},
        "ABS": {"Percentage Composition (%)": 60.0, "Category": "Plastic", "Amount (USD)": 0.05},
        "Circuit Boards": {"Percentage Composition (%)": 15.0, "Category": "Other", "Amount (USD)": 5.0}
    },
    "laptop": {
        "Gold": {"Percentage Composition (%)": 0.05, "Category": "Metal", "Amount (USD)": 30.0},
        "Silver": {"Percentage Composition (%)": 0.1, "Category": "Metal", "Amount (USD)": 0.75},
        "Copper": {"Percentage Composition (%)": 20.0, "Category": "Metal", "Amount (USD)": 1.5},
        "Polycarbonate": {"Percentage Composition (%)": 30.0, "Category": "Plastic", "Amount (USD)": 0.05},
        "Circuit Boards": {"Percentage Composition (%)": 10.0, "Category": "Other", "Amount (USD)": 5.0},
        "Batteries": {"Percentage Composition (%)": 5.0, "Category": "Battery", "Amount (USD)": 7.5}
    }
}

# Load model and label encoder lazily with fault tolerance so the API can still start.
model = None
label_encoder = None
MODEL_LOAD_ERROR = None


def initialize_model():
    global model, label_encoder, MODEL_LOAD_ERROR

    if tf is None:
        MODEL_LOAD_ERROR = f"TensorFlow import failed: {TENSORFLOW_IMPORT_ERROR}"
        return

    tf_version = getattr(tf, "__version__", "unknown") if tf is not None else "unavailable"
    runtime = f"python={sys.executable}, tf={tf_version}"
    last_error = None

    # Prefer H5 first because it has been validated in this project runtime.
    for model_path in ('my_model.h5', 'my_model.keras'):
        if not os.path.exists(model_path):
            continue

        try:
            model = tf.keras.models.load_model(model_path, compile=False)
            label_encoder = LabelEncoder()
            label_encoder.classes_ = np.load('label_encoder_classes.npy', allow_pickle=True)
            MODEL_LOAD_ERROR = None
            print(f"[startup] Loaded model from {model_path} ({runtime})")
            return
        except Exception as e:
            last_error = f"{model_path}: {e} ({runtime})"

    MODEL_LOAD_ERROR = last_error or f"No model file found (expected my_model.h5 or my_model.keras) ({runtime})"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def classify_image(img_path):
    if model is None or label_encoder is None:
        return {
            'success': False,
            'error': f"Model unavailable: {MODEL_LOAD_ERROR or 'unknown model initialization error'}"
        }

    try:
        img = tf.keras.preprocessing.image.load_img(img_path, target_size=(128, 128))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0
        
        predictions = model.predict(img_array)
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        predicted_class = label_encoder.inverse_transform([predicted_class_index])[0]
        
        components = e_waste_data.get(predicted_class, {})
        
        return {
            'success': True,
            'classification': predicted_class,
            'components': components,
            'confidence': float(predictions[0][predicted_class_index])
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

@app.route('/classify', methods=['POST'])
def classify_uploaded_image():
    if model is None or label_encoder is None:
        return jsonify({'error': f"Model unavailable: {MODEL_LOAD_ERROR}"}), 503

    # Check if image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    # Check if a file was selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if the file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Classify the image
        result = classify_image(filepath)
        
        # Clean up - remove the uploaded file
        os.remove(filepath)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'error': result['error']}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    initialize_model()
    if MODEL_LOAD_ERROR:
        print(f"[startup] Model initialization failed: {MODEL_LOAD_ERROR}")
    app.run(debug=True, port=5000)