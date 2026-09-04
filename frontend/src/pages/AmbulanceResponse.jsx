import React, { useState, useEffect, useCallback } from 'react';
import {
  Siren,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Activity,
  Heart,
  Navigation,
  RefreshCw,
  Crosshair,
  PhoneCall,
  Building2,
  Bed,
  Check,
  ArrowRight,
  XCircle,
  LocateFixed
} from 'lucide-react';
import { useHealth } from '../context/HealthContext.jsx';

export default function AmbulanceResponse() {
  const { user } = useHealth();

  // Location State
  const [userLocation, setUserLocation] = useState({
    lat: 17.4123,
    lng: 78.4321,
    area: user?.address || "Road No. 12, Banjara Hills, Hyderabad, Telangana",
    isGpsLive: false,
    accuracyMeters: null
  });
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Clinical Symptoms & Vitals
  const [symptoms, setSymptoms] = useState("Severe acute chest pain radiating to left arm with shortness of breath");
  const [heartRate, setHeartRate] = useState(115);
  const [bloodPressure, setBloodPressure] = useState("155/95");
  const [spo2, setSpo2] = useState(92);

  // Nearby Hospitals & Ambulance ETAs
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalList, setHospitalList] = useState([]);
  const [triageReport, setTriageReport] = useState(null);

  // Active Dispatch Mission (when user confirms a hospital)
  const [activeMission, setActiveMission] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [dispatchingHospitalId, setDispatchingHospitalId] = useState(null);

  const presets = [
    {
      title: "Cardiac Emergency (Chest Pain)",
      symptoms: "Severe acute substernal chest pressure radiating to left arm and jaw, cold diaphoresis, dyspnea",
      hr: 118,
      bp: "160/98",
      o2: 91
    },
    {
      title: "Acute Severe Asthma / Respiratory Distress",
      symptoms: "Audible wheezing, accessory muscle breathing, unable to speak full sentences",
      hr: 130,
      bp: "140/90",
      o2: 88
    },
    {
      title: "Suspected Acute Appendicitis / Trauma",
      symptoms: "Severe localized right lower quadrant abdominal pain, high fever, guarding and rebound tenderness",
      hr: 104,
      bp: "130/85",
      o2: 97
    }
  ];

  // GPS Geolocation Detection
  const detectLiveGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation((prev) => ({
          ...prev,
          lat: parseFloat(latitude.toFixed(4)),
          lng: parseFloat(longitude.toFixed(4)),
          area: `GPS: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
          isGpsLive: true,
          accuracyMeters: Math.round(accuracy)
        }));
        setDetectingGps(false);
      },
      (error) => {
        console.warn("GPS lookup failed:", error.message);
        setGpsError("GPS permission denied or timed out. Using default registered address.");
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  // Fetch Nearby Hospitals & ETAs based on coordinates & symptoms
  const fetchNearbyHospitals = useCallback(async (locOverride, symptomsOverride, hrOverride, bpOverride, o2Override) => {
    setLoadingHospitals(true);
    const loc = locOverride || userLocation;
    try {
      const res = await fetch('/api/agents/nearby-hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { lat: loc.lat, lng: loc.lng, area: loc.area },
          symptoms: symptomsOverride || symptoms,
          vitals: {
            heartRate: hrOverride || heartRate,
            bloodPressure: bpOverride || bloodPressure,
            spo2: o2Override || spo2
          }
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setHospitalList(data.data.hospitals || []);
        if (data.data.triage) {
          setTriageReport(data.data.triage);
        }
      }
    } catch (err) {
      console.error("Failed to fetch nearby hospitals:", err);
    } finally {
      setLoadingHospitals(false);
    }
  }, [userLocation, symptoms, heartRate, bloodPressure, spo2]);

  // Initial load: detect GPS and load initial nearby hospitals
  useEffect(() => {
    detectLiveGpsLocation();
    fetchNearbyHospitals();
  }, []);

  // Live Countdown for Active Ambulance
  useEffect(() => {
    if (!activeMission) return;
    const initialSeconds = (activeMission.ambulance?.etaMinutes || 5) * 60;
    setSecondsRemaining(initialSeconds);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMission]);

  // Confirm Dispatch from Specific Hospital
  const handleRequestAmbulance = async (hospital) => {
    setDispatchingHospitalId(hospital.id);
    try {
      const res = await fetch('/api/agents/ambulance-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          symptoms,
          vitals: { heartRate, bloodPressure, spo2 },
          location: userLocation
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setActiveMission(data.data);
      }
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setDispatchingHospitalId(null);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Autonomous Agents &gt; <span className="text-slate-600 font-medium">Pillar 1: Ambulance Response &amp; Nearby Hospital Matrix</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>Nearby Hospital Network &amp; Ambulance Response</span>
            <span className="text-xs font-bold bg-red-100 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
              Featherless AI Active
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time GPS location detection, instant distance calculation, and precise ambulance arrival times (ETAs) from nearby emergency hospitals.
          </p>
        </div>
      </div>

      {/* SECTION 1: LIVE LOCATION DETECTION BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              userLocation.isGpsLive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Your Current Emergency Location</span>
                {userLocation.isGpsLive ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live GPS Locked
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-medium px-2 py-0.5 rounded-full">
                    Profile Registered Address
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {userLocation.area}
              </p>
              {userLocation.isGpsLive && userLocation.accuracyMeters && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Coordinates: {userLocation.lat}, {userLocation.lng} (Accuracy ±{userLocation.accuracyMeters}m)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={detectLiveGpsLocation}
              disabled={detectingGps}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-all disabled:opacity-50"
            >
              {detectingGps ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Detecting GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
                  <span>Detect My Live GPS</span>
                </>
              )}
            </button>
            <button
              onClick={() => fetchNearbyHospitals()}
              disabled={loadingHospitals}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHospitals ? 'animate-spin' : ''}`} />
              <span>Refresh ETAs</span>
            </button>
          </div>
        </div>

        {gpsError && (
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* SECTION 2: CLINICAL SYMPTOM & TRIAGE INPUT */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Select Emergency Scenario or Enter Patient Symptoms:</span>
          </span>
        </div>

        {/* 1-Click Simulation Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSymptoms(p.symptoms);
                setHeartRate(p.hr);
                setBloodPressure(p.bp);
                setSpo2(p.o2);
                fetchNearbyHospitals(null, p.symptoms, p.hr, p.bp, p.o2);
              }}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-400 hover:bg-red-50/20 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 group-hover:text-red-600 truncate">{p.title}</span>
                <Siren className="w-3.5 h-3.5 text-red-500 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate">{p.symptoms}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>HR: {p.hr}</span>
                <span>•</span>
                <span>BP: {p.bp}</span>
                <span>•</span>
                <span>SpO2: {p.o2}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Symptom Input */}
        <div className="space-y-2 pt-1">
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe acute symptoms (e.g. chest pain, breathing difficulty, trauma)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-red-400"
          ></textarea>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Heart Rate (bpm)</label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Blood Pressure</label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Oxygen Saturation (SpO2 %)</label>
              <input
                type="number"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => fetchNearbyHospitals()}
              disabled={loadingHospitals}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loadingHospitals ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Calculating Nearby ETAs with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Update Hospital Matrix &amp; Triage</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: AI CLINICAL TRIAGE NOTICE */}
      {triageReport && (
        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-red-900">
                  AI Triage Urgency: {triageReport.urgencyLevel}
                </span>
                <span className="text-[10px] bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full">
                  Risk Score: {triageReport.riskScore}/10
                </span>
              </div>
              <p className="text-xs text-red-800 mt-0.5">
                {triageReport.rationale}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-red-600 font-semibold block uppercase">Recommended Setting</span>
            <span className="text-xs font-bold text-red-900">{triageReport.recommendedCareSetting || "Emergency Trauma Dept"}</span>
          </div>
        </div>
      )}

      {/* SECTION 4: NEARBY HOSPITALS & AMBULANCE ARRIVAL TIMES (ETA) MATRIX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Nearby Emergency Hospitals &amp; Ambulance Arrival Times</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by fastest ambulance arrival time (ETA) to your location ({userLocation.area}).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {hospitalList.length} Hospitals in Network
          </span>
        </div>

        {loadingHospitals && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Calculating real-time distances &amp; ambulance arrival times...</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitalList.map((hosp, index) => {
            const isDispatchedThis = activeMission?.hospital === hosp.name;
            const isRequestingThis = dispatchingHospitalId === hosp.id;

            return (
              <div
                key={hosp.id}
                className={`bg-white rounded-2xl p-5 border transition-all relative ${
                  hosp.isRecommended
                    ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* AI Recommended Badge */}
                {hosp.isRecommended && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>AI TOP PICK • FASTEST AMBULANCE</span>
                  </div>
                )}

                {/* Top Row: Name & ETA */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                      Rank #{index + 1} &bull; {hosp.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900">{hosp.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{hosp.address}</p>
                  </div>

                  {/* Big ETA Callout */}
                  <div className="text-right shrink-0 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                    <span className="text-[9px] text-red-600 font-bold uppercase block">Ambulance ETA</span>
                    <div className="text-lg font-black text-red-600 flex items-center gap-0.5 justify-end">
                      <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>{hosp.ambulanceEtaMinutes} mins</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{hosp.distanceKm} km away</span>
                  </div>
                </div>

                {/* Bed Availability & Facilities */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">ICU Beds Available:</span>
                    <span className="font-bold text-emerald-600">
                      {hosp.icuBedsFree} Beds Free
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Emergency Phone:</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">
                      {hosp.emergencyPhone || hosp.phone}
                    </span>
                  </div>
                </div>

                {/* Facilities Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(hosp.facilities || []).slice(0, 4).map((f, fi) => (
                    <span key={fi} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      ✓ {f}
                    </span>
                  ))}
                </div>

                {/* Direct Action Button: Request Ambulance From THIS Hospital */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleRequestAmbulance(hosp)}
                    disabled={isDispatchedThis || isRequestingThis}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                      isDispatchedThis
                        ? 'bg-emerald-600 text-white shadow-md'
                        : hosp.isRecommended
                        ? 'bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-md shadow-red-500/25'
                        : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white'
                    }`}
                  >
                    {isRequestingThis ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Ambulance...</span>
                      </>
                    ) : isDispatchedThis ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ambulance En Route from {hosp.name}</span>
                      </>
                    ) : (
                      <>
                        <Siren className="w-3.5 h-3.5" />
                        <span>Request Ambulance ({hosp.ambulanceEtaMinutes}m ETA)</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${(hosp.emergencyPhone || hosp.phone).replace(/\s+/g, '')}`}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title={`Call ${hosp.name} Direct Emergency Desk`}
                  >
                    <PhoneCall className="w-4 h-4 text-slate-700" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: ACTIVE AMBULANCE TELEMETRY & LIVE COUNTDOWN (WHEN CONFIRMED) */}
      {activeMission && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-red-500 shadow-2xl space-y-6 animate-in slide-in-from-bottom-2 duration-300">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white animate-pulse shadow-lg shadow-red-500/50">
                <Siren className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-red-400 uppercase tracking-wider">
                    {activeMission.ambulance.priority || "CODE_RED_CRITICAL"}
                  </span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                    AMBULANCE EN ROUTE TO YOUR GPS
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Mission ID: {activeMission.missionId} &bull; Destination: {activeMission.hospital}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveMission(null)}
              className="self-start sm:self-auto text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Dismiss Telemetry</span>
            </button>
          </div>

          {/* 3 Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Live Countdown */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-center flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Live Ambulance Countdown</span>
              <div className="text-4xl font-black text-red-400 font-mono my-1 tracking-tight">
                0{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{activeMission.ambulance.unit} En Route</span>
              </p>
            </div>

            {/* Reserved Hospital Bed */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block text-slate-400">Reserved Emergency Bed</span>
              <div className="font-bold text-emerald-400 text-sm">{activeMission.allocatedBed}</div>
              <div className="text-slate-300 text-[11px]">
                <span className="text-slate-500 block">Hospital Address:</span>
                {activeMission.hospitalAddress || "Road No. 12, Banjara Hills"}
              </div>
              <div className="text-[10px] text-blue-400 font-medium">
                Status: {activeMission.reservationStatus}
              </div>
            </div>

            {/* Paramedic Crew & Equipment */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Paramedic Crew &amp; Gear</span>
              <p className="text-slate-300 text-[11px]">
                {activeMission.ambulance.paramedicCrew}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {(activeMission.ambulance.equipmentReady || []).map((eq, i) => (
                  <span key={i} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    ✓ {eq}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Clinical Instructions for Patient */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold block">Patient Pre-Arrival Advisory:</span>
              <p className="text-xs text-slate-300 mt-0.5">{activeMission.advisory}</p>
            </div>

            {activeMission.hospitalPhone && (
              <a
                href={`tel:${activeMission.hospitalPhone.replace(/\s+/g, '')}`}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 shadow-md shadow-red-500/30"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {activeMission.hospital} Emergency Desk</span>
              </a>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
