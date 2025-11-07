import os
import requests
import numpy as np
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from PIL import Image
import joblib
import logging

# NEW: TensorFlow feature extractor imports
try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
except Exception as e:
    raise RuntimeError(
        "TensorFlow is required for feature extraction. Install it with:\n\n"
        "  pip install tensorflow\n\n"
        f"Import error: {e}"
    )

# ============================
# ✅ Logging
# ============================
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("whatsapp")

# ============================
# ✅ Load Model + PCA + Labels
# ============================
BASE_DIR = os.getcwd()
MODEL_PATH = os.path.join(BASE_DIR, "tomato_knn_pca.joblib")   # KNN (trained on 1280-d features)
PCA_PATH   = os.path.join(BASE_DIR, "tomato_pca.joblib")     # PCA fitted on 1280-d features
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

log.info("Loading PCA, KNN model, labels...")

pca = joblib.load(PCA_PATH)
model = joblib.load(MODEL_PATH)

with open(LABELS_PATH, "r") as f:
    LABELS = [x.strip() for x in f.readlines()]

log.info(f"✅ Loaded {len(LABELS)} labels.")
log.info("✅ Ready to predict.")

# ============================
# ✅ Build Feature Extractor (1280-d)
# ============================
# MobileNetV2 (imagenet), no top, global-average-pooling => 1280 features
FEATURE_IMG_SIZE = (224, 224)
log.info("Loading MobileNetV2 feature extractor (imagenet, pooling=avg)...")
feature_extractor = MobileNetV2(
    input_shape=FEATURE_IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
    pooling="avg"   # <- gives 1280-d vector
)
log.info("✅ Feature extractor ready (output: 1280 dims).")

# ============================
# ✅ Twilio Image Downloader (Fix for 401)
# ============================
def download_media(media_url: str, out_path: str) -> str:
    """Download Twilio media using AUTH (fixes the 401 Forbidden error)."""

    TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")

    if not TWILIO_SID or not TWILIO_AUTH:
        raise ValueError("❌ Twilio credentials missing. Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN")

    log.info(f"🟦 Downloading media with Twilio auth: {media_url}")

    resp = requests.get(
        media_url,
        auth=(TWILIO_SID, TWILIO_AUTH),     # ✅ REQUIRED FOR WHATSAPP MEDIA
        timeout=20,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    log.info(f"🟧 Media download status: {resp.status_code} {resp.reason}")

    if resp.status_code != 200:
        raise ValueError(f"Failed to download media: HTTP {resp.status_code}")

    content_type = resp.headers.get("Content-Type", "")
    log.info(f"🟩 Content-Type: {content_type}")

    if "image" not in content_type:
        raise ValueError("❌ File is not an image.")

    with open(out_path, "wb") as f:
        f.write(resp.content)

    return out_path

# ============================
# ✅ Predict Function
# ============================
def predict_image(path: str) -> str:
    """
    Preprocess with MobileNetV2 -> 1280-d features -> PCA -> KNN
    """
    # Load image and resize
    img = Image.open(path).convert("RGB").resize(FEATURE_IMG_SIZE)

    # To numpy float32
    arr = np.array(img).astype(np.float32)

    # MobileNetV2 preprocessing (no manual /255 here)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)

    # Extract 1280-d features
    feats = feature_extractor.predict(arr, verbose=0)  # (1, 1280)

    # PCA expects 1280-d input (match training)
    arr_pca = pca.transform(feats)  # (1, n_components)

    # Predict
    pred = model.predict(arr_pca)[0]

    # Confidence (prefer predict_proba if available)
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(arr_pca)[0]
        confidence = round(float(np.max(proba)) * 100, 2)
    else:
        # fallback to distance-based confidence
        dist, _ = model.kneighbors(arr_pca, n_neighbors=1)
        confidence = round(float(np.exp(-dist.mean()) * 100.0), 2)

    label = LABELS[pred]
    return f"{label} ({confidence}% confidence)"

# ============================
# ✅ Flask App
# ============================
app = Flask(__name__)

@app.route("/whatsapp", methods=["POST"])
def whatsapp_webhook():
    log.info("📩 Incoming WhatsApp request")

    resp = MessagingResponse()
    msg = resp.message()

    media_url = request.values.get("MediaUrl0", None)
    num_media = int(request.values.get("NumMedia", 0))

    if num_media == 0:
        msg.body("📷 Please send an image of a plant leaf.")
        return str(resp)

    try:
        local_path = "incoming_image.jpg"
        download_media(media_url, local_path)
        result = predict_image(local_path)
        msg.body(f"🌿 *Prediction:* {result}")

    except Exception as e:
        log.error(f"❌ ERROR: {e}")
        msg.body("❌ Could not process the image. Try again with a clear leaf photo.")

    finally:
        # Optional cleanup
        try:
            if os.path.exists("incoming_image.jpg"):
                os.remove("incoming_image.jpg")
        except:
            pass

    return str(resp)


if __name__ == "__main__":
    log.info("🚀 WhatsApp model server running on http://127.0.0.1:8000/whatsapp")
    app.run(host="0.0.0.0", port=8000)