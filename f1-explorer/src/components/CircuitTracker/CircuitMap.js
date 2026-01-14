import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './CircuitMap.css';

// Map Controller to handle smooth zoom animations
const MapController = ({ geoJsonData }) => {
    const map = useMap();
    const geoJsonRef = useRef(null); // Ref to track the GeoJSON layer

    useEffect(() => {
        if (geoJsonData) {
            if (geoJsonRef.current) {
                //[lat, long], zoom level, time
                map.flyTo([20, 0], 2, { duration: 2 }); // Step 1: Zoom out to world map
                setTimeout(() => {
                    map.removeLayer(geoJsonRef.current); // Step 2: Remove old layer after zoom out
                }, 2000);
            }

            setTimeout(() => {
                const layer = L.geoJSON(geoJsonData, {
                    style: {
                        color: 'black',
                        weight: 3,
                        opacity: 0.9,
                    }
                });

                layer.addTo(map); 
                geoJsonRef.current = layer; 

                map.flyToBounds(layer.getBounds(), { duration: 2 }); // Step 4: Smooth zoom into the new circuit
            }, 2000); 
        }
    }, [geoJsonData, map]);

    return null;
};

const CircuitMap = ({ selectedCircuit }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    useEffect(() => {
        if (selectedCircuit) {
            console.log("Selected Circuit:", selectedCircuit);

            fetch(`https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/${selectedCircuit}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch GeoJSON data");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("GeoJSON data loaded:", data);
                    setGeoJsonData(data);
                })
                .catch((error) => console.error("Error fetching GeoJSON:", error));
        }
    }, [selectedCircuit]);
    //MapContainer: The photo frame.
    // TileLayer: The printed world map inside the frame.
    // MapController: Your notes, pins, and highlights drawn over it.
    return (
        <div className="map-container">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                scrollWheelZoom={true}
                dragging={true}
                worldCopyJump={false}
                maxBounds={[
                    [-90, -180],
                    [90, 180]
                ]}
                maxBoundsViscosity={1.0}
                style={{ height: '95vh', width: '95vw', borderRadius: '15px' }}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a> Satellite'
                />

                <MapController geoJsonData={geoJsonData} />
            </MapContainer>
        </div>
    );
};

export default CircuitMap;
