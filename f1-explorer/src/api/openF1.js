import axios from 'axios';

export const fetchDrivers = async () => {
    try {
        const response = await axios.get('https://api.openf1.org/v1/drivers');
        if (!response.data || !Array.isArray(response.data)) return [];  
        const recentDrivers = response.data.slice(-20);
        return recentDrivers;
    } catch (error) {
        console.error("Error fetching drivers:", error);
        return []; 
    }
};

export const fetchDriverById = async (driverId) => {
    try {
        const response = await axios.get('https://api.openf1.org/v1/drivers', {
            params: {
                driver_number: driverId
            }
        });
        
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            return null;
        }
        const latestEntry = response.data[response.data.length - 1];
        if (response.team_name === null || response.team_colour === null) {
            return null;
        }
        console.log('Driver data: ', response.data[0]); 
        return latestEntry;
    } catch (error) {
        console.error("Error fetching driver:", error);
        return null;
    }
};

export async function fetchRecentMeetingKeys(count) {
    const response = await fetch('https://api.openf1.org/v1/sessions');
    const data = await response.json();
  
    console.log('All session data:', data); // 👈 log this
  
    const sorted = data
      .filter(s => s.meeting_key)
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
  
    const recentKeys = [...new Set(sorted.map(s => s.meeting_key))].slice(0, count);
    console.log("Recent meeting keys (debug):", recentKeys); // 👈 this is probably []
    return recentKeys;
};

export const fetchMeetingDetails = async (recentKeys) => {
    try {
        const requests = recentKeys.map(key =>
            axios.get('https://api.openf1.org/v1/meetings', {
                params: { meeting_key: key }
            })
        );

        const responses = await Promise.all(requests);

        const allMeetings = responses
            .flatMap(res => res.data)
            .filter(m => m && m.meeting_key);

        console.log("Fetched meetings:", allMeetings);

        return allMeetings.map(meeting => ({
            meeting_key: meeting.meeting_key,
            meeting_name: meeting.meeting_name,
            country_code: meeting.country_code
        }));
    } catch (error) {
        console.error("Error fetching the meeting data: ", error);
        return [];
    }
};


export const fetchDriverPositionsByMeetings = async (driverId, meetingKeys) => {
    try {
        const allPositions = [];

        for (const key of meetingKeys) {
            const response = await axios.get('https://api.openf1.org/v1/position', {
                params: {
                    meeting_key: key,
                    driver_number: driverId
                }
            });

            if (Array.isArray(response.data) && response.data.length > 0) {
                const latestEntry = response.data[response.data.length - 1]; 
                allPositions.push(latestEntry);
            }
        }

        return allPositions;
    } catch (error) {
        console.error("Error fetching driver positions:", error);
        return [];
    }
};


export const fetchDriversPosition = async (driverNumber) => {
    try {
        const response = await axios.get('https://api.openf1.org/v1/position', {
            params: {
                driver_number: driverNumber,
                session_type: 'Race' 
            }
        });
        const sorted = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        return sorted;
    }
    catch (error) {
        console.error('Error fetching driver positions: ', error);
        return [];
    }
};

