## 👋 Introduction

**Contextual Ad** is a tool for analyzing source footage, summarizing content, and recommending ads based on the footage’s context and emotional tone. It also supports embedding-based searches and suggests optimal ad placements, letting you preview how the footage and ads fit together. Additionally, it generates ad copies, headlines, and hashtags for each ad!

https://www.loom.com/share/007d81ff04c2430ab265d5a28b99c0ef?sid=9202c205-16fd-4bf0-9444-bd286014e7d4

With **Personalized Content**, you get tailored video recommendations based on user profiles and preferences, plus embedding-based searches for more accurate results.

https://www.loom.com/share/f2a5d19b507d4a3fb69a2f002a98510a?sid=0ca85931-a6cb-4057-9f01-d6f85cacdbe6

## 🧱 Components
![alt text](image-5.png)
## ➡️ Process Maps
![alt text](image-3.png)
![alt text](image-4.png)
## 🚀 Prerequisites

### 1. Twelve Labs API Key

If you don't have one, visit [Twelve Labs Playground](https://playground.twelvelabs.io/) to generate your API Key.

### 2.Index Ids for source footage and ads

Make sure you have two indexes for source footage and ads. If not,

- You can create the new indexes in [Twelve Labs Playground](https://playground.twelvelabs.io/)
- Or check [here](https://docs.twelvelabs.io/docs/create-indexes) on how to create an index and get the index id

## 🔑 Getting Started

### 1. Clone the current repo

```sh
git clone git@github.com:mrnkim/contextualAdPersonalizedContent.git
```

### 2. Create `.env` file in the root directory and provide the values for each key

```
TWELVELABS_API_BASE_URL=https://api.twelvelabs.io/v1.3
TWELVELABS_API_KEY=<YOUR API KEY>
NEXT_PUBLIC_FOOTAGE_INDEX_ID=<YOUR FOOTAGE INDEX ID>
NEXT_PUBLIC_ADS_INDEX_ID=<YOUR ADS INDEX ID>
```

### 3. Run the development server

```bash
npm install
npm run dev
```

### 4. Open [http://localhost:3000](http://localhost:3000) with your browser
