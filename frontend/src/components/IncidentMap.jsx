import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapIncidents } from '../services/api';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Constants for Maharashtra Bounds
const MAHARASHTRA_BOUNDS = [
    [15.60, 72.60], // Southwest
    [22.10, 81.00]  // Northeast
];
const MAHARASHTRA_CENTER = [19.7515, 75.7139];

// Component to fly to user location
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 15);
        }
    }, [lat, lng, map]);
    return null;
};

const IncidentMap = () => {
    const [incidents, setIncidents] = useState({ type: "FeatureCollection", features: [] });
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // 1. Fetch Incidents
        const fetchIncidents = async () => {
            try {
                const data = await getMapIncidents();
                setIncidents(data);
            } catch (error) {
                console.error('Error fetching incidents:', error);
            }
        };
        fetchIncidents();

        // 2. Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("Location access denied or error:", error.message);
                }
            );
        }
    }, []);

    return (
        <MapContainer
            center={MAHARASHTRA_CENTER}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            maxBounds={MAHARASHTRA_BOUNDS}
            maxBoundsViscosity={1.0}
            minZoom={6}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-center on user if location found */}
            {userLocation && <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />}
            {/* Show User Location Marker */}
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} opacity={0.6}>
                    <Popup>You are here</Popup>
                </Marker>
            )}

            {incidents.features.map((feature, idx) => (
                <Marker
                    key={idx}
                    position={[
                        feature.geometry.coordinates[1], // Latitude
                        feature.geometry.coordinates[0]  // Longitude
                    ]}
                >
                    <Popup>
                        <strong>{feature.properties.title}</strong><br />
                        ID: {feature.properties.id}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default IncidentMap;
