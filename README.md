# 🚀 CATALOX – Smart Supply Chains

> **Resilient Logistics and Dynamic Supply Chain Optimization**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://your-username.github.io/catalox)
[![Hackathon](https://img.shields.io/badge/GDG-Solution%20Challenge%202026-purple?style=for-the-badge)](#)

---

## 📌 About

CATALOX is an AI-powered smart logistics platform that **preemptively detects and flags supply chain disruptions**, then **dynamically recommends optimized route adjustments** before localized bottlenecks cascade into broader delays.

Built for the **GDG Solution Challenge** — *"Design a scalable system capable of continuously analyzing multifaceted transit data to preemptively detect and flag potential supply chain disruptions."*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔔 **Live Disruption Alerts** | Real-time scrolling ticker + notification panel with auto-refresh |
| 🔮 **Predictive Risk Engine** | 24-hour AI disruption forecast before you ship |
| 🌤️ **Auto Weather Detection** | City select → weather auto-fetched via Open-Meteo API |
| 🗺️ **Real-Time Route Optimization** | Powered by OpenRouteService API |
| 🌊 **Smart Global Shipping Lanes** | 20+ international ocean waypoint routes |
| ✈️ **Great Circle Air Routes** | Accurate flight path visualization |
| 🚛 **Multi-Modal Transport** | Road, Rail, Air, Water — smart disable for islands |
| 📜 **Delivery History Table** | Auto-saves every route calculation |
| 📊 **Analytics Charts** | Weekly delivery trends + mode distribution |
| 💰 **Cost Estimator** | Real-time freight cost calculator |
| 🌦️ **Weather Impact Matrix** | Delay factors per mode × weather condition |
| ❓ **FAQ Section** | Enterprise-grade documentation |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 / JavaScript | Core frontend — no frameworks |
| [Leaflet.js](https://leafletjs.com/) | Interactive maps |
| [Chart.js](https://www.chartjs.org/) | Dashboard analytics charts |
| [OpenRouteService API](https://openrouteservice.org/) | Real routing, geocoding & autocomplete |
| [Open-Meteo API](https://open-meteo.com/) | Free real-time weather data |
| [OpenStreetMap](https://openstreetmap.org/) | Map tiles |

---

## 📁 Project Structure

```
catalox/
├── index.html    ← HTML structure
├── style.css     ← All styles & animations
├── script.js     ← All JavaScript logic
└── README.md     ← This file
```

---

## 🚀 Deploy on GitHub Pages

1. **Fork / upload** this repo to GitHub
2. Go to **Settings → Pages**
3. Source: `main` branch → `/ (root)` → **Save**
4. Live at: `https://your-username.github.io/catalox`

> No build tools, no npm, no frameworks — just open `index.html`! ✅

---

## 🌍 Smart Transport Logic

| Route | 🚛 Road | 🚂 Rail | 🚢 Ship | ✈️ Air |
|---|:---:|:---:|:---:|:---:|
| City ↔ City (mainland) | ✅ | ✅ | ❌ | ✅ |
| Coastal ↔ Coastal | ✅ | ✅ | ✅ | ✅ |
| Island ↔ Mainland | ❌ | ❌ | ✅ | ✅ |
| Island ↔ Inland city | ❌ | ❌ | ❌ | ✅ |

---

## 👥 Team

Built with ❤️ for **GDG Solution Challenge 2026**

---

## 📄 License

MIT License — Free to use and modify.
