// ============================================
// MAP INITIALIZATION & CHARGER MANAGEMENT
// ============================================
// Demo: Interactive map showing EV charging stations
// Users can book chargers directly from markers or sidebar list

let map;
let chargers = [];
let markers = [];
let selectedCharger = null;
let chargerModal;

// Get charger status based on availability
// Returns: 'available' (green), 'limited' (yellow), or 'busy' (red)
function getChargerStatus(charger) {
    if (charger.availableSlots === 0) {
        return 'busy';           // 🔴 No slots
    } else if (charger.availableSlots < Math.ceil(charger.totalSlots * 0.3)) {
        return 'limited';        // 🟡 Less than 30% slots
    } else {
        return 'available';      // 🟢 Good availability
    }
}

// Get marker color based on status
// Maps status to hex colors for visual clarity
function getMarkerColor(status) {
    switch(status) {
        case 'available': return '#2ecc71'; // Green
        case 'limited': return '#f39c12';   // Yellow/Orange
        case 'busy': return '#e74c3c';      // Red
        default: return '#95a5a6';          // Gray
    }
}

// Create custom SVG marker icon
// Uses base64 encoding for crisp rendering at any zoom level
function createMarkerIcon(status) {
    const color = getMarkerColor(status);
    
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 41" width="32" height="41">
            <path d="M16 1C8.3 1 2 7.3 2 15c0 7 8 21 14 27.6 6-6.6 14-20.6 14-27.6 0-7.7-6.3-14-13.9-14z" 
                  fill="${color}" stroke="white" stroke-width="1.5"/>
            <circle cx="16" cy="15" r="7" fill="white" opacity="0.3"/>
        </svg>
    `;
    
    return L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
        iconSize: [32, 41],
        iconAnchor: [16, 41],
        popupAnchor: [0, -41],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [13, 41]
    });
}

// Initialize map
// Sets up Leaflet map centered on London with OpenStreetMap tiles
function initMap() {
    console.log('🗺️ Initializing map');
    
    if (!document.getElementById('map')) {
        console.warn('⚠️ Map container not found');
        return;
    }
    
    try {
        // Ensure map container has proper dimensions
        const mapContainer = document.getElementById('map');
        console.log(`📐 Map container dimensions: ${mapContainer.offsetWidth}x${mapContainer.offsetHeight}`);
        
        map = L.map('map').setView([51.505, -0.09], 13);
        console.log('✅ Leaflet map created');
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 3
        }).addTo(map);
        console.log('✅ Tiles loaded');

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const modalEl = document.getElementById('chargerModal');
        if (modalEl) {
            chargerModal = new bootstrap.Modal(modalEl);
        }

        // Invalidate map size after rendering
        // Try multiple times to ensure it renders
        setTimeout(() => {
            if (map) {
                map.invalidateSize(false);
                console.log('🔄 Map size invalidated (attempt 1)');
            }
        }, 50);
        
        setTimeout(() => {
            if (map) {
                map.invalidateSize(false);
                console.log('🔄 Map size invalidated (attempt 2)');
            }
        }, 200);

        // Handle window resize
        window.addEventListener('resize', () => {
            if (map) map.invalidateSize(false);
        });

        console.log('✅ Map initialized successfully');
    } catch (err) {
        console.error('❌ Failed to initialize map:', err);
        console.error('Error details:', err.message, err.stack);
        alert('⚠️ Map failed to load. Please refresh the page.');
    }
}

// Load chargers from API
// Falls back to demo data if API fails
async function loadChargers() {
    console.log('📍 Loading chargers...');
    
    try {
        const data = await API.getAllChargers();
        console.log('📨 Chargers response:', data);
        
        if (!Array.isArray(data)) {
            console.warn('⚠️ Invalid chargers response, using empty array');
            chargers = [];
        } else {
            chargers = data;
            console.log(`✅ Loaded ${chargers.length} chargers`);
        }
        
        renderChargersOnMap();
        renderChargersList();
    } catch (err) {
        console.error('❌ Error loading chargers:', err);
        chargers = [];
        // Still render UI even if loading fails
        renderChargersOnMap();
        renderChargersList();
    }
}


// Render chargers on map
function renderChargersOnMap() {
    if (!map) {
        console.warn('⚠️ Map not initialized yet');
        return;
    }
    
    console.log(`🗺️ Rendering ${chargers.length} chargers on map`);
    
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    chargers.forEach(charger => {
        const status = getChargerStatus(charger);
        const icon = createMarkerIcon(status);
        const popupContent = createMarkerPopup(charger, status);
        
        const marker = L.marker([charger.latitude, charger.longitude], { icon })
            .addTo(map)
            .bindPopup(popupContent, { 
                maxWidth: 300,
                className: 'charger-popup'
            })
            .on('click', () => {
                selectedCharger = charger;
            });
        
        markers.push(marker);
        console.log(`📍 Added marker for: ${charger.name}`);
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        const bounds = group.getBounds();
        console.log(`📍 Fitting bounds for ${markers.length} markers`);
        map.fitBounds(bounds.pad(0.1), { maxZoom: 15 });
    } else {
        console.warn('⚠️ No chargers to display on map');
        // Center map on London
        if (map) {
            map.setView([51.505, -0.09], 13);
        }
    }
}

// Create popup HTML for marker
function createMarkerPopup(charger, status) {
    const statusBadgeClass = {
        'available': 'bg-success',
        'limited': 'bg-warning',
        'busy': 'bg-danger'
    }[status];

    const statusLabel = {
        'available': '✅ Available',
        'limited': '⚠️ Limited',
        'busy': '❌ Busy'
    }[status];

    const user = Auth.getCurrentUser();
    const isUser = user && user.role === 'user';

    let bookingButton = '';
    if (isUser && charger.availableSlots > 0) {
        bookingButton = `
            <button class="btn btn-sm btn-success w-100 mt-2" 
                    onclick="selectAndShowBooking('${charger._id}')"
                    style="font-size: 0.85rem;">
                📅 Book Slot
            </button>
        `;
    } else if (isUser && charger.availableSlots === 0) {
        bookingButton = `<p class="alert alert-danger mb-0 mt-2 p-2">❌ No available slots</p>`;
    }

    return `
        <div class="charger-popup-content" style="font-size: 0.9rem;">
            <div style="min-width: 240px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
                    <strong style="font-size: 1rem;">${escapeHtml(charger.name)}</strong>
                    <span class="badge ${statusBadgeClass}" style="white-space: nowrap; font-size: 0.75rem;">${statusLabel}</span>
                </div>
                
                <div style="border-top: 1px solid #e9ecef; padding-top: 8px;">
                    ${charger.address ? `<div style="margin-bottom: 6px;"><small style="color: #666;">📍 ${escapeHtml(charger.address)}</small></div>` : ''}
                    <div style="margin-bottom: 6px;"><small style="color: #666;">⚡ ${charger.chargerType}</small></div>
                    <div style="margin-bottom: 8px;"><small style="color: #666;">Slots: <strong>${charger.availableSlots}</strong> / ${charger.totalSlots}</small></div>
                    ${charger.rating ? `<div style="margin-bottom: 8px;"><small style="color: #666;">⭐ ${charger.rating.toFixed(1)} / 5.0</small></div>` : ''}
                    ${charger.description ? `<div style="margin-bottom: 8px; color: #666;"><small>${escapeHtml(charger.description)}</small></div>` : ''}
                </div>
                
                ${bookingButton}
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Render chargers in sidebar list
function renderChargersList() {
    const container = document.getElementById('chargersList');
    if (!container) return;

    let html = '';
    chargers.slice(0, 10).forEach(charger => {
        const status = getChargerStatus(charger);
        const statusClass = {
            'available': 'border-success',
            'limited': 'border-warning',
            'busy': 'border-danger'
        }[status];
        
        const statusText = {
            'available': '✅ Available',
            'limited': '⚠️ Limited',
            'busy': '❌ Busy'
        }[status];
        
        html += `
            <div class="card mb-2 ${statusClass} border-2 cursor-pointer" 
                 onclick="showChargerDetail(${JSON.stringify(charger).replace(/"/g, '&quot;')})">
                <div class="card-body p-3">
                    <h6 class="mb-1">${escapeHtml(charger.name)}</h6>
                    <small class="text-muted d-block">📍 ${escapeHtml(charger.address || 'No address')}</small>
                    <small class="text-muted d-block">⚡ ${charger.chargerType}</small>
                    <div class="mt-2 d-flex justify-content-between">
                        <small><strong>${charger.availableSlots}/${charger.totalSlots}</strong> slots</small>
                        <span class="badge ${statusClass.replace('border-', 'bg-')}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p class="text-muted">No chargers available</p>';
}

// Show charger details in modal
function showChargerDetail(charger) {
    selectedCharger = charger;
    const status = getChargerStatus(charger);
    
    document.getElementById('chargerModalTitle').textContent = charger.name;
    
    const statusBadgeClass = {
        'available': 'bg-success',
        'limited': 'bg-warning',
        'busy': 'bg-danger'
    }[status];

    const statusLabel = {
        'available': '✅ Available',
        'limited': '⚠️ Limited',
        'busy': '❌ Busy'
    }[status];

    let html = `
        <div class="row mb-3">
            <div class="col-6">
                <small class="text-muted d-block">Type</small>
                <strong>${charger.chargerType}</strong>
            </div>
            <div class="col-6">
                <small class="text-muted d-block">Available Slots</small>
                <strong>${charger.availableSlots}/${charger.totalSlots}</strong>
            </div>
        </div>
        <div class="mb-3">
            <span class="badge ${statusBadgeClass}">${statusLabel}</span>
        </div>
        <hr>
        <p><strong>📍 Address:</strong> ${escapeHtml(charger.address || 'N/A')}</p>
        <p><strong>⭐ Rating:</strong> ${charger.rating ? charger.rating.toFixed(1) : 'N/A'} / 5.0</p>
        ${charger.description ? `<p><strong>Description:</strong> ${escapeHtml(charger.description)}</p>` : ''}
    `;

    document.getElementById('chargerModalBody').innerHTML = html;
    
    const bookBtn = document.getElementById('bookChargerBtn');
    bookBtn.disabled = charger.availableSlots === 0;
    bookBtn.textContent = charger.availableSlots > 0 ? '✅ Book Now' : '❌ No Slots Available';
    bookBtn.onclick = () => handleBooking();

    if (chargerModal) {
        chargerModal.show();
    }
}

// Select charger from map popup and show booking
function selectAndShowBooking(chargerId) {
    const charger = chargers.find(c => c._id === chargerId);
    if (charger) {
        showChargerDetail(charger);
    }
}

// Handle booking from modal
async function handleBooking() {
    if (!selectedCharger) return;

    const bookDurationModal = new bootstrap.Modal(document.getElementById('bookDurationModal'));
    bookDurationModal.show();
}

// Confirm booking with selected duration (in minutes)
// Now gives users choice between direct booking or booking request
async function confirmBooking(minutes) {
    if (!selectedCharger) return;

    const bookDurationModal = bootstrap.Modal.getInstance(document.getElementById('bookDurationModal'));
    if (bookDurationModal) bookDurationModal.hide();

    const durationHours = minutes / 60;
    const startTime = new Date();

    // Always create a booking request (owner approval required)
    try {
        console.log('📋 Creating booking request...');
        const success = await BookingRequest.sendBookingRequest(
            selectedCharger._id,
            startTime.toISOString(),
            durationHours
        );

        if (success) {
            alert('✅ Booking request sent! Your request will appear in Pending Booking Requests until approved by the owner.');
            if (chargerModal) chargerModal.hide();
            loadChargers();
            updateUserProfile();
        }
    } catch (err) {
        alert('❌ Booking error: ' + err.message);
    }
}

// Load leaderboard
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;

    const data = await API.getLeaderboard();
    const leaders = Array.isArray(data) ? data : [];
    
    let html = '';
    if (leaders.length === 0) {
        html = '<p class="text-muted">No users yet</p>';
    } else {
        leaders.forEach((user, idx) => {
            const medalIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
            html += `
                <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                        <span class="fw-bold">${medalIcon} ${escapeHtml(user.name)}</span>
                        <br>
                        <small class="text-muted">${user.totalChargingTime} hrs charged</small>
                    </div>
                    <span class="badge bg-success">🌱 ${user.greenScore}</span>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}
