import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrendDashboard = () => {
  // Extrahovaná data z obrázků
  const mesicniData = [
    {
      mesic: '2025-04',
      celkemHodin: 266.50,
      fte: 1.67,
      interniHodin: 77.67,
      opsHodin: 122.58,
      rndHodin: 38.75,
      guidingHodin: 27.50,
      opsHiring: 72.08,
      opsJobs: 32.75,
      opsReviews: 17.75
    },
    {
      mesic: '2025-05',
      celkemHodin: 239.58,
      fte: 1.49,
      interniHodin: 131.33,
      opsHodin: 60.50,
      rndHodin: 24.75,
      guidingHodin: 23.00,
      opsHiring: 24.5,
      opsJobs: 28.0,
      opsReviews: 8.0
    },
    {
      mesic: '2025-06',
      celkemHodin: 352.75,
      fte: 2.09,
      interniHodin: 188.50,
      opsHodin: 89.75,
      rndHodin: 48.75,
      guidingHodin: 25.75,
      opsHiring: 19.75,
      opsJobs: 54.75,
      opsReviews: 15.25
    },
    {
      mesic: '2025-07',
      celkemHodin: 381.00,
      fte: 2.08,
      interniHodin: 174.33,
      opsHodin: 159.17,
      rndHodin: 20.50,
      guidingHodin: 27.00,
      opsHiring: 12.75,
      opsJobs: 127.42,
      opsReviews: 19.00
    },
    {
      mesic: '2025-08',
      celkemHodin: 371.27,
      fte: 2.21,
      interniHodin: 194.27,
      opsHodin: 131.50,
      rndHodin: 19.75,
      guidingHodin: 15.50,
      uxMaturity: 10.25,
      opsHiring: 23.5,
      opsJobs: 95.0,
      opsReviews: 13.0
    },
    {
      mesic: '2025-09',
      celkemHodin: 539.25,
      fte: 3.06,
      interniHodin: 100.25,
      opsHodin: 237.00,
      prHodin: 32.50,
      rndHodin: 118.00,
      guidingHodin: 49.00,
      uxMaturity: 2.50,
      opsHiring: 71.50,
      opsJobs: 125.75,
      opsReviews: 39.75
    },
    {
      mesic: '2025-10',
      celkemHodin: 426.00,
      fte: 2.42,
      interniHodin: 108.00,
      opsHodin: 198.75,
      prHodin: 40.50,
      rndHodin: 48.75,
      guidingHodin: 29.00,
      uxMaturity: 1.00,
      opsHiring: 38.25,
      opsJobs: 145.75,
      opsReviews: 14.75
    },
    {
      mesic: '2025-11',
      celkemHodin: 395.08,
      fte: 2.60,
      interniHodin: 112.08,
      opsHodin: 158.25,
      prHodin: 33.42,
      rndHodin: 53.75,
      guidingHodin: 37.58,
      uxMaturity: 0,
      opsHiring: 21.00,
      opsJobs: 119.08,
      opsReviews: 14.67
    }
  ];

  const projektyPodil = mesicniData.map(d => ({
    mesic: d.mesic,
    'Interní': (d.interniHodin / d.celkemHodin * 100).toFixed(1),
    'OPS': (d.opsHodin / d.celkemHodin * 100).toFixed(1),
    'R&D': (d.rndHodin / d.celkemHodin * 100).toFixed(1),
    'Guiding': (d.guidingHodin / d.celkemHodin * 100).toFixed(1),
    'PR': d.prHodin ? (d.prHodin / d.celkemHodin * 100).toFixed(1) : 0,
    'UX Maturity': d.uxMaturity ? (d.uxMaturity / d.celkemHodin * 100).toFixed(1) : 0
  }));

  const fteVyvoj = [
    { mesic: '2025-04', 'Martin': 0.03, 'Tobiáš': 0.03, 'Petra': 0.41, 'Jiří': 0.51, 'Milan': 0.69 },
    { mesic: '2025-05', 'Jaroslav': 0.00, 'Martin': 0.02, 'Tobiáš': 0.02, 'Tomáš': 0.17, 'Jiří': 0.46, 'Milan': 0.83 },
    { mesic: '2025-06', 'Tobiáš': 0.02, 'Jaroslav': 0.04, 'Petra': 0.06, 'Jiří': 0.54, 'Milan': 0.61, 'Tomáš': 0.84 },
    { mesic: '2025-07', 'Tobiáš': 0.00, 'Jaroslav': 0.03, 'Jiří': 0.35, 'Petra': 0.36, 'Milan': 0.61, 'Tomáš': 0.72 },
    { mesic: '2025-08', 'Jaroslav': 0.01, 'Tobiáš': 0.01, 'Petra': 0.32, 'Jiří': 0.33, 'Milan': 0.68, 'Tomáš': 0.86 },
    { mesic: '2025-09', 'Martin': 0.02, 'Tobiáš': 0.03, 'Jaroslav': 0.05, 'Petra': 0.48, 'Jiří': 0.58, 'Milan': 0.90, 'Tomáš': 1.00 },
    { mesic: '2025-10', 'Tobiáš': 0.01, 'Jaroslav': 0.02, 'Jiří': 0.44, 'Petra': 0.45, 'Milan': 0.64, 'Tomáš': 0.86 },
    { mesic: '2025-11', 'Tobiáš': 0.02, 'Jaroslav': 0.04, 'Petra': 0.44, 'Jiří': 0.46, 'Milan': 0.74, 'Tomáš': 0.89 }
  ];

  const [activeTab, setActiveTab] = useState('overview');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8f9fa' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px' }}>
            📊 Design leadership tým
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Trendy vytížení za období: Duben - Listopad 2025
          </p>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '0'
        }}>
          {[
            { id: 'overview', label: '📈 Přehled' },
            { id: 'projects', label: '📁 Projekty' },
            { id: 'ops', label: '⚙️ OPS Aktivity' },
            { id: 'team', label: '👥 Tým' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#2563eb' : '#666',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === tab.id ? '3px solid #2563eb' : 'none',
                fontSize: '15px',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              marginBottom: '10px'
            }}>
              {[
                { 
                  label: 'Průměrné hodiny/měsíc', 
                  value: (mesicniData.reduce((sum, d) => sum + d.celkemHodin, 0) / mesicniData.length).toFixed(0),
                  trend: '+102%',
                  color: '#10b981'
                },
                { 
                  label: 'Průměrné FTE', 
                  value: (mesicniData.reduce((sum, d) => sum + d.fte, 0) / mesicniData.length).toFixed(2),
                  trend: '+83%',
                  color: '#3b82f6'
                },
                { 
                  label: 'Max. kapacita', 
                  value: Math.max(...mesicniData.map(d => d.fte)).toFixed(2) + ' FTE',
                  trend: 'Září 2025',
                  color: '#8b5cf6'
                },
                { 
                  label: 'Celkem hodin', 
                  value: mesicniData.reduce((sum, d) => sum + d.celkemHodin, 0).toFixed(0),
                  trend: '6 měsíců',
                  color: '#f59e0b'
                }
              ].map((metric, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{metric.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' }}>
                    {metric.value}
                  </div>
                  <div style={{ fontSize: '13px', color: metric.color, fontWeight: '500' }}>
                    {metric.trend}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Charts */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Vývoj celkových hodin a FTE kapacity
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mesicniData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis yAxisId="left" stroke="#666" label={{ value: 'Hodiny', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#666" label={{ value: 'FTE', angle: 90, position: 'insideRight' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="celkemHodin" stroke="#3b82f6" strokeWidth={3} name="Celkem hodin" dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="fte" stroke="#10b981" strokeWidth={3} name="FTE" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Rozložení hodin podle projektů v čase
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={mesicniData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="interniHodin" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Interní" />
                  <Area type="monotone" dataKey="opsHodin" stackId="1" stroke="#10b981" fill="#10b981" name="OPS" />
                  <Area type="monotone" dataKey="rndHodin" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="R&D" />
                  <Area type="monotone" dataKey="guidingHodin" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Guiding" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Procentuální podíl projektů
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={projektyPodil}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" label={{ value: 'Podíl (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Interní" fill="#3b82f6" />
                  <Bar dataKey="OPS" fill="#10b981" />
                  <Bar dataKey="R&D" fill="#f59e0b" />
                  <Bar dataKey="Guiding" fill="#8b5cf6" />
                  <Bar dataKey="PR" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Vývoj jednotlivých projektů (absolutní hodnoty)
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mesicniData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="interniHodin" stroke="#3b82f6" strokeWidth={2} name="Interní" />
                  <Line type="monotone" dataKey="opsHodin" stroke="#10b981" strokeWidth={2} name="OPS" />
                  <Line type="monotone" dataKey="rndHodin" stroke="#f59e0b" strokeWidth={2} name="R&D" />
                  <Line type="monotone" dataKey="guidingHodin" stroke="#8b5cf6" strokeWidth={2} name="Guiding" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* OPS Activities Tab */}
        {activeTab === 'ops' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Vývoj OPS aktivit - Design tým OPS_2025
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={mesicniData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="opsHiring" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Hiring" />
                  <Area type="monotone" dataKey="opsJobs" stackId="1" stroke="#10b981" fill="#10b981" name="Jobs" />
                  <Area type="monotone" dataKey="opsReviews" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Reviews" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Porovnání OPS aktivit - trendy
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mesicniData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="opsHiring" stroke="#3b82f6" strokeWidth={3} name="Hiring" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="opsJobs" stroke="#10b981" strokeWidth={3} name="Jobs" dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="opsReviews" stroke="#f59e0b" strokeWidth={3} name="Reviews" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  <strong>📊 Klíčové trendy:</strong>
                </p>
                <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', paddingLeft: '20px' }}>
                  <li><strong>Jobs</strong> dominují v OPS aktivitách (výrazný nárůst v červenci a září)</li>
                  <li><strong>Hiring</strong> měl peak v dubnu, následoval pokles a opět nárůst v září</li>
                  <li><strong>Reviews</strong> zůstávají relativně stabilní, s mírnými výkyvy</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Vývoj FTE jednotlivých členů týmu
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={fteVyvoj}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mesic" stroke="#666" />
                  <YAxis stroke="#666" label={{ value: 'FTE', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Tomáš" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Milan" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Jiří" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Petra" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Martin" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Tobiáš" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Jaroslav" stroke="#84cc16" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>
                Statistiky týmu
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {[
                  { label: 'Celkem členů', value: '7', desc: 'Aktivních v září' },
                  { label: 'Nejvytíženější', value: 'Tomáš', desc: '1.00 FTE' },
                  { label: 'Průměr září', value: '0.44 FTE', desc: 'Na osobu' },
                  { label: 'Nárůst kapacity', value: '+83%', desc: 'Duben → Září' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{stat.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '2px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '0' }}>
            📅 Analyzované období: <strong>Duben 2025 - Listopad 2025</strong> (8 měsíců)
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendDashboard;