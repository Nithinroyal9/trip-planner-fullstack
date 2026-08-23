const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const destinationData = {
  goa: {
    morning: ['Baga Beach walk & water sports', 'Explore Fort Aguada & historic lighthouse', 'Dolphin watching cruise at Sinquerim'],
    afternoon: ['Visit Basilica of Bom Jesus in Old Goa', 'Sahakari Spice Plantation tour & Goan lunch', 'Stroll through colorful Fontainhas Latin Quarter'],
    evening: ['Sunset at Chapora Fort', 'Beach shack candlelight dinner with live music', 'Evening casino or river cruise on Mandovi']
  },
  manali: {
    morning: ['Scenic drive up to Solang Valley', 'Visit ancient Hadimba Devi Temple', 'Jogini Waterfall morning trek'],
    afternoon: ['Paragliding and ATV ride in Solang', 'Stroll through Old Manali cafes', 'Visit Vashisht hot water springs'],
    evening: ['Walk along Mall Road for souvenirs', 'Riverside bonfire and dinner', 'Cafe hopping in Old Manali']
  },
  jaipur: {
    morning: ['Visit grand Amer Fort with elephant/jeep ride', 'Photo stop at Jal Mahal', 'Explore royal City Palace complex'],
    afternoon: ['Visit Jantar Mantar astronomical observatory', 'Shopping for handicrafts in Johari Bazaar', 'Traditional Rajasthani Thali lunch'],
    evening: ['Sunset view from Nahargarh Fort', 'Sound & light show at Amer Fort', 'Chokhi Dhani cultural village experience']
  },
  kerala: {
    morning: ['Scenic drive through Munnar tea plantations', 'Visit Mattupetty Dam & Echo Point', 'Bamboo rafting in Periyar Lake'],
    afternoon: ['Check-in to traditional Alleppey Houseboat', 'Cruise through paddy fields & narrow canals', 'Authentic Karimeen fish meal'],
    evening: ['Watch Kathakali & Kalaripayattu performance', 'Sunset over Marari Beach', 'Traditional Ayurvedic massage']
  },
  varanasi: {
    morning: ['Sunrise boat ride on the sacred River Ganges', 'Walk through historic ghats (Assi to Manikarnika)', 'Visit Kashi Vishwanath Temple corridor'],
    afternoon: ['Day excursion to Sarnath Buddhist complex', 'Banarasi Silk saree weaving workshop tour', 'Taste authentic Banarasi Kachori & Paan'],
    evening: ['Witness grand evening Ganga Aarti at Dashashwamedh Ghat', 'Sunset boat cruise', 'Stroll through the heritage alleys']
  },
  agra: {
    morning: ['Sunrise tour of the iconic Taj Mahal', 'Explore Agra Fort and Mughal royal quarters', 'Visit Itmad-ud-Daulah (Baby Taj)'],
    afternoon: ['Excursion to Fatehpur Sikri heritage city', 'Shop for authentic marble inlay work & Agra Petha', 'Mughlai dining experience'],
    evening: ['Sunset view of Taj Mahal from Mehtab Bagh across Yamuna', 'Walk through Sadar Bazaar', 'Rooftop dinner overlooking monuments']
  },
  ladakh: {
    morning: ['Visit Thiksey Monastery during morning prayers', 'Drive across Khardung La pass', 'Visit Hall of Fame & Shanti Stupa'],
    afternoon: ['Explore Hemis Monastery & museum', 'Camp arrival at clear blue Pangong Lake', 'Nubra Valley sand dunes & Bactrian camel ride'],
    evening: ['Stargazing under clear Himalayan skies', 'Campfire at Pangong Lake', 'Tibetan butter tea and momos in Leh market']
  },
  udaipur: {
    morning: ['Explore magnificent Udaipur City Palace', 'Visit Jagdish Temple & Saheliyon-ki-Bari', 'Morning walk around Fateh Sagar Lake'],
    afternoon: ['Boat ride on Lake Pichola to Jag Mandir', 'Vintage Car Museum tour', 'Rajasthani Mewari lunch at rooftop restaurant'],
    evening: ['Sunset from Sajjangarh (Monsoon Palace)', 'Dharohar folk dance show at Bagore Ki Haveli', 'Lakeside dinner at Ambrai Ghat']
  },
  rishikesh: {
    morning: ['White water river rafting in the Ganges', 'Visit iconic Laxman Jhula & Ram Jhula', 'Morning riverside yoga and meditation session'],
    afternoon: ['Explore the historic Beatles Ashram (Chaurasi Kutia)', 'Bungee jumping & giant swing in Mohan Chatti', 'Organic cafe dining in Tapovan'],
    evening: ['Attend peaceful Triveni Ghat evening Ganga Aarti', 'Campfire dinner by the riverside camps', 'Night walk along the suspension bridges']
  },
  darjeeling: {
    morning: ['Early sunrise view over Mt. Kanchenjunga from Tiger Hill', 'Ride the UNESCO Heritage Darjeeling Toy Train', 'Visit Ghoom Monastery'],
    afternoon: ['Guided walk through Happy Valley Tea Estate', 'Visit Himalayan Mountaineering Institute & Zoo', 'Taste Darjeeling black tea & momos'],
    evening: ['Sunset stroll along Chowrasta Mall Road', 'Dinner at historic Glenary\'s Bakery & Pub', 'Shop for woolen garments & tea packets']
  },
  default: {
    morning: ['Explore landmark attractions & historical quarters', 'Guided morning heritage walk'],
    afternoon: ['Local museum tour & regional culinary tasting', 'Shopping in traditional markets'],
    evening: ['Sunset viewpoint visit', 'Authentic dinner at a top-rated restaurant']
  }
};

let tripsList = [];

// Endpoint: Generate itinerary
app.post('/api/plan-trip', (req, res) => {
  const { destination, duration, budget, tripType, travelGuide } = req.body;

  const destKey = destination ? destination.toLowerCase().trim() : 'default';
  const pool = destinationData[destKey] || destinationData.default;

  const days = [];
  for (let i = 1; i <= duration; i++) {
    const morningAct = pool.morning[(i - 1) % pool.morning.length];
    const afternoonAct = pool.afternoon[(i - 1) % pool.afternoon.length];
    const eveningAct = pool.evening[(i - 1) % pool.evening.length];

    days.push({
      day: i,
      title: `Day ${i} in ${destination}`,
      items: [
        `Morning: ${morningAct}`,
        `Afternoon: ${afternoonAct}`,
        `Evening: ${eveningAct}`
      ]
    });
  }

  const breakdown = {
    stay: Math.round(budget * 0.45),
    activities: Math.round(budget * 0.35),
    transport: Math.round(budget * 0.20)
  };

  res.json({ destination, duration, guide: travelGuide, itinerary: days, breakdown });
});

// Endpoint: Get all trips
app.get('/api/trips', (req, res) => {
  res.json(tripsList);
});

// Endpoint: Save a trip
app.post('/api/trips', (req, res) => {
  const { title, guide, duration, budget } = req.body;
  const newTrip = { 
    id: Date.now(), 
    title, 
    guide: guide || 'Unassigned', 
    duration, 
    budget 
  };
  tripsList.unshift(newTrip);
  res.status(201).json(newTrip);
});

// Endpoint: Clear all trips
app.delete('/api/trips', (req, res) => {
  tripsList = [];
  res.json({ message: 'All saved trips cleared' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});