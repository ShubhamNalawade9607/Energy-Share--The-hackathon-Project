// ================================================
// MAIN DASHBOARD LOGIC FOR EV USERS
// ================================================
// Demo: User dashboard with map, bookings, and green impact tracking
// Features:
// - Interactive map with charger discovery
// - Booking management (active/completed)
// - Green score and environmental impact tracking
// - Leaderboard showing top eco-friendly users
// - Auto-refresh every 30 seconds

let bookingsModal;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 User dashboard loading...');
    
    if (!Auth.requireAuth()) return;

    try {
        const user = Auth.getCurrentUser();
        console.log(`👤 Welcome ${user.name}`);
        
        // Update UI with user info
        document.getElementById('userName').textContent = user.name || user.email;
        
        // Initialize map (will work even if it fails)
        initMap();
        
        // Load initial data
        console.log('⏳ Loading dashboard data...');
        await loadChargers();          // Load and render chargers on map
        await loadLeaderboard();       // Load top users
        await updateUserProfile();     // Get user profile data
        await loadImpact();            // Load green impact stats
        await loadRecentSessions();    // Load user's recent sessions
        await loadAcceptedRequests();  // Load accepted booking requests

        console.log('✅ Dashboard fully loaded');

        // Setup event listeners
        bookingsModal = new bootstrap.Modal(document.getElementById('bookingsModal'));
        
        document.getElementById('viewBookings').addEventListener('click', (e) => {
            e.preventDefault();
            showMyBookings();
        });

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
            window.location.href = '/login.html';
        });

        // Refresh data every 30 seconds
        // Shows real-time updates as bookings change
        setInterval(() => {
            console.log('🔄 Refreshing dashboard data...');
            loadChargers();
            updateUserProfile();
            loadImpact();
        }, 30000);

    } catch (err) {
        console.error('❌ Dashboard initialization error:', err);
        // Continue anyway - app is demo-safe
    }
});

// Update user profile from API
// Shows green score in navbar
async function updateUserProfile() {
    try {
        console.log('👤 Updating profile...');
        const profile = await API.getProfile();
        
        if (profile && profile.greenScore !== undefined) {
            document.getElementById('userScore').textContent = `🌱 Score: ${profile.greenScore}`;
            console.log(`✅ Green score updated: ${profile.greenScore}`);
        }
    } catch (err) {
        console.warn('⚠️ Profile update failed (non-critical):', err);
        // Continue - not critical for demo
    }
}

// Load user impact (green score, sessions, CO2 saved)
// Displays environmental impact metrics
async function loadImpact() {
    try {
        console.log('🌱 Loading user impact...');
        const impact = await API.getUserImpact();
        
        if (!impact || impact.error) {
            console.warn('⚠️ Impact data unavailable');
            return;
        }

        const score = Math.max(0, Math.min(100, impact.greenScore || 0));
        const percent = Math.round((score / 100) * 100);

        const scoreEl = document.getElementById('greenScoreValue');
        const progressEl = document.getElementById('greenProgress');
        const percentEl = document.getElementById('greenScorePercent');
        const sessionsEl = document.getElementById('totalSessions');
        const co2El = document.getElementById('co2Saved');

        if (scoreEl) scoreEl.textContent = `🌱 ${score}`;
        if (progressEl) {
            progressEl.style.width = `${percent}%`;
            progressEl.setAttribute('aria-valuenow', percent);
        }
        if (percentEl) percentEl.textContent = `${percent}%`;
        if (sessionsEl) sessionsEl.textContent = impact.totalSessions || 0;
        if (co2El) co2El.textContent = `${(impact.estimatedCO2Saved || 0).toFixed(1)} kg`;

        console.log(`✅ Impact loaded: Score=${score}, Sessions=${impact.totalSessions}, CO2=${(impact.estimatedCO2Saved || 0).toFixed(1)}kg`);

        // Also update navbar quick score
        const profileScore = document.getElementById('userScore');
        if (profileScore) profileScore.textContent = `🌱 Score: ${score}`;
    } catch (err) {
        console.warn('⚠️ Impact load failed (showing defaults):', err);
        // Show default values - demo-safe fallback
        document.getElementById('greenScoreValue').textContent = '🌱 50';
        document.getElementById('greenProgress').style.width = '50%';
        document.getElementById('greenScorePercent').textContent = '50%';
        document.getElementById('totalSessions').textContent = '0';
        document.getElementById('co2Saved').textContent = '0 kg';
    }
}

