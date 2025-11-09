import os
import requests
import numpy as np
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from PIL import Image
import joblib
import logging
import json

# ============================
# ✅ TensorFlow feature extractor imports
# ============================
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
# ✅ Logging Setup
# ============================
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("whatsapp")

# ============================
# ✅ Load Model + PCA + Labels
# ============================
BASE_DIR = os.getcwd()
MODEL_PATH = os.path.join(BASE_DIR, "tomato_knn_pca.joblib")
PCA_PATH = os.path.join(BASE_DIR, "tomato_pca.joblib")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")
TREATMENTS_PATH = os.path.join(BASE_DIR, "disease.json")

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
FEATURE_IMG_SIZE = (224, 224)
log.info("Loading MobileNetV2 feature extractor (imagenet, pooling=avg)...")
feature_extractor = MobileNetV2(
    input_shape=FEATURE_IMG_SIZE + (3,),
    include_top=False,
    weights="imagenet",
    pooling="avg"
)
log.info("✅ Feature extractor ready (output: 1280 dims).")

# ============================
# ✅ Twilio Image Downloader (Fix for 401)
# ============================
def download_media(media_url: str, out_path: str) -> str:
    """Download Twilio media using AUTH (fixes 401 Forbidden error)."""
    TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")

    if not TWILIO_SID or not TWILIO_AUTH:
        raise ValueError("❌ Twilio credentials missing. Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN")

    log.info(f"🟦 Downloading media: {media_url}")
    resp = requests.get(
        media_url,
        auth=(TWILIO_SID, TWILIO_AUTH),
        timeout=20,
        headers={"User-Agent": "Mozilla/5.0"}
    )

    if resp.status_code != 200:
        raise ValueError(f"Failed to download media: HTTP {resp.status_code}")

    if "image" not in resp.headers.get("Content-Type", ""):
        raise ValueError("❌ File is not an image.")

    with open(out_path, "wb") as f:
        f.write(resp.content)

    return out_path

# ============================
# ✅ Prediction + Treatment Lookup
# ============================
def predict_image(path: str) -> str:
    """
    Preprocess with MobileNetV2 -> PCA -> KNN
    Then match predicted disease to treatment in disease.json
    """
    img = Image.open(path).convert("RGB").resize(FEATURE_IMG_SIZE)
    arr = np.array(img).astype(np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)

    feats = feature_extractor.predict(arr, verbose=0)
    arr_pca = pca.transform(feats)
    pred = model.predict(arr_pca)[0]

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(arr_pca)[0]
        confidence = round(float(np.max(proba)) * 100, 2)
    else:
        dist, _ = model.kneighbors(arr_pca, n_neighbors=1)
        confidence = round(float(np.exp(-dist.mean()) * 100.0), 2)

    label = LABELS[pred]

    # 🌿 Load treatment data
    treatment_text = "No treatment information found."

    try:
        if os.path.exists(TREATMENTS_PATH):
            with open(TREATMENTS_PATH, "r") as f:
                data = json.load(f)

            for item in data.get("tomato_diseases", []):
                if item["disease"].lower() == label.lower():
                    sol = item["solution"]
                    homemade = sol.get("homemade", "N/A")
                    chemical = sol.get("chemical", "N/A")
                    treatment_text = (
                        f"🧴 *Homemade:* {homemade}\n\n"
                        f"🧪 *Chemical:* {chemical}"
                    )
                    break
        else:
            treatment_text = "⚠️ Treatment file (disease.json) not found."

    except Exception as e:
        treatment_text = f"⚠️ Error loading treatment data: {e}"

    return f"🌿 *Prediction:* {label} ({confidence}% confidence)\n\n{treatment_text}"

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
        msg.body("📷 Please send a clear image of a tomato leaf.")
        return str(resp)

    try:
        local_path = "incoming_image.jpg"
        download_media(media_url, local_path)
        result = predict_image(local_path)
        msg.body(result)

    except Exception as e:
        log.error(f"❌ ERROR: {e}")
        msg.body(f"❌ Could not process the image. Error: {e}")

    finally:
        try:
            if os.path.exists("incoming_image.jpg"):
                os.remove("incoming_image.jpg")
        except:
            pass

    return str(resp)

if __name__ == "__main__":
    log.info("🚀 WhatsApp model server running on http://127.0.0.1:8000/whatsapp")
    app.run(host="0.0.0.0", port=8000)
