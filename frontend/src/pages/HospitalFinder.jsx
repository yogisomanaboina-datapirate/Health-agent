import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Siren,
  Navigation,
  CheckCircle2,
  Star,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';
import { api } from '../api/client.js';

export default function HospitalFinder() {
  const { setActiveDispatch } = useHealth();
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filterRadius, setFilterRadius] = useState('10 km');
  const [filterType, setFilterType] = useState('All Types');
  const [loading, setLoading] = useState(true);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await api.getHospitals();
        if (res.success && res.data) {
          setHospitals(res.data);
          setSelectedHospital(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHospitals();
  }, []);

  const handleTriggerEmergency = async (hosp) => {
    const target = hosp || selectedHospital || hospitals[0];
    if (!target) return;
    setEmergencyLoading(true);

    try {
      // Trigger Autonomous Bed Allocation & Dispatch
      const res = await api.dispatchAmbulance(target.id);
      if (res.success && res.data) {
        setActiveDispatch(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Dashboard &gt; <span className="text-slate-600 font-medium">Hospital Finder</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Finder</h1>
          <p className="text-xs text-slate-500">Find nearby hospitals and check facilities, bed availability, and contact details.</p>
        </div>

        {/* Big Glowing Emergency Mode Button */}
        <button
          onClick={() => handleTriggerEmergency(selectedHospital)}
          disabled={emergencyLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-500/40 border border-red-400 transition-all animate-emergency self-start sm:self-auto"
        >
          <Siren className="w-4 h-4 animate-bounce" />
          <span>{emergencyLoading ? 'Allocating ICU Bed...' : 'Emergency SOS Mode'}</span>
        </button>
      </div>

      {/* Filter Bar (Page 9) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Location</label>
          <input
            type="text"
            defaultValue="Hyderabad, Telangana"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          />
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Radius</label>
          <select
            value={filterRadius}
            onChange={(e) => setFilterRadius(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option>5 km</option>
            <option>10 km</option>
            <option>25 km</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Hospital Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option>All Types</option>
            <option>Super Speciality</option>
            <option>Multi Speciality</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Facilities</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800">
            <option>ICU & Emergency</option>
            <option>Pharmacy 24/7</option>
            <option>All Facilities</option>
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="text-[10px] text-slate-400 font-semibold block mb-1">Sort By</label>
          <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800">
            <option>Distance: Near to Far</option>
            <option>ICU Beds Available</option>
            <option>Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Map & Hospital Cards + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Interactive Map & Hospital Cards */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Simulated OpenStreetMap / Leaflet View Box */}
          <div className="relative h-64 sm:h-80 bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
            
            {/* Map Background Tile Graphic */}
            <div
              className="absolute inset-0 bg-cover bg-center filter saturate-75 opacity-90"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`
              }}
            >
              {/* Overlay with coordinate grid styling */}
              <div className="absolute inset-0 bg-blue-950/20 backdrop-contrast-125"></div>
            </div>

            {/* Hospital Markers pinned on map */}
            <div className="absolute inset-0 p-4 pointer-events-none">
              
              {/* Patient Pin */}
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-400/50 animate-ping"></div>
                <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded shadow mt-1">
                  You (Banjara Hills)
                </span>
              </div>

              {/* Hospital Markers */}
              {hospitals.map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHospital(h)}
                  style={{
                    top: `${30 + (i * 12)}%`,
                    left: `${40 + (i * 10)}%`
                  }}
                  className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    selectedHospital?.id === h.id ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl shadow-lg flex items-center gap-1 text-[10px] font-bold ${
                    selectedHospital?.id === h.id
                      ? 'bg-red-600 text-white ring-2 ring-white'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{h.name.split(' ')[0]}</span>
                    <span className="bg-emerald-500 text-white text-[8px] px-1 rounded-full">
                      {h.icuBedsFree}
                    </span>
                  </div>
                </button>
              ))}

            </div>

            {/* Map Controls */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg p-1 shadow border border-slate-200 flex flex-col gap-1 text-xs font-bold text-slate-700">
              <button className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center">+</button>
              <button className="w-6 h-6 hover:bg-slate-100 rounded flex items-center justify-center">-</button>
            </div>

            {/* Live Indicator Pill */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 shadow-md border border-slate-200 text-[11px] font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>5 Hospitals Found • Live ICU Bed Sync</span>
            </div>
          </div>

          {/* Hospital Cards List (Page 9) */}
          <div className="space-y-3">
            {hospitals.map((h) => (
              <div
                key={h.id}
                onClick={() => setSelectedHospital(h)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                  selectedHospital?.id === h.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {h.distance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">{h.type}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{h.address}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {h.rating} <span className="text-slate-400 font-normal">({h.reviewsCount})</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">
                        {h.icuBedsFree} ICU Beds Free
                      </span>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">
                        Ambulance: {h.ambulanceEtaMinutes} min ETA
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHospital(h);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    >
                      View Details
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerEmergency(h);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm shadow-red-500/20"
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right 5 Cols: Selected Hospital Detail Drawer (Page 9) */}
        <div className="lg:col-span-5 space-y-4">
          
          {selectedHospital ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
              
              {/* Photo & Badge */}
              <div className="relative h-44 bg-slate-200">
                <img
                  src={selectedHospital.image}
                  alt={selectedHospital.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                  Open 24 Hours
                </div>
              </div>

              <div className="p-5 pt-0 space-y-4">
                
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{selectedHospital.name}</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedHospital.type}</p>
                  <p className="text-xs text-blue-600 font-semibold mt-1">
                    ★ {selectedHospital.rating} ({selectedHospital.reviewsCount} reviews) • {selectedHospital.distance} away
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <a
                    href={`tel:${selectedHospital.emergencyPhone}`}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>

                  <button
                    onClick={() => handleTriggerEmergency(selectedHospital)}
                    className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-center flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/20 font-bold"
                  >
                    <Siren className="w-3.5 h-3.5" />
                    <span>SOS Dispatch</span>
                  </button>

                  <button
                    onClick={() => alert(`Directions to ${selectedHospital.name} opened in map navigation.`)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-center flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    <span>Directions</span>
                  </button>
                </div>

                {/* Key Facilities Badges (Page 9) */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2">Key Facilities</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(selectedHospital.facilities || []).map((fac, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-[11px] font-medium">{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Address</span>
                    <span className="text-slate-700 font-medium">{selectedHospital.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">General Desk</span>
                    <span className="text-slate-800 font-semibold">{selectedHospital.phone}</span>
                  </div>
                  <div>
                    <span className="text-red-500 text-[10px] block font-bold">24/7 Emergency Hotline</span>
                    <span className="text-red-600 font-bold">{selectedHospital.emergencyPhone}</span>
                  </div>
                </div>

              </div>

            </div>
          ) : null}

        </div>

      </div>

    </div>
  );
}
