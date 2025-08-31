## Generative-GenZ-Hackout25
Team Generative GenZ - Hackout'25

# 🌱 BlueCarbon Citizen & IoT Monitoring Platform (Phase 2)

A full-stack project that empowers citizens to report mangrove & coastal ecosystem data while integrating real-time IoT sensors for environmental monitoring. The platform now includes an **AI-driven validation model**, an **enhanced Flask-powered IoT smart dashboard**, and **Leaflet-based geospatial visualization** for richer insights.

---

## 🚀 Features

### 1. Citizen Reporting Module

* 📸 **Photo Uploads**: Citizens upload mangrove photos with descriptions & geotagging.
* 🏆 **Leaderboard & Gamification**: Credits for verified uploads, progress tracking, and competition.
* ✅ **AI + Admin Verification**: New AI model assists in verifying citizen reports.
* 📊 **User Dashboard**: Contributions, trends, and recent reports with AI insights.

### 2. IoT Sensor Node Module

* **ESP32-based IoT Monitoring**: pH, salinity, turbidity, gas, and water level readings.
* **Flask API Smart Dashboard**: Replaced FastAPI with Flask for interoperability & real-time analytics.
* **Threshold Alerts**: System-generated alerts when environmental risks are detected.
* **Live Interactive Dashboard**: Improved visualization with IoT sensor graphs & alerts.

### 3. Interactive Mapping (New)

* 🗺️ **Leaflet Integration**: Interactive map showing geotagged citizen reports and IoT nodes.
* 🔍 **Data Overlay**: View hotspots of citizen activity vs IoT sensor readings.
* 📡 **Geo-Insights**: Enables better correlation between human reports and real-time sensor data.

---

## 🖥️ Screenshots

### Citizen Reporting + AI Insights

