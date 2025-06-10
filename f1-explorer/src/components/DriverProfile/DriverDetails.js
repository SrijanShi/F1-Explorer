import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  
    fetchDriverById,
    fetchRecentMeetingKeys,
    fetchDriverPositionsByMeetings,
    fetchMeetingDetails
} from '../../api/openF1';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './DriverDetails.css';

const DriverDetails = () => {
    
    const { id } = useParams();
    const navigate = useNavigate();
    const [driverInfo, setDriverInfo] = useState(null);
    const [raceStats, setRaceStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const [meetingLabels, setMeetingLabels] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [driver, meetingKeys] = await Promise.all([
        fetchDriverById(id),
        fetchRecentMeetingKeys(6)
      ]);

      const [stats, meetingInfo] = await Promise.all([
        fetchDriverPositionsByMeetings(id, meetingKeys),
        fetchMeetingDetails(meetingKeys)
      ]);

      // Map meetingKey -> meeting label info
      const labelMap = {};
      meetingInfo.forEach(meeting => {
        labelMap[meeting.meeting_key] = {
          name: meeting.meeting_name,
          country: meeting.country_code
        };
      });

      setDriverInfo(driver);
      setRaceStats(stats);

      const finalLabels = stats.map(stat => {
        const key = stat.meeting_key;
        return labelMap[key] || { name: 'Unknown', country: 'UNK' };
      });

      setMeetingLabels(finalLabels);

    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);


      const goBack = () => {
        navigate('/drivers');
      }
      
      const isMobile = window.innerWidth <= 768;

      const chartData = {
        labels: meetingLabels.map(label => isMobile ? label.country : label.name),
        datasets: [
          {
            label: 'Race Position',
            data: raceStats.map(stat => stat.position),
            borderColor: `#${driverInfo?.team_colour || 'ff4757'}`,
            backgroundColor: `#${driverInfo?.team_colour || 'ff4757'}33`,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: `#${driverInfo?.team_colour || 'ff4757'}`
          }
        ]
      };
    
      const chartOptions = {
        scales: {
          y: {
            reverse: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#ccc'
            },
            title: {
              display: true,
              text: 'Race Position',
              color: '#fff'
            }
          },
          x: {
            ticks: { color: '#ccc' },
            title: {
              display: true,
              text: 'Date',
              color: '#fff'
            }
          }
        },
        plugins: {
          legend: { labels: { color: '#fff' } },
          tooltip: {
            backgroundColor: '#1e1e1e',
            titleColor: '#fff',
            bodyColor: '#ddd'
          }
        },
        maintainAspectRatio: false
      };

      if(loading) {
        return (
            <div className="driver-loading">
                <div className="spinner" />
                <p>Loading driver details...</p>
            </div>
        )
      }

      if(!driverInfo) {
        return (
            <div className="driver-error">
                <h2>Driver Not Found</h2>
                <button onClick={goBack}>Drivers</button>
            </div>
        );
      }
      
      return (
        <div className="driver-details">
          <button className="back-btn" onClick={goBack}>← Back</button>
    
          <div className="driver-header" style={{ borderColor: `#${driverInfo.team_colour}` }}>
            
            <div className="driver-meta">
              <h1>{driverInfo.full_name}</h1>
              <p><strong>Number:</strong> #{driverInfo.driver_number}</p>
              <p><strong>Team:</strong> {driverInfo.team_name}</p>
              <p><strong>Nationality:</strong> {driverInfo.country_code}</p>
            </div>
          </div>
    
          <div className="chart-section">
            <h2>Recent Race Performance</h2>
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
    
          <div className="race-history">
            <h2>Race History</h2>
            <div className="history-grid">
              {raceStats.map((race, index) => {
                const posColor =
                  race.position === 1 ? '#FFD700' :
                  race.position <= 3 ? '#C0C0C0' :
                  race.position <= 10 ? '#4CAF50' : '#9E9E9E';
    
                return (
                  <div key={index} className="history-card" style={{ borderColor: posColor }}>
                    <div className="race-date">
                      {new Date(race.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="race-pos" style={{ color: posColor }}>
                      {race.position}{['st', 'nd', 'rd'][((race.position + 90) % 100 - 10) % 10 - 1] || 'th'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    };
    
    export default DriverDetails;