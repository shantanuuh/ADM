import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { reportIncident } from '../services/api';
import { useNavigate } from 'react-router-dom';
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

// Constants for Maharashtra Bounds
const MAHARASHTRA_BOUNDS = [
    [15.60, 72.60], // Southwest
    [22.10, 81.00]  // Northeast
];
const MAHARASHTRA_CENTER = [19.7515, 75.7139];

// Component to fly to user location
const RecenterMap = ({ lat, lng }) => {
    const map = useMap(); // Only works inside MapContainer
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 16);
        }
    }, [lat, lng, map]);
    return null;
};

// Child component to handle map clicks
const LocationMarker = ({ setPosition, position }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const ReportIncident = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Road Damage'
    });
    const [position, setPosition] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { title, description, category } = formData;

    // Get location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                // Auto-set marker to user location initially? Maybe just center map.
                setUserLoc({ lat: latitude, lng: longitude });
                // Optional: Pre-select user location
                // setPosition({ lat: latitude, lng: longitude }); 
            }, (err) => console.log(err));
        }
    }, []);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            setError('Please pinpoint the location on the map.');
            return;
        }

        try {
            await reportIncident({
                ...formData,
                latitude: position.lat,
                longitude: position.lng
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to report incident.');
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4 h-[calc(100vh-64px)]">
            {/* Form Section */}
            <div className="w-full md:w-1/3 bg-white p-4 rounded shadow overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Report Incident</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-gray-700 font-bold">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={title}
                            onChange={onChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold">Description</label>
                        <textarea
                            name="description"
                            value={description}
                            onChange={onChange}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold">Category</label>
                        <select
                            name="category"
                            value={category}
                            onChange={onChange}
                            className="w-full p-2 border rounded"
                        >
                            <option>Road Damage</option>
                            <option>Water Leakage</option>
                            <option>Accident</option>
                            <option>Garbage</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="bg-blue-50 p-2 rounded text-sm text-blue-800">
                        👉 Click on the map to set location: <br />
                        {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'No location selected'}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 font-bold"
                    >
                        Submit Report
                    </button>
                </form>
            </div>

            {/* Map Section */}
            <div className="w-full md:w-2/3 bg-gray-200 rounded shadow h-96 md:h-auto overflow-hidden relative">
                <MapContainer
                    center={MAHARASHTRA_CENTER}
                    zoom={7}
                    style={{ height: "100%", width: "100%" }}
                    maxBounds={MAHARASHTRA_BOUNDS}
                    minZoom={6}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {userLoc && <RecenterMap lat={userLoc.lat} lng={userLoc.lng} />}
                    <LocationMarker setPosition={setPosition} position={position} />
                </MapContainer>
            </div>
        </div>
    );
};

export default ReportIncident;
