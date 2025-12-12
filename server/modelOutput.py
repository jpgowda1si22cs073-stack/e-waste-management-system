

import numpy as np
from sklearn.preprocessing import LabelEncoder

# Load the saved label encoder classes from the .npy file
encoder_classes = np.load('label_encoder_classes.npy', allow_pickle=True)

# Initialize and set classes to the LabelEncoder instance
label_encoder = LabelEncoder()
label_encoder.classes_ = encoder_classes


import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np



# Load the trained model
model = tf.keras.models.load_model('my_model.h5')

# Define function to predict and classify image
def classify_image(img_path):
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=(128, 128))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    
    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class = label_encoder.inverse_transform([predicted_class_index])[0]
    
    print(f'The image is classified as: {predicted_class}')
    components = e_waste_data.get(predicted_class, {})
    print(f"Components of {predicted_class}:")
    for component, details in components.items():
        print(f"{component}:")
        for detail_key, detail_value in details.items():
            print(f"  {detail_key}: {detail_value}")

# Test the function
classify_image('OIP.jpg')