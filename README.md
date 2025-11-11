# Vaillant Heat Curve Calculator

A simple, clean calculator and graph for the Vaillant heating curve.

## Formula

```
T_flow = T_set + 2.55 * (HeatCurve * (T_set - T_out))^0.78
```

- `T_flow` — flow temperature (°C)
- `T_set` — target room temperature (°C)
- `T_out` — outside temperature (°C)
- `HeatCurve` — Vaillant heat curve label (0.10 → 4.00)
- `a = 2.55`, `b = 0.78`

## Features

- Interactive controls:
  - `T_set` target room temperature
  - `HeatCurve` label (0.10 to 4.00 in 0.05 steps)
- Graph:
  - Uses Chart.js (via react-chartjs-2)
  - X axis: inverted outside temperature from 25 → -25°C (rendered left→right as 25 → -25)
  - Resolution: 1°C with visible points and hover tooltip showing precise values
- Table:
  - Setpoints for one curve below (−0.05), the selected curve, and one above (+0.05)
  - Rows for `T_out`: 20, 15, 10, 0, −10, −15, −20

## Getting Started

### Local development

1. Install dependencies:
   ```
   npm install
   ```
2. Start the dev server:
   ```
   npm run dev
   ```
3. Open http://localhost:3000

### Deploying to Netlify

This project works out-of-the-box on Netlify. A minimal `netlify.toml` is included.
- Build command: `npm run build`
- Publish directory: `.next`

You can deploy by connecting your repository in the Netlify UI.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Chart.js for charts

## Notes

- Inputs are clamped to the allowed bounds.
- The graph auto-scales the Y axis; the X axis is fixed from 25 to −25°C and is reversed on the chart to display 25 → −25.
- No starter/template pages or navigation remain — this repository focuses solely on the calculator.
