## Generative-GenZ-Hackout25
Team Generative GenZ - Hackout'25

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
