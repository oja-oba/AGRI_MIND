# =====================================
# 🍅 AgriMind — Tomato Disease Classifier (KNN + PCA + Visualization)
# =====================================

import streamlit as st
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from PIL import Image
import joblib
import matplotlib.pyplot as plt

# =====================================
# ⚙️ Paths
# =====================================
BASE_DIR = os.getcwd()
ARTIFACTS_PATH = os.path.join(BASE_DIR, "artifacts")
MODEL_PATH = os.path.join(ARTIFACTS_PATH, "tomato_knn_pca.joblib")
PCA_PATH = os.path.join(ARTIFACTS_PATH, "tomato_pca.joblib")
LABELS_PATH = os.path.join(ARTIFACTS_PATH, "labels.txt")

IMG_SIZE = (224, 224)

# =====================================
# 🧠 Load models + PCA + labels
# =====================================
@st.cache_resource
def load_models():
    knn = joblib.load(MODEL_PATH)
    pca = joblib.load(PCA_PATH)
    with open(LABELS_PATH, "r") as f:
        class_names = [line.strip() for line in f.readlines()]
    return knn, pca, class_names

knn, pca, class_names = load_models()

# =====================================
# 🧩 Feature Extractor
# =====================================
@st.cache_resource
def get_feature_extractor():
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights="imagenet",
        pooling="avg"
    )
    base_model.trainable = False
    model = models.Sequential([
        layers.Rescaling(1./255),
        base_model
    ])
    return model

feature_extractor = get_feature_extractor()

# =====================================
# 🌐 Streamlit UI
# =====================================
st.set_page_config(page_title="AgriMind 🍅", layout="centered")
st.title("🍅 AgriMind — Tomato Disease Classifier")
st.caption("KNN + PCA + Deep Features via MobileNetV2")

uploaded_file = st.file_uploader("📸 Upload a Tomato Leaf Image", type=["jpg", "jpeg", "png"])

if uploaded_file:
    img = Image.open(uploaded_file).convert("RGB").resize(IMG_SIZE)
    st.image(img, caption="Uploaded Image", use_column_width=True)

    # Extract deep features
    img_array = np.expand_dims(np.array(img), axis=0)
    features = feature_extractor.predict(img_array, verbose=0)
    features_pca = pca.transform(features)

    # Predict using KNN
    distances, indices = knn.kneighbors(features_pca, n_neighbors=3)
    pred_idx = knn.predict(features_pca)[0]
    pred_label = class_names[pred_idx]
    confidence = np.exp(-np.mean(distances)) * 100  # pseudo-confidence

    # ==============================
    # 🧩 Prediction Results
    # ==============================
    st.subheader("🧠 Prediction Result")
    st.success(f"**Predicted Disease:** {pred_label}")
    st.metric(label="Confidence", value=f"{confidence:.2f}%")

    # ==============================
    # 📊 PCA Feature Visualization
    # ==============================
    st.subheader("📈 Feature Visualization (PCA Space)")
    fig, ax = plt.subplots(figsize=(6, 4))
    projected = features_pca[0]
    ax.bar(range(len(projected)), projected, color="tomato")
    ax.set_title("Feature Projection after PCA")
    ax.set_xlabel("Principal Component")
    ax.set_ylabel("Feature Value")
    st.pyplot(fig)

    st.caption("✅ Prediction complete using KNN + PCA features.")
else:
    st.info("Upload a tomato leaf image to begin diagnosis 🍃.")