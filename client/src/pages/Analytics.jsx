import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = [
  "#77d1f2", "#4689b6", "#483dbeff", "#f7ba2a", "#e97366ff",
  "#70c574ff", "#ba68c8", "#ff7043", "#26c6da", "#d4e157",
  "#3adcf2", "#3b7fa9ff", "#5471b6ff"
];

function capitalizeWords(str) {
  return str ? str.replace(/\b\w/g, (l) => l.toUpperCase()) : '';
}

const StatCard = ({ value, label }) => (
  <div className="analytics-stat-card" style={{ cursor: "default" }}>
    <span className="analytics-stat-value">{value}</span>
    <span className="analytics-stat-label">{label}</span>
  </div>
);

const Analytics = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [stats, setStats] = useState({ totalExperts: 0, domainsCovered: 0, averageRating: 0 });
  const [domainChartData, setDomainChartData] = useState({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
  const [kpiChartData, setKpiChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiChartType, setKpiChartType] = useState('horizontal'); // New state for toggling KPI chart type

  const [allDomains, setAllDomains] = useState([]);
  const [selectedLegendDomain, setSelectedLegendDomain] = useState(null);
  

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/experts`)
      .then(res => { if (!res.ok) throw new Error("Failed to fetch experts"); return res.json(); })
      .then(data => {
        const domainCounts = {};
        let totalRating = 0, ratedCount = 0;
        data.forEach(expert => {
          const domain = expert.domain ? capitalizeWords(expert.domain) : "Other";
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
          if (typeof expert.rating === "number") {
            totalRating += expert.rating;
            ratedCount += 1;
          }
        });

        const domainList = Object.keys(domainCounts);
        setAllDomains(domainList);

        let filtered = domainList;
        if (selectedLegendDomain) filtered = [selectedLegendDomain];

        const showLabels = domainList.filter(d => filtered.includes(d) || !selectedLegendDomain);
        const showCounts = showLabels.map(l => domainCounts[l]);
        const showColors = showLabels.map((d, i) => COLORS[domainList.indexOf(d) % COLORS.length]);

        const currentStats = {
          totalExperts: showCounts.reduce((a, b) => a + b, 0),
          domainsCovered: showLabels.length,
          averageRating: ratedCount ? (totalRating / ratedCount).toFixed(2) : "4.8",
        };
        setStats(currentStats);

        setDomainChartData({
          labels: showLabels,
          datasets: [{
            data: showCounts,
            backgroundColor: showColors,
            borderColor: "#fff",
            borderWidth: 2,
          }],
        });

        // KPI Chart Data
        setKpiChartData({
          labels: ['Total Experts', 'Domains Covered', 'Average Rating'],
          datasets: [{
            label: 'Platform Metrics',
            data: [currentStats.totalExperts, currentStats.domainsCovered, parseFloat(currentStats.averageRating)],
            backgroundColor: ['#77d1f2', '#f7ba2a', '#e97366ff'],
            borderColor: '#fff',
            borderWidth: 1,
          }]
        });

        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [API_URL, selectedLegendDomain]);

  const handleLegendClick = (domain) => {
    setSelectedLegendDomain(domain === selectedLegendDomain ? null : domain);
  };

  const clearFilters = () => {
    setSelectedLegendDomain(null);
  };

  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Platform Analytics</h1>
      <div className="analytics-stats-row">
        <StatCard value={stats.totalExperts} label="Total Experts" />
        <StatCard value={stats.domainsCovered} label="Domains Covered" />
        <StatCard value={stats.averageRating} label="Average Rating" />
      </div>

      <div className="analytics-row-split" style={{ display: "flex", flexWrap: "wrap", gap: "120px", justifyContent: "left-top", alignItems: "flex-start"  }}>
        {/* Domain Chart */}
        <div className="analytics-chart-col" style={{ minWidth: 400, maxWidth: 450  } }>
          <h2 style={{ textAlign: "center", color: "black", fontWeight: "bold" }}>Experts by Domain</h2>

          {domainChartData.labels.length === 0 ? (
            <p>No domain data to display.</p>
          ) : (
            <Pie
              data={domainChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: "easeInOutQuad" },
                plugins: { legend: { display: false }, tooltip: { enabled: true } }
              }}
            />
          )}
        </div>

        {/* Legend area with all domains */}
        <div className="analytics-legend-col" style={{ minWidth: 220, background: "#f3f8ff", borderRadius: "20px", padding: "16px", boxShadow: "0 2px 12px rgba(119,209,242,0.08)" }}>
          <h3 style={{ color: "#268fff", fontWeight: 700, fontSize: "1.08rem", marginBottom: "14px" }}>
            Legend (Click to Filter)
          </h3>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {allDomains.map((domain, i) => {
              const isSelected = domain === selectedLegendDomain;
              return (
                <li
                  key={domain}
                  style={{
                    cursor: "pointer",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: isSelected ? "700" : "normal",
                    color: isSelected ? "#1a71d1" : "#246",
                    background: isSelected ? "#d6f2ff" : "none",
                    borderRadius: "6px",
                    padding: "2px 0 2px 5px",
                  }}
                  onClick={() => handleLegendClick(domain)}
                >
                  <span style={{
                    display: "inline-block",
                    width: 20,
                    height: 20,
                    borderRadius: "4px",
                    marginRight: "9px",
                    background: COLORS[i % COLORS.length]
                  }} />
                  {domain}
                </li>
              );
            })}
          </ul>
          {selectedLegendDomain && (
            <button onClick={clearFilters}
              style={{
                marginTop: "14px",
                color: "#268fff",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "1rem"
              }}>
              Clear Filter
            </button>
          )}
        </div>

        {/* KPI Bar Chart */}
        <div className="analytics-chart-col" style={{ minWidth: 400, maxWidth: 450 }}>
          <h2 style={{ textAlign: "center", color: 'black' }}>Overall Platform Metrics</h2>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <button
              onClick={() => setKpiChartType('vertical')}
              style={{
                marginRight: "8px",
                padding: "8px 12px",
                borderRadius: "16px",
                border: "1px solid #ccc",
                backgroundColor: kpiChartType === 'vertical' ? '#e6f2ff' : 'white',
                cursor: 'pointer',
                color: 'black'
              }}
            >
              Vertical Bar
            </button>
            <button
              onClick={() => setKpiChartType('horizontal')}
              style={{
                padding: "8px 12px",
                borderRadius: "16px",
                border: "1px solid #ccc",
                backgroundColor: kpiChartType === 'horizontal' ? '#e6f2ff' : 'white',
                cursor: 'pointer',
                color: 'black'
              }}
            >
              Horizontal Bar
            </button>
          </div>
          <Bar
            data={kpiChartData}
            options={{
              indexAxis: kpiChartType === 'horizontal' ? 'y' : 'x', // This switches the axis
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  grid: { display: kpiChartType === 'vertical' }
                },
                y: {
                  beginAtZero: true,
                  grid: { display: kpiChartType === 'horizontal' }
                }
              }
            }}
          />
        </div>
      </div>
      <div className="analytics-placeholder" style={{ marginTop: "40px", textAlign: "center", marginBottom:"30px" }}>
        <span>More charts and visualizations coming soon…</span>
      </div>
    </div>
  );
};

export default Analytics;