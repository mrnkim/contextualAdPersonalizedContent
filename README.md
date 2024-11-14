This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 👋 Introduction

Contextual Ad is a tool that allows you to analyze your source footage, generate a summary, and receive ad recommendations based on the content and emotional tone of the footage. It also suggests optimal ad placements, enabling you to preview how the footage and ads work together. Additionally, you can generate ad copies, headlines, and hashtags for each ad!

<div align="center">
    <img src="public/appScreenShot.png" alt="app screenshot" />
  </a>
</div>

## 📍 Process Map

<div align="center">
    <img src="public/processMap.png" alt="process map" />
  </a>
</div>

By starting the app, the first step is to upload new source footage that you'd like to analyze and receive ad recommendations for.

If you choose not to upload new footage, the app will automatically display the latest footage from the footage index.

The next step is to analyze the footage. The analysis will provide a summary that includes the main emotions, relevant hashtags, and a brief overview of the content.

Following the analysis, you can receive ad recommendations that are best suited for the footage. You have several options for recommendations: general, emotional, visual, conversational, or you can customize your own by providing a keyword to include in the ad recommendations.

Additionally, you can generate ad copies, headlines, and hashtags for each recommended ad.

The subsequent step is to select an ad from the recommendations list and choose a placement from the recommended placement list. The placement list will show a preview of the ad and the footage together.

## 🛠️ Built With

- Next.js
- React
- TypeScript
- React Player
- Tailwind CSS
- Tanstack Query

## 🧱 Components

<div align="center">
    <img src="public/componentDesign.png" alt="process map" />
  </a>
</div>

## 🚀 Prerequisites






## 🔑 Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

