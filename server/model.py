import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Conv2D, MaxPooling2D, Flatten, Dropout, BatchNormalization, GlobalAveragePooling2D
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ReduceLROnPlateau
import matplotlib.pyplot as plt

# Define folder names
folders = ['Keyboards', 'Mobile', 'Mouses', 'TV', 'camera', 'laptop', 'microwave', 'smartwatch']
data_dir = os.path.join("archive (5)", "dataset")

# Prepare the dataset
images = []
labels = []

  # Update with the path to your dataset

for label in folders:
    folder_path = os.path.join(data_dir, label)
    if os.path.isdir(folder_path):
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if file_path.endswith(('png', 'jpg', 'jpeg')):  # Check for image files
                img = tf.keras.preprocessing.image.load_img(file_path, target_size=(128, 128))
                img_array = tf.keras.preprocessing.image.img_to_array(img)
                images.append(img_array)
                labels.append(label)

images = np.array(images)
labels = np.array(labels)

# Encode labels numerically
label_encoder = LabelEncoder()
numeric_labels = label_encoder.fit_transform(labels)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(images, numeric_labels, test_size=0.2, random_state=42)

# Normalize the images
X_train = X_train / 255.0
X_test = X_test / 255.0

# Data augmentation
data_gen = ImageDataGenerator(rotation_range=30,
                              width_shift_range=0.2,
                              height_shift_range=0.2,
                              shear_range=0.2,
                              zoom_range=0.2,
                              horizontal_flip=True)
data_gen.fit(X_train)

# Use a pretrained model (MobileNetV2)
base_model = tf.keras.applications.MobileNetV2(input_shape=(128, 128, 3),
                                               include_top=False,
                                               weights='imagenet')

base_model.trainable = False  # Freeze the base model

# Build the neural network model
model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(len(folders), activation='softmax')
])

# Compile the model
model.compile(optimizer=Adam(learning_rate=0.001),
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Callbacks
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.2, patience=3, min_lr=0.00001, verbose=1)

# Train the model for 20 epochs
history = model.fit(data_gen.flow(X_train, y_train, batch_size=32),
                    validation_data=(X_test, y_test),
                    epochs=20
                    )

# Plotting Accuracy and Loss Graphs
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.legend()
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.legend()
plt.title('Training and Validation Loss')
plt.show()

# Instead of model.save('my_model.h5')
# Save in both formats for compatibility with different runtimes.
model.save('my_model.keras')
model.save('my_model.h5')

# Persist label classes used by the inference server.
np.save('label_encoder_classes.npy', label_encoder.classes_)