import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import incidentService from '../services/incidentService';

// Fix for default marker icon in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
function AddIncidentMarker({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

const Map = () => {
    const [incidents, setIncidents] = useState({ type: 'FeatureCollection', features: [] });
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [formData, setFormData] = useState({ type: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const data = await incidentService.getIncidents();
            setIncidents(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load incidents');
            setLoading(false);
        }
    };

    const handleLocationSelect = (latlng) => {
        setSelectedPosition(latlng);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await incidentService.createIncident({
                ...formData,
                latitude: selectedPosition.lat,
                longitude: selectedPosition.lng,
                status: 'open' // default
            });
            // Reset and refresh
            setSelectedPosition(null);
            setFormData({ type: '', description: '' });
            fetchIncidents();
        } catch (err) {
            alert('Failed to report incident: ' + err.message);
        }
    };

    if (loading) return <div>Loading Map...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-blue-800 text-white p-4 shadow-lg z-10">
                <h1 className="text-2xl font-bold">Smart City Incident Map</h1>
                <p className="text-sm">Click on the map to report an incident</p>
            </div>

            <div className="flex-1 relative">
                <MapContainer
                    center={[51.505, -0.09]}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Existing Incident Markers */}
                    {incidents.features.map((feature) => (
                        <Marker
                            key={feature.properties.id}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        >
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{feature.properties.type}</h3>
                                    <p>{feature.properties.description}</p>
                                    <span className={`text-xs px-2 py-1 rounded text-white ${feature.properties.status === 'open' ? 'bg-red-500' : 'bg-green-500'
                                        }`}>
                                        {feature.properties.status.toUpperCase()}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Temporary Marker for new selection */}
                    {selectedPosition && (
                        <Marker position={selectedPosition}>
                            <Popup offset={[0, -25]} minWidth={250}>
                                <form onSubmit={handleSubmit} className="p-2">
                                    <h3 className="font-bold mb-2">Report Incident</h3>
                                    <div className="mb-2">
                                        <label className="block text-sm">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full border p-1 rounded"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Road Accident">Road Accident</option>
                                            <option value="Fire">Fire</option>
                                            <option value="Flooding">Flooding</option>
                                            <option value="Power Outage">Power Outage</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-sm">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full border p-1 rounded"
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPosition(null)}
                                            className="text-gray-500 text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </Popup>
                        </Marker>
                    )}

                    <AddIncidentMarker onLocationSelect={handleLocationSelect} />
                </MapContainer>
            </div>
        </div>
    );
};

export default Map;
