let currentTrip = null;

const indianDestinations = [
  { 
    name: 'Goa', 
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', 
    desc: 'Sun-kissed beaches, Portuguese architecture, vibrant shacks, and water sports.' 
  },
  { 
    name: 'Manali', 
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', 
    desc: 'Snowy peaks, Solang Valley adventures, Rohtang Pass, and apple orchards.' 
  },
  { 
    name: 'Jaipur', 
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80', 
    desc: 'The Pink City with royal palaces like Hawa Mahal, Amer Fort, and local bazaars.' 
  },
  { 
    name: 'Kerala', 
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', 
    desc: 'Serene Alleppey backwaters, houseboats, tea gardens in Munnar, and Ayurveda.' 
  },
  { 
    name: 'Varanasi', 
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80', 
    desc: 'Ancient spiritual capital, sacred Dashashwamedh Ghats, and evening Ganga Aarti.' 
  },
  { 
    name: 'Agra', 
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80', 
    desc: 'Home of the timeless Taj Mahal, Agra Fort, and grand Mughal heritage monuments.' 
  },
  { 
    name: 'Ladakh', 
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80', 
    desc: 'High-altitude desert, Pangong Lake, Khardung La pass, and Buddhist monasteries.' 
  },
  { 
    name: 'Udaipur', 
    image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80', 
    desc: 'City of Lakes, featuring scenic boat rides on Lake Pichola and the City Palace.' 
  },
  { 
    name: 'Rishikesh', 
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', 
    desc: 'Yoga capital of the world, white water river rafting, and scenic cliff jumping.' 
  },
  { 
    name: 'Darjeeling', 
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80', 
    desc: 'Lush green tea estates, Himalayan Toy Train, and sunrise views of Kanchenjunga.' 
  }
];

window.addEventListener('DOMContentLoaded', () => {
  renderExploreDestinations();
  fetchAllTrips();
});

function renderExploreDestinations() {
  const container = document.getElementById('destinationsList');
  if (!container) return;
  container.innerHTML = '';

  indianDestinations.forEach((dest) => {
    const card = document.createElement('div');
    card.className = 'card dest-card';
    card.innerHTML = `
      <img src="${dest.image}" alt="${dest.name}" class="card-img" />
      <h3>${dest.name}</h3>
      <p>${dest.desc}</p>
      <button class="btn-outline" onclick="selectAndPlanDestination('${dest.name}')">Plan This Destination</button>
    `;
    container.appendChild(card);
  });
}

window.selectAndPlanDestination = function (destName) {
  const selectDropdown = document.getElementById('destination');
  if (selectDropdown) selectDropdown.value = destName;
  document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
  showToast(`Selected ${destName}. Ready to generate!`);
};

// Drawer controls
const menuToggle = document.getElementById('menuToggle');
const closeDrawer = document.getElementById('closeDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const sidebarDrawer = document.getElementById('sidebarDrawer');

function openMenu() {
  sidebarDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
}

function closeMenu() {
  sidebarDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
}

menuToggle.addEventListener('click', openMenu);
closeDrawer.addEventListener('click', closeMenu);
drawerOverlay.addEventListener('click', closeMenu);

// Trip generation
document.getElementById('tripForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const destination = document.getElementById('destination').value.trim();
  const duration = parseInt(document.getElementById('duration').value, 10);
  const budget = parseFloat(document.getElementById('budget').value);
  const tripType = document.getElementById('tripType').value;
  
  // Directly extract selected guide
  const guideSelect = document.getElementById('travelGuide');
  const travelGuide = guideSelect.options[guideSelect.selectedIndex].value;

  if (!destination || isNaN(duration) || isNaN(budget) || !travelGuide) {
    alert('Please select a destination and travel guide.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination, duration, budget, tripType, travelGuide })
    });

    if (!response.ok) throw new Error('Failed to generate trip');

    const data = await response.json();

    // Store complete trip object with guaranteed guide string
    currentTrip = {
      title: `${data.destination} Trip`,
      guide: travelGuide,
      duration: data.duration,
      budget: budget
    };

    renderItinerary(data.itinerary, travelGuide);
    updateBudgetBreakdown(data.breakdown);

    document.getElementById('tripActionButtons').classList.remove('hidden');
    document.getElementById('statusBadge').innerText = `${data.duration}-Day Plan Ready`;
    showToast(`Itinerary with Guide ${travelGuide} generated!`);

  } catch (error) {
    console.error('Error connecting to backend:', error);
    showToast('Backend offline. Make sure node server is running.');
  }
});

