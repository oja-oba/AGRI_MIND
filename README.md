# AgriMind Tomato Disease Detector — README.md

## ✅ 1. Problem Statement

Tomato farmers suffer enormous losses every year due to preventable plant diseases such as **Early Blight**, **Late Blight**, **Leaf Mold**, **Bacterial Spot**, and **Tomato Mosaic Virus**.  

According to FAO, **up to 40% of global crops are lost annually** due to pests and plant diseases.  
In regions like Africa, the numbers are even worse due to:

- Limited access to agricultural experts  
- Slow or unavailable diagnosis  
- Expensive or complex mobile apps  
- Lack of internet access in rural farming communities  

**AgriMind AI** solves this by allowing farmers to simply **send a leaf photo via WhatsApp** and instantly receive a disease diagnosis.

---

## ✅ 2. Solution Overview (What We Built)

AgriMind uses a hybrid machine learning architecture:

### ✅ 2.1 Model Architecture

| Component | Purpose |
|----------|---------|
| **MobileNetV2** | Extracts 1280‑dimensional deep features |
| **PCA (Principal Component Analysis)** | Compresses features for faster inference |
| **KNN Classifier** | Lightweight classifier ideal for small datasets |

### ✅ 2.2 WhatsApp-Based Workflow

```
Farmer → WhatsApp → Twilio Sandbox → Flask API → Feature Extraction → PCA → KNN → Prediction → WhatsApp → Farmer
```

### ✅ 2.3 Why WhatsApp?
- Every Nigerian farmer already uses WhatsApp  
- No UI training required  
- Works even on 2G networks  
- No app installation  

---

## ✅ 3. Scope of Project (Tomato Only)

This version of AgriMind focuses **exclusively on tomato diseases**, including:

- Early Blight  
- Late Blight  
- Leaf Mold  
- Septoria Leaf Spot  
- Bacterial Spot  
- Healthy Leaves  

---

## ✅ 4. Monetization Strategy

We propose multiple revenue streams:

### ✅ 4.1 Pay‑Per‑Diagnosis  
₦50–₦100 per prediction.

### ✅ 4.2 Monthly Subscription  
₦1000/month unlimited scans.

### ✅ 4.3 Agro‑chemical Partnerships  
Recommend approved pesticides → earn commission.

### ✅ 4.4 Enterprise API  
Agriculture agencies can subscribe to the engine for mass farm monitoring.

---

## ✅ 5. How to Run Locally

### ✅ 5.1 Setup Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### ✅ 5.2 Add Environment Variables  
Create `.env`:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxx
```

### ✅ 5.3 Start API Server  
```bash
python whatsapp_api.py
```

Server runs at:
```
http://127.0.0.1:8000/whatsapp
```

### ✅ 5.4 Expose API (for WhatsApp)
Install ngrok:
```bash
brew install ngrok
ngrok http 8000
```

Use the generated URL as Twilio webhook.

---

## ✅ 6. Deploying on Render

### ✅ 6.1 Requirements
Your repo must include:

- whatsapp_api.py  
- tomato_knn_pca.joblib  
- tomato_pca.joblib  
- labels.txt  
- requirements.txt  
- README.md  
- Possible `.python-version` (example: `3.10`)

### ✅ 6.2 Render Build Command
```
pip install -r requirements.txt
```

### ✅ 6.3 Render Start Command
```
gunicorn -k gthread -w 2 -t 200 whatsapp_api:app
```

### ✅ 6.4 Add Environment Variables
In Render Dashboard → Environment:

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### ✅ 6.5 Connect to WhatsApp Sandbox
Twilio → Messaging → Sandbox → Paste webhook:

```
https://<your_render_url>/whatsapp
```

---

## ✅ 7. How To Test For Hackathon.

### 📝 Notes

This project is currently deployed on **Render (Free Tier)** and **Twilio free tier**.  
Free-tier services automatically **sleep after inactivity**, which means the WhatsApp bot cannot respond until the server wakes up.

---

### ✅ How to Wake the Server

Before sending an image on WhatsApp, open this URL in your browser:
```
https://agri-mind.onrender.com/whatsapp
```

Opening this endpoint wakes the backend and loads the ML model.

---

### ✅ How to Test the WhatsApp Bot

1. **Wake the server** (see link above).  
2. Open WhatsApp and add **+1 (415) 523-8886** as a contact
3. Open the contact to chat and send(This add you to the sandbox):
```
    join fall-laid
```
4. Send a Tomato leaf image to the chat(Choose a random Tomato leaf picture from the data folder) 
5. Receive the prediction in the chat.
6. The validity of the model is tested when the prediction match the folder(label) where the leave was chosen.

---

### ✅ Important Notes

- Render Free Tier sleeps after ~15 minutes of inactivity.  
- Any new tester must **wake the server URL first**.  


---

## ✅ 8. File Structure

```
/AgriMind
  ├── whatsapp_api.py.          #Backend 
  ├── tomato_knn_pca.joblib.    #KNN model 
  ├── Procfile                  #To run render
  ├── disease.json.             #Json file the disease and treatment
  ├── tomato_pca.joblib.        #PCA model
  ├── labels.txt                #labels for the disease
  ├── data                      #folder for the leaves picture
  ├── requirements.txt          #python requirements to run the app
  ├── README.md                 #This file
  └── .python-version           #python version to run the app
```

---

## ✅ 9. Future Enhancements
- Support for multiple crops  
- Dashboard for cooperatives  
- Voice assistant support  
- Integration with fertilizer shops  
- Farmer disease trend prediction  

---

## ✅ 10. References
1. FAO 2022 Report: Global crop losses — https://www.fao.org  
2. PlantVillage Dataset — https://plantvillage.psu.edu  
3. MobileNetV2 Architecture — https://arxiv.org/abs/1801.04381  

---