// Load and render recent sessions (user bookings)
async function loadRecentSessions() {
    try {
        console.log('📚 Loading recent sessions...');
        const bookings = await API.getUserBookings();
        const container = document.getElementById('recentSessions');
        if (!container) return;

        if (!Array.isArray(bookings) || bookings.length === 0) {
            container.innerHTML = '<p class="text-muted">No recent sessions.</p>';
            return;
        }

        let html = '<div class="list-group">';
        bookings.slice(0,5).forEach(b => {
            const charger = b.chargerId || {};
            const start = new Date(b.startTime).toLocaleString();
            const end = b.endTime ? new Date(b.endTime).toLocaleString() : '-';
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${charger.name || 'Unknown'}</strong>
                            <div class="small text-muted">${charger.address || ''}</div>
                        </div>
                        <div class="text-end small">
                            <div>${b.status ? b.status.toUpperCase() : ''}</div>
                            <div>${start} → ${end}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('❌ Failed to load recent sessions:', err);
        const container = document.getElementById('recentSessions');
        if (container) container.innerHTML = '<p class="text-danger">Error loading sessions</p>';
    }
}

// Load accepted booking requests (requests approved by owner)
async function loadAcceptedRequests() {
    try {
        console.log('📨 Loading booking requests...');
        const requests = await BookingRequest.loadUserBookingRequests();
        const container = document.getElementById('acceptedRequests');
        if (!container) return;

        const accepted = (Array.isArray(requests) ? requests : []).filter(r => r.status === 'approved' || r.status === 'session_active' || r.status === 'session_ended');
        if (accepted.length === 0) {
            container.innerHTML = '<p class="text-muted">No accepted requests.</p>';
            return;
        }

        let html = '<div class="list-group">';
        accepted.slice(0,5).forEach(r => {
            const charger = r.chargerId || {};
            const approvedAt = r.approvedAt ? new Date(r.approvedAt).toLocaleString() : '-';
            const bookingId = r.bookingId || '';
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between">
                        <div>
                            <strong>${charger.name || 'Unknown'}</strong>
                            <div class="small text-muted">Approved: ${approvedAt}</div>
                            <div class="small text-muted">Duration: ${r.durationHours * 60} minutes</div>
                        </div>
                        <div class="text-end small">
                            <div>${BookingRequest.getStatusBadge(r.status)}</div>
                            ${bookingId ? `<div class="mt-1"><small>Booking: ${bookingId}</small></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('❌ Failed to load accepted requests:', err);
        const container = document.getElementById('acceptedRequests');
        if (container) container.innerHTML = '<p class="text-danger">Error loading accepted requests</p>';
    }
}

async function showMyBookings() {
    try {
        console.log('📋 Loading bookings and requests...');
        // Load both active bookings and pending requests
        const bookings = await API.getUserBookings();
        const requests = await BookingRequest.loadUserBookingRequests();

        // Populate active bookings tab
        let html = '';
        if (!Array.isArray(bookings) || bookings.length === 0) {
            html = '<p class="text-muted">No active bookings yet. Find and book a charger!</p>';
        } else {
            bookings.forEach(booking => {
                const charger = booking.chargerId;
                const startTime = new Date(booking.startTime);
                const endTime = booking.endTime ? new Date(booking.endTime) : null;
                const statusBadgeClass = {
                    'active': 'bg-info',
                    'completed': 'bg-success',
                    'cancelled': 'bg-danger'
                }[booking.status] || 'bg-secondary';
                html += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="mb-1">${charger && charger.name ? charger.name : 'Unknown Charger'}</h6>
                                    <small class="text-muted">${charger && charger.address ? charger.address : ''}</small>
                                </div>
                                <span class="badge ${statusBadgeClass}">${booking.status ? booking.status.toUpperCase() : ''}</span>
                            </div>
                            <div class="small text-muted">
                                <div>Start: ${startTime.toLocaleString()}</div>
                                ${endTime ? `<div>End: ${endTime.toLocaleString()}</div>` : ''}
                                <div>Duration: ${booking.durationHours || 0}h | Green Points: ${booking.greenPointsEarned || 0}</div>
                            </div>
                            ${booking.status === 'active' ? `
                                <button class="btn btn-sm btn-success mt-2" onclick="completeBooking('${booking._id}')">✅ Complete</button>
                                <button class="btn btn-sm btn-danger mt-2" onclick="cancelBooking('${booking._id}')">❌ Cancel</button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        document.getElementById('bookings-content').innerHTML = html;

        // Populate booking requests tab
        let requestsHtml = '';
        try {
            requestsHtml = BookingRequest.renderUserRequests(requests);
        } catch (e) {
            requestsHtml = '<p class="text-danger">Error loading requests</p>';
        }
        document.getElementById('requests-content').innerHTML = requestsHtml;

        if (bookingsModal) bookingsModal.show();
    } catch (err) {
        console.error('❌ Error loading bookings:', err);
        document.getElementById('bookings-content').innerHTML = '<p class="text-danger">Error loading bookings</p>';
        document.getElementById('requests-content').innerHTML = '<p class="text-danger">Error loading requests</p>';
        if (bookingsModal) bookingsModal.show();
    }
}

async function completeBooking(bookingId) {
    if (!confirm('Mark this booking as complete?')) return;

    try {
        console.log(`✅ Completing booking: ${bookingId}`);
        const result = await API.completeBooking(bookingId);
        if (!result.error) {
            console.log('✅ Booking completed successfully');
            alert('✅ Booking completed! Green points earned.');
            updateUserProfile();
            showMyBookings();
            loadChargers();
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (err) {
        console.error('❌ Failed to complete booking:', err);
        alert('❌ Failed to complete booking: ' + (err.message || 'Please try again'));
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Cancel this booking? Slot will be freed up.')) return;
    
    try {
        console.log(`❌ Cancelling booking: ${bookingId}`);
        const result = await API.cancelBooking(bookingId);
        if (!result.error) {
            console.log('✅ Booking cancelled successfully');
            alert('✅ Booking cancelled. Slot is now available for others.');
            updateUserProfile();
            showMyBookings();
            loadChargers();
        } else {
            throw new Error(result.error || 'Unknown error');
        }
    } catch (err) {
        console.error('❌ Failed to cancel booking:', err);
        alert('❌ Failed to cancel booking: ' + (err.message || 'Please try again'));
    }
}