// Save Trip Listener (Guarantees guide payload is sent)
document.getElementById('saveTripBtn').addEventListener('click', async () => {
  if (!currentTrip) return;

  const guideSelect = document.getElementById('travelGuide');
  const selectedGuide = currentTrip.guide || guideSelect.value;

  const payload = {
    title: currentTrip.title,
    guide: selectedGuide,
    duration: currentTrip.duration,
    budget: currentTrip.budget
  };

  try {
    const response = await fetch('http://localhost:5000/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Could not save trip');

    showToast('Trip saved to vault!');
    await fetchAllTrips();
    openMenu();
  } catch (err) {
    console.error(err);
    showToast('Failed to save trip on server.');
  }
});

// Clear All Trips Listener
const clearTripsBtn = document.getElementById('clearTripsBtn');
if (clearTripsBtn) {
  clearTripsBtn.addEventListener('click', async () => {
    try {
      await fetch('http://localhost:5000/api/trips', { method: 'DELETE' });
      await fetchAllTrips();
      showToast('All saved trips cleared.');
    } catch (err) {
      console.error(err);
    }
  });
}

async function fetchAllTrips() {
  try {
    const res = await fetch('http://localhost:5000/api/trips');
    if (!res.ok) return;

    const trips = await res.json();
    renderTripsDrawer(trips);
  } catch (err) {
    console.error('Could not fetch trips:', err);
  }
}

function renderTripsDrawer(trips) {
  const savedContainer = document.getElementById('savedTripsList');
  savedContainer.innerHTML = '';

  if (!trips || trips.length === 0) {
    savedContainer.innerHTML = '<span style="font-size:0.85rem; color:#64748b;">No saved trips yet.</span>';
    return;
  }

  trips.forEach(trip => {
    const div = document.createElement('div');
    div.className = 'trip-item';
    
    // Fallback protection so "undefined" never renders on UI
    const displayGuide = trip.guide && trip.guide !== 'undefined' ? trip.guide : 'SAI NAGARJUNA';

    div.innerHTML = `
      <strong>${trip.title}</strong>
      <span>Guide: <b style="color: #2563eb;">${displayGuide}</b></span>
      <span>${trip.duration} Days • ₹${trip.budget}</span>
    `;
    savedContainer.appendChild(div);
  });
}

function renderItinerary(days, guideName) {
  const container = document.getElementById('itineraryContent');
  container.innerHTML = '';

  const guideBanner = document.createElement('div');
  guideBanner.className = 'guide-banner';
  guideBanner.innerHTML = `<p>🧭 <strong>Assigned Guide:</strong> ${guideName} (Verified Local Expert)</p>`;
  container.appendChild(guideBanner);

  days.forEach((dayPlan) => {
    const card = document.createElement('div');
    card.className = 'day-card';

    const dayTitle = document.createElement('h4');
    dayTitle.innerText = dayPlan.title;

    const list = document.createElement('ul');
    dayPlan.items.forEach((item) => {
      const li = document.createElement('li');
      li.innerText = item;
      list.appendChild(li);
    });

    card.appendChild(dayTitle);
    card.appendChild(list);
    container.appendChild(card);
  });
}

function updateBudgetBreakdown(breakdown) {
  document.getElementById('stayCost').innerText = `₹${breakdown.stay}`;
  document.getElementById('activityCost').innerText = `₹${breakdown.activities}`;
  document.getElementById('transportCost').innerText = `₹${breakdown.transport}`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}