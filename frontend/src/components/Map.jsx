import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import incidentService from '../services/incidentService';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Navigation, User, Loader2, CheckCircle } from 'lucide-react';
import L from 'leaflet';

import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input, { TextArea } from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';

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

const MAHARASHTRA_CENTER = [19.7515, 75.7139];
const MAHARASHTRA_BOUNDS = [[15.6, 72.6], [22.1, 80.9]];

function MapEvents({ onLocationSelect, reportMode }) {
    useMapEvents({
        click(e) {
            if (reportMode) onLocationSelect(e.latlng);
        },
    });
    return null;
}

function LocateControl() {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);
    const [locationLayer, setLocationLayer] = useState(null);

    const handleLocate = () => {
        setIsLocating(true);
        if (locationLayer) {
            locationLayer.remove();
        }

        map.locate({ setView: true, maxZoom: 16 })
            .once("locationfound", function (e) {
                setIsLocating(false);
                const radius = e.accuracy;
                const circle = L.circle(e.latlng, { radius, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 });
                const marker = L.marker(e.latlng).bindPopup(`You are within ${parseInt(radius)} meters from this point`).openPopup();
                const group = L.layerGroup([circle, marker]).addTo(map);
                setLocationLayer(group);
            })
            .once("locationerror", function (e) {
                setIsLocating(false);
                alert("Could not access location: " + e.message);
            });
    };

    return (
        <div className="absolute bottom-24 right-4 md:bottom-8 md:right-8 z-[400]">
            <Button
                variant="secondary"
                size="icon"
                onClick={handleLocate}
                disabled={isLocating}
                className={`rounded-full w-12 h-12 shadow-xl bg-white text-gray-900 data-[hover]:bg-gray-100 border-0 transition-all duration-300 ${isLocating ? 'animate-pulse bg-blue-50 text-blue-600' : ''}`}
            >
                <Navigation size={24} className={`fill-current ${isLocating ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}

function CenterOnMarker({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom() < 14 ? 14 : map.getZoom(), { duration: 0.5 });
        }
    }, [position, map]);
    return null;
}

const Map = () => {
    const [incidents, setIncidents] = useState({ type: 'FeatureCollection', features: [] });
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [reportMode, setReportMode] = useState(false);
    const [formData, setFormData] = useState({ type: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const data = await incidentService.getIncidents();
            setIncidents(data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const handleLocationSelect = (latlng) => setSelectedPosition(latlng);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        try {
            await incidentService.createIncident({
                ...formData,
                latitude: selectedPosition.lat,
                longitude: selectedPosition.lng,
                status: 'open'
            });

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Reset form
            setSelectedPosition(null);
            setFormData({ type: '', description: '' });
            setReportMode(false);
            fetchIncidents();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading System...</div>;

    return (
        <div className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0B0F19] via-slate-900 to-indigo-950">

            {/* Controls Layer */}
            <div className="absolute inset-x-0 top-0 z-[1000] p-4 pointer-events-none">
                <GlassCard className="pointer-events-auto flex justify-between items-center p-4 rounded-2xl mx-auto max-w-7xl">
                    <div className="flex items-center">
                        <h1 className="font-bold text-sm md:text-2xl text-indigo-950 tracking-wide leading-tight">Public Incident Management System</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="hidden md:flex"
                            onClick={() => navigate('/admin/login')}
                        >
                            Admin Login
                        </Button>

                        <Button
                            variant={reportMode ? 'danger' : 'primary'}
                            className="shadow-xl"
                            onClick={() => {
                                setReportMode(!reportMode);
                                setSelectedPosition(null);
                            }}
                        >
                            <AlertTriangle size={18} />
                            <span className="text-xs md:text-sm whitespace-nowrap">
                                {reportMode ? 'Cancel' : 'Report Incident'}
                            </span>
                        </Button>
                    </div>
                </GlassCard>
            </div>

            {/* Mobile Admin Fab */}
            <div className="md:hidden absolute top-28 right-4 z-[1000]">
                <Button variant="secondary" size="icon" onClick={() => navigate('/admin/login')} className="shadow-lg bg-white/80 backdrop-blur-md border border-white/20 text-slate-900">
                    <User size={20} />
                </Button>
            </div>

            {/* Success Notification */}
            {showSuccess && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[1000] animate-bounce-in">
                    <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 font-bold backdrop-blur-md">
                        <CheckCircle size={20} />
                        <span>Incident reported successfully!</span>
                    </div>
                </div>
            )}

            {/* Instruction Banner */}
            {reportMode && (
                <div className="absolute bottom-24 md:bottom-auto md:top-24 left-1/2 transform -translate-x-1/2 z-[1000] animate-bounce-in w-max max-w-[90%] pointer-events-none">
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-2xl flex items-center justify-center gap-2 border border-white/20 font-bold backdrop-blur-md text-sm md:text-base pointer-events-auto">
                        <MapPin size={16} className="animate-bounce md:w-5 md:h-5" />
                        <span>Tap location on map</span>
                    </div>
                </div>
            )}

            <div className="flex-1 relative z-0">
                <MapContainer
                    center={MAHARASHTRA_CENTER}
                    zoom={7}
                    className="h-full w-full bg-gray-100"
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OSM'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapEvents onLocationSelect={handleLocationSelect} reportMode={reportMode} />
                    <CenterOnMarker position={selectedPosition} />
                    <LocateControl />

                    {incidents.features.map((feature) => (
                        <Marker
                            key={feature.properties.id}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                        >
                            <Popup className="dark-glass-popup">
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge status={feature.properties.status} />
                                        <span className="text-xs text-slate-500 font-medium">{new Date(feature.properties.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-1">{feature.properties.type}</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed">{feature.properties.description}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {selectedPosition && (
                        <Marker position={selectedPosition}>
                            <Popup offset={[0, -25]} minWidth={280} className="dark-glass-popup-form">
                                <form onSubmit={handleSubmit} className="p-1">
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
                                        <AlertTriangle size={16} className="text-indigo-950" />
                                        <h3 className="font-bold text-indigo-950">New Report</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <Select
                                            id="incident-type"
                                            label="Type"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                            options={[
                                                { value: '', label: 'Select...' },
                                                { value: 'Road Accident', label: 'Road Accident' },
                                                { value: 'Fire', label: 'Fire' },
                                                { value: 'Flooding', label: 'Flooding' },
                                                { value: 'Power Outage', label: 'Power Outage' },
                                                { value: 'Garbage', label: 'Garbage Dump' },
                                                { value: 'Pothole', label: 'Pothole' },
                                                { value: 'Other', label: 'Other' }
                                            ]}
                                        />

                                        <TextArea
                                            label="Details"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What happened?"
                                            required
                                        />

                                        {formError && (
                                            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-2 rounded-lg text-xs">
                                                {formError}
                                            </div>
                                        )}

                                        <Button type="submit" className="w-full" disabled={submitting}>
                                            {submitting ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>Submitting...</span>
                                                </>
                                            ) : (
                                                'Submit Report'
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            <style>{`
                .leaflet-popup-content-wrapper {
                    background: rgba(20, 25, 40, 0.9);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    color: white;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .leaflet-popup-tip { background: rgba(20, 25, 40, 0.9); }
                .leaflet-container a.leaflet-popup-close-button { color: rgba(255,255,255,0.4); }
                .leaflet-container a.leaflet-popup-close-button:hover { color: white; }
                @keyframes bounceIn {
                    0% { opacity: 0; transform: translate(-50%, -20px); }
                    100% { opacity: 1; transform: translate(-50%, 0); }
                }
                .animate-bounce-in { animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @media (max-width: 640px) {
                    .leaflet-popup-content-wrapper {
                        border-radius: 16px;
                    }
                    .leaflet-popup-content {
                        margin: 10px !important;
                        min-width: 280px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Map;