![Citizen + AI Dashboard](https://github.com/JatinKevlani/Generative-GenZ-Hackout25/blob/3a34f101e6552bd6356120274d8caaa7c4608689/assets/images/img4.jpg)

### IoT Smart Dashboard + Maps

![IoT + Map Dashboard](https://github.com/JatinKevlani/Generative-GenZ-Hackout25/blob/3a34f101e6552bd6356120274d8caaa7c4608689/assets/images/img3.jpg)

---

## ⚙️ Tech Stack

* **Frontend:** Next.js, TailwindCSS, shadcn/ui, Leaflet.js
* **Backend:** Node.js/Express (Citizen Reports), Flask API (IoT Smart Dashboard)
* **Database:** MongoDB / PostgreSQL
* **AI Model:** Image/Report verification model (custom fine-tuned)
* **IoT Hardware:** ESP32, Water Level, Gas, pH, Salinity, Turbidity sensors
* **APIs:** REST APIs for uploads, AI validation, IoT data ingestion

---

## 📊 Data Flow

1. **Citizen Reports →** AI + Admin Verification → Stored in DB → Leaderboard + Map.
2. **IoT Sensor Data →** ESP32 → Flask API → Smart Dashboard + Map overlay.
3. **Correlation →** AI insights + Sensor validation + Citizen reports = **trusted eco-data**.

---

## 📚 Resources

* Storyboards & sample uploads (`/docs`).
* Placeholder simulated IoT + AI outputs for demo.
* Updated PPT with **AI + Flask + Map integration**.

---

## 🌍 Why Phase 2 Matters

* **AI Validation** → improves credibility of citizen-science.
* **Flask Smart Dashboard** → modular, easy to extend, better real-time IoT support.
* **Leaflet Mapping** → adds geospatial context, making the platform more engaging.

---

## 👥 Team

* **Frontend:** Citizen UI, IoT Smart Dashboard, Maps
* **Backend:** Flask IoT API, AI Model Integration
* **Hardware:** ESP32 Firmware + Sensors
* **Design & Docs:** Storyboards, Presentation, Data Flow

---

## 📌 Next Steps

* Expand AI to classify mangrove health & species.
* Add predictive analytics (sensor + citizen data trends).
* Scale IoT coverage with mesh networks.
* Mobile-first PWA for on-the-go citizen uploads.

---

⚡ Would you like me to also make a **visual architecture diagram** (citizen app + AI + IoT + maps) so it looks polished for the README?



# 🌱 BlueCarbon Citizen & IoT Monitoring Platform

A full-stack project that empowers citizens to report mangrove & coastal ecosystem data while integrating real-time IoT sensors for environmental monitoring. The platform combines **crowdsourced citizen science** with **IoT-based validation**, driving data-backed conservation insights.

---
## 🚀 Features

### 1. Citizen Reporting Module

* 📸 **Photo Uploads**: Citizens can upload mangrove photos with descriptions & geotagging.
* 🏆 **Leaderboard & Gamification**: Earn credits for verified uploads, track progress, and compete on a leaderboard.
* ✅ **Verification Workflow**: Admin/AI-based verification for uploaded reports.
* 📊 **User Dashboard**: View total uploads, monthly contributions, and recent reports.

### 2. IoT Sensor Node Module

* **ESP32-based IoT Monitoring**: Collects pH, salinity, turbidity, gas, and water level data.
* **FastAPI Backend**: Handles sensor data ingestion & real-time monitoring.
* **Live Dashboard**: Displays water levels, gas detection, valve control, and active alerts.
* **Alerts & Thresholds**: Notifies users when critical thresholds (e.g., low water level) are breached.

---

## 🖥️ Screenshots

### Citizen Reporting Dashboard

![Citizen Dashboard](https://github.com/JatinKevlani/Generative-GenZ-Hackout25/blob/29751bdc4c522f802f813e8644770c4a2792ea7e/bluecarbon-citizen-app/public/image.png)

### IoT Monitoring Dashboard

![IoT Dashboard](https://github.com/JatinKevlani/Generative-GenZ-Hackout25/blob/main/assets/images/img1.png)

### IoT Hardware
![IoT Hardware](https://github.com/JatinKevlani/Generative-GenZ-Hackout25/blob/main/assets/images/img2.jpeg)

---

## ⚙️ Tech Stack

* **Frontend:** Next.js, TailwindCSS, shadcn/ui
* **Backend:** FastAPI (IoT), Node.js/Express (Citizen Reporting)
* **Database:** MongoDB / PostgreSQL
* **IoT Hardware:** ESP32, Water Level Sensor, Gas Sensor (MQ-x), pH/Salinity/Turbidity sensors
* **APIs:** REST APIs for uploads, sensor data, and validation

---

## 📊 Data Flow

1. **Citizen Reports →** Stored in DB → Verified by AI/Admin → Displayed in Leaderboard.
2. **IoT Sensor Data →** Sent via ESP32 → FastAPI → IoT Dashboard (real-time).
3. **Correlation →** Verified citizen uploads + sensor readings improve ecosystem monitoring.

---

## 📚 Resources

* Sample citizen uploads & storyboards (in `/docs`).
* Fallback simulated IoT data for demo purposes.
* PPT slides linking both modules for hackathon presentation.

---

## 🌍 Correlation Between Modules

* **Citizen Reporting** provides **community-driven data** on mangroves & coasts.
* **IoT Sensor Nodes** validate these reports with **real-time water health data**.
* Together, they create a **trusted and gamified eco-monitoring platform**.

---

## 👥 Team

* **Frontend:** Citizen UI + IoT Dashboard
* **Backend:** Report APIs + FastAPI IoT Service
* **Hardware:** ESP32 Firmware Development
* **Design & Docs:** Storyboards, PPT, Presentation

---

## 📌 Next Steps

* AI-based validation of citizen uploads.
* Expansion of IoT sensor coverage (pH, salinity, turbidity).
* Mobile-first design for citizen participation.
* Integration with government/NGO conservation databases.
