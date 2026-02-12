import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LogOut, List, Map as MapIcon, XCircle, CheckCircle, MapPin } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
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

const API_URL = 'http://localhost:5000/api/incidents';

const AdminDashboard = () => {
    const [incidents, setIncidents] = useState({ type: "FeatureCollection", features: [] });
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [showList, setShowList] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(API_URL, {
                headers: { 'x-auth-token': token }
            });
            setIncidents(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleResolve = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/${id}/status`, { status: 'RESOLVED' }, {
                headers: { 'x-auth-token': token }
            });
            fetchIncidents();
            setSelectedIncident(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchIncidents();
            setSelectedIncident(null);
        } catch (error) {
            console.error(error);
        }
    }

    const FlyToLocation = ({ location }) => {
        const map = useMap();
        useEffect(() => {
            if (location) {
                map.flyTo([location[1], location[0]], 15, { duration: 2 });
            }
        }, [location, map]);
        return null;
    };

    const filteredFeatures = incidents.features.filter(feature => {
        if (filter === 'ALL') return true;
        return feature.properties.status === filter;
    });

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-[#0B0F19] via-slate-900 to-indigo-950 relative overflow-hidden font-sans text-slate-900">

            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
                <MapContainer center={[20, 0]} zoom={3} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {selectedIncident && <FlyToLocation location={selectedIncident.geometry.coordinates} />}
                    {filteredFeatures.map((feature) => (
                        <Marker
                            key={feature.properties.id}
                            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                            eventHandlers={{
                                click: () => {
                                    setSelectedIncident(feature);
                                    setShowList(false);
                                },
                            }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* UI Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">

                {/* Header */}
                <header className="pointer-events-auto p-4 md:p-6">
                    <GlassCard className="flex flex-col md:flex-row justify-between items-center p-4">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <div className="flex items-center w-full md:w-auto">
                                <h1 className="font-bold text-2xl text-indigo-950 tracking-wide">PIMS Admin</h1>
                            </div>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setShowList(!showList)}
                            >
                                <List size={20} />
                            </Button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
                                {['ALL', 'OPEN', 'RESOLVED'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <Button variant="danger" size="icon" onClick={handleLogout} className="ml-auto">
                                <LogOut size={20} />
                            </Button>
                        </div>
                    </GlassCard>
                </header>

                {/* Content */}
                <div className="flex-1 flex p-4 md:p-6 gap-6 overflow-hidden relative">

                    {/* Sidebar List */}
                    <div className={`
                        pointer-events-auto absolute md:static inset-0 z-20 
                        bg-gray-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none 
                        transition-transform duration-300 w-full md:w-80 flex flex-col p-4 md:p-0
                        ${showList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}>
                        <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                    <List size={18} className="text-indigo-600" />
                                    Recent Reports
                                </h2>
                                <button onClick={() => setShowList(false)} className="md:hidden text-slate-500">
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-2 flex-1">
                                {filteredFeatures.length === 0 ? (
                                    <div className="text-center text-gray-500 py-10">No reports found</div>
                                ) : (
                                    filteredFeatures.map(item => (
                                        <div
                                            key={item.properties.id}
                                            className={`
                                                relative group p-4 rounded-xl cursor-pointer transition-all border border-transparent
                                                hover:bg-indigo-50/50 hover:border-indigo-200
                                                ${selectedIncident?.properties?.id === item.properties.id ? 'bg-indigo-100/50 border-indigo-200 shadow-sm' : 'bg-white/40'}
                                            `}
                                            onClick={() => {
                                                setSelectedIncident(item);
                                                setShowList(false);
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge status={item.properties.status} />
                                                <span className="text-xs text-slate-500 font-medium bg-white/50 px-2 py-0.5 rounded-md">
                                                    {new Date(item.properties.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="pr-8"> {/* Padding for the absolute button */}
                                                <h3 className="font-bold text-slate-900 truncate text-sm mb-0.5">{item.properties.title}</h3>
                                                <p className="text-xs text-slate-600 truncate">{item.properties.description}</p>
                                            </div>

                                            {/* Explicit View Button - Visible on hover or active */}
                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${selectedIncident?.properties?.id === item.properties.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-8 w-8 bg-white shadow-sm hover:bg-indigo-50 text-indigo-600 rounded-full"
                                                    title="View Location"
                                                >
                                                    <MapPin size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Detail Panel */}
                    {selectedIncident && (
                        <div className="pointer-events-auto fixed md:absolute bottom-0 left-0 right-0 md:inset-auto md:right-0 md:bottom-0 md:w-96 md:self-end z-30 animate-slideUp md:animate-slideLeft">
                            <GlassCard className="m-2 md:m-0 p-6 rounded-b-none md:rounded-3xl border-b-0 md:border-b max-h-[80vh] overflow-y-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                                            {selectedIncident.properties.title}
                                        </h2>
                                        <Badge status={selectedIncident.properties.status} />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedIncident(null)} className="text-slate-500 hover:text-slate-900">
                                        <XCircle size={24} />
                                    </Button>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="bg-white/40 rounded-xl p-4 border border-white/20">
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-wider">Description</label>
                                        <p className="text-slate-800 text-sm leading-relaxed">
                                            {selectedIncident.properties.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/40 rounded-xl p-3 border border-white/20">
                                            <label className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Type</label>
                                            <span className="text-slate-900 font-medium">{selectedIncident.properties.type}</span>
                                        </div>
                                        <div className="bg-white/40 rounded-xl p-3 border border-white/20">
                                            <label className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Coordinates</label>
                                            <span className="text-slate-700 font-mono text-xs">
                                                {selectedIncident.geometry.coordinates[1].toFixed(4)}, {selectedIncident.geometry.coordinates[0].toFixed(4)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {selectedIncident.properties.status === 'OPEN' ? (
                                        <Button
                                            variant="success"
                                            className="flex-1"
                                            onClick={() => handleResolve(selectedIncident.properties.id)}
                                        >
                                            <CheckCircle size={18} /> Resolve
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" disabled className="flex-1">
                                            Resolved
                                        </Button>
                                    )}
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(selectedIncident.properties.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </GlassCard>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes slideLeft { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-slideLeft { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
