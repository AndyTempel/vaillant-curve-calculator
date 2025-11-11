'use client';

import { useMemo, useState, useCallback } from 'react';
import { Card } from 'components/card';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
    CategoryScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, CategoryScale);

// Vaillant heat curve constants
const A = 2.55;
const B = 0.78; // power

// Compute T_flow for given T_set, T_out and heatCurve label
function tFlow(Tset, Tout, heatCurve) {
    const delta = Tset - Tout; // how much colder outside than target
    const value = A * Math.pow(heatCurve * delta, B);
    return Tset + value;
}

// Generate series for all T_out from 25 down to -25, step 1 (x inverted on chart)
function buildSeries(Tset, heatCurve) {
    const points = [];
    for (let t = 25; t >= -25; t -= 1) {
        points.push({ x: t, y: tFlow(Tset, t, heatCurve) });
    }
    return points;
}

const fixedTableOuts = [20, 15, 10, 0, -10, -15, -20];

export default function Page() {
    const [tSet, setTSet] = useState(21);
    const [heatCurve, setHeatCurve] = useState(1.5);

    const curveBelow = useMemo(() => Math.max(0.1, +(heatCurve - 0.05).toFixed(2)), [heatCurve]);
    const curveAbove = useMemo(() => Math.min(4, +(heatCurve + 0.05).toFixed(2)), [heatCurve]);

    const seriesMain = useMemo(() => buildSeries(tSet, heatCurve), [tSet, heatCurve]);

    return (
        <div className="flex flex-col gap-10 sm:gap-14">
            <section className="flex flex-col gap-6">
                <h1 className="text-2xl sm:text-3xl font-semibold">Vaillant Heat Curve Calculator</h1>
                <p className="text-neutral-700 max-w-3xl">
                    Compute and visualize flow temperature based on Vaillant heat curve. Adjust the target room
                    temperature and heat curve label to see the full curve and key setpoints.
                </p>
                <Controls tSet={tSet} setTSet={setTSet} heatCurve={heatCurve} setHeatCurve={setHeatCurve} />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <div className="flex items-start justify-between gap-4">
                        <h3 className="text-neutral-900">Curve Graph</h3>
                        <small className="text-neutral-500">x: outside temp (25 → -25°C), y: flow temp (°C)</small>
                    </div>
                    <div className="mt-2">
                        <HeatCurveChart series={seriesMain} />
                    </div>
                </Card>

                <Card>
                    <h3 className="text-neutral-900">Setpoints Table</h3>
                    <p className="text-sm text-neutral-500 mb-3">Columns show curve −0.05, selected, and +0.05</p>
                    <SetpointTable tSet={tSet} hcCenter={heatCurve} hcLow={curveBelow} hcHigh={curveAbove} />
                </Card>
            </section>
        </div>
    );
}

function Controls({ tSet, setTSet, heatCurve, setHeatCurve }) {
    const onTSetChange = useCallback((e) => setTSet(+e.target.value), [setTSet]);
    const onHCChange = useCallback((e) => setHeatCurve(+e.target.value), [setHeatCurve]);

    return (
        <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-neutral-700">Target room temperature (T_set)</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={15}
                            max={25}
                            step={0.5}
                            value={tSet}
                            onChange={onTSetChange}
                            className="w-full"
                        />
                        <input
                            type="number"
                            min={5}
                            max={30}
                            step={0.1}
                            value={tSet}
                            onChange={onTSetChange}
                            className="w-24 input"
                        />
                        <span className="text-neutral-500">°C</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-neutral-700">Heat Curve label</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={0.1}
                            max={4}
                            step={0.05}
                            value={heatCurve}
                            onChange={onHCChange}
                            className="w-full"
                        />
                        <input
                            type="number"
                            min={0.1}
                            max={4}
                            step={0.05}
                            value={heatCurve}
                            onChange={onHCChange}
                            className="w-24 input"
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}

function HeatCurveChart({ series }) {
    const data = useMemo(() => ({
        datasets: [
            {
                label: 'T_flow',
                data: series.map((p) => ({ x: p.x, y: p.y })),
                borderColor: 'rgb(37,99,235)',
                backgroundColor: 'rgba(37,99,235,0.15)',
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 4,
                showLine: true,
                tension: 0,
                fill: true,
            },
        ],
    }), [series]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
            x: {
                type: 'linear',
                min: -25,
                max: 25,
                reverse: true, // 25 → -25 from left to right
                ticks: {
                    stepSize: 5,
                    callback: (v) => `${v}°C`,
                },
                title: { display: false },
            },
            y: {
                ticks: {
                    callback: (v) => `${v}°C`,
                },
                title: { display: false },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    title: (items) => {
                        if (!items?.length) return '';
                        const x = items[0].parsed.x;
                        return `T_out: ${x}°C`;
                    },
                    label: (item) => `T_flow: ${item.parsed.y.toFixed(2)}°C`,
                },
            },
        },
        elements: {
            point: { radius: 2 },
            line: { borderWidth: 2 },
        },
    }), []);

    return (
        <div className="w-full h-[320px] sm:h-[360px]">
            <Line data={data} options={options} />
        </div>
    );
}

function SetpointTable({ tSet, hcCenter, hcLow, hcHigh }) {
    const rows = fixedTableOuts.map((tout) => {
        const low = tFlow(tSet, tout, hcLow);
        const mid = tFlow(tSet, tout, hcCenter);
        const high = tFlow(tSet, tout, hcHigh);
        return { tout, low, mid, high };
    });

    const fmt = (v) => v.toFixed(1);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-neutral-600">
                        <th className="py-2 pr-3">T_out (°C)</th>
                        <th className="py-2 pr-3">HC {hcLow.toFixed(2)}</th>
                        <th className="py-2 pr-3">HC {hcCenter.toFixed(2)}</th>
                        <th className="py-2">HC {hcHigh.toFixed(2)}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.tout} className="border-t border-neutral-200">
                            <td className="py-2 pr-3 text-neutral-500">{r.tout}</td>
                            <td className="py-2 pr-3">{fmt(r.low)}</td>
                            <td className="py-2 pr-3 font-medium">{fmt(r.mid)}</td>
                            <td className="py-2">{fmt(r.high)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
