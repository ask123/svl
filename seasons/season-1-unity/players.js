/* ============================================================
   Volleyball Premier League — Season 1 · UNITY
   Player pool + team definitions.

   HOW TEAM ASSIGNMENT WORKS
   -------------------------
   Each player starts with team:null (unsold). During the auction,
   open auction.html and assign players to teams — assignments are
   saved in your browser (localStorage) and can be exported to a
   JSON file. To publish the final rosters, click "Export results"
   in the auction console and paste the contents into results.js
   (or just keep them in localStorage on the device you present from).

   The players & teams page (index.html) automatically merges any
   saved assignments on top of this base data.
   ============================================================ */

const SEASON = {
  id: 'season-1-unity',
  name: 'Season 1',
  theme: 'UNITY',
  title: 'Volleyball Premier League',
  short: 'VPL',
  tagline: 'Inspired by powerful animals from Australia & India — power, speed, energy, courage and teamwork.',
  /* ---- Auction economics (edit here to change the rules everywhere) ---- */
  budget: 100000,        // $ per team (owner is part of the team, drawn by chit)
  baseSpiker: 15000,     // starting price for spikers
  baseOther: 5000,       // starting price for everyone else
  minIncrement: 1000,    // minimum bid raise
  squadTarget: 8,        // players per team incl. owner (teams end 8/8/8/7/7 with 38)
};

/* Who is a "spiker" (gets the higher base price): Outside Hitter or Opposite. */
function isSpiker(p) {
  return p.positions.some(x => x === 'Outside Hitter' || x === 'Opposite / Right Side');
}
function basePrice(p) {
  return isSpiker(p) ? SEASON.baseSpiker : SEASON.baseOther;
}

/* The first letters spell U-N-I-T-Y */
const TEAMS = [
  {
    id: 'ultra-eagles',
    letter: 'U',
    name: 'Ultra Eagles',
    animal: '🦅',
    logo: 'assets/ultra-eagles.jpeg',
    primary: '#1B2A5B',   // navy
    accent:  '#C9A24B',   // gold
    ink: '#ffffff',
  },
  {
    id: 'nitro-kangaroos',
    letter: 'N',
    name: 'Nitro Kangaroos',
    animal: '🦘',
    logo: 'assets/nitro-kangaroos.jpeg',
    primary: '#1F5C3D',   // forest green
    accent:  '#E8C86A',   // gold
    ink: '#ffffff',
  },
  {
    id: 'ignite-emus',
    letter: 'I',
    name: 'Ignite Emus',
    animal: '🪶',
    logo: 'assets/ignite-emus.jpeg',
    primary: '#3F4045',   // charcoal grey
    accent:  '#8C2B3A',   // maroon
    ink: '#ffffff',
  },
  {
    id: 'thunder-tigers',
    letter: 'T',
    name: 'Thunder Tigers',
    animal: '🐅',
    logo: 'assets/thunder-tigers.jpeg',
    primary: '#141414',   // black
    accent:  '#F2841C',   // orange
    ink: '#ffffff',
  },
  {
    id: 'young-yaks',
    letter: 'Y',
    name: 'Young Yaks',
    animal: '🐂',
    logo: 'assets/young-yaks.jpeg',
    primary: '#5B3A8C',   // purple
    accent:  '#2FB3A8',   // teal
    ink: '#ffffff',
  },
];

/* Position short labels for compact badges */
const POSITIONS = {
  'Setter': 'S',
  'Outside Hitter': 'OH',
  'Opposite / Right Side': 'OPP',
  'Middle Blocker': 'MB',
  'Libero': 'L',
  'Defensive Specialist': 'DS',
};

/* 38 registered players (Season 1 pool). team:null until assigned in the auction. */
const PLAYERS = [
  { id: 'p01', name: 'Gopikrishna Mallampati', age: '30-40', gender: 'Male', positions: ['Outside Hitter', 'Opposite / Right Side', 'Middle Blocker'], fee: 30, team: null },
  { id: 'p02', name: 'Vamsi Krishna Madasu', age: '20-30', gender: 'Male', positions: ['Setter', 'Outside Hitter', 'Opposite / Right Side'], fee: 30, team: null },
  { id: 'p03', name: 'Gowthami Yalamanchili', age: '30-40', gender: 'Female', positions: ['Setter', 'Libero', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p04', name: 'Amith', age: '40+', gender: 'Male', positions: ['Setter', 'Opposite / Right Side'], fee: 50, team: null },
  { id: 'p05', name: 'Taranjeet Singh', age: '30-40', gender: 'Male', positions: ['Setter', 'Middle Blocker', 'Libero'], fee: 30, team: null },
  { id: 'p06', name: 'Naveen', age: '30-40', gender: 'Male', positions: ['Outside Hitter', 'Opposite / Right Side'], fee: 30, team: null },
  { id: 'p07', name: 'Sahil Kumar', age: '20-30', gender: 'Male', positions: ['Opposite / Right Side'], fee: 30, team: null },
  { id: 'p08', name: 'Shiva Shankar Reddy Samula', age: '40+', gender: 'Male', positions: ['Outside Hitter', 'Middle Blocker'], fee: 50, team: null },
  { id: 'p09', name: 'Sree Harsha', age: '40+', gender: 'Male', positions: ['Outside Hitter', 'Middle Blocker', 'Defensive Specialist'], fee: 30, team: null },
  { id: 'p10', name: 'Raghuveer Doddi', age: '30-40', gender: 'Male', positions: ['Defensive Specialist'], fee: 50, team: null },
  { id: 'p11', name: 'Vasudeva Ashish Gali', age: '30-40', gender: 'Male', positions: ['Setter', 'Libero', 'Defensive Specialist'], fee: 30, team: null },
  { id: 'p12', name: 'Jaipal Reddy Thumkunta', age: '40+', gender: 'Male', positions: ['Defensive Specialist'], fee: 50, team: null },
  { id: 'p13', name: 'Solairajan R', age: '30-40', gender: 'Male', positions: ['Outside Hitter'], fee: 50, team: null },
  { id: 'p14', name: 'Appu G', age: '40+', gender: 'Male', positions: ['Defensive Specialist'], fee: 30, team: null },
  { id: 'p15', name: 'Ravi Varma Penmatsa', age: '20-30', gender: 'Male', positions: ['Opposite / Right Side', 'Middle Blocker', 'Libero'], fee: 50, team: null },
  { id: 'p16', name: 'Vijay Veerapaneni', age: '40+', gender: 'Male', positions: ['Setter'], fee: 50, team: null },
  { id: 'p17', name: 'Nitin Narang', age: '30-40', gender: 'Male', positions: ['Setter', 'Middle Blocker', 'Libero'], fee: 30, team: null },
  { id: 'p18', name: 'Venkata Avinash Varma Kakarlapudi', age: '30-40', gender: 'Male', positions: ['Setter', 'Libero', 'Defensive Specialist'], fee: 30, team: null },
  { id: 'p19', name: 'Ramesh Baggam', age: '40+', gender: 'Male', positions: ['Setter'], fee: 50, team: null },
  { id: 'p20', name: 'Sunil Bairu', age: '40+', gender: 'Male', positions: ['Libero', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p21', name: 'Ananth Rakesh Palaka', age: '40+', gender: 'Male', positions: ['Setter', 'Opposite / Right Side', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p22', name: 'Sai Ram Kumar Ganta', age: '30-40', gender: 'Male', positions: ['Setter'], fee: 50, team: null },
  { id: 'p23', name: 'Raj Gunnam', age: '40+', gender: 'Male', positions: ['Setter', 'Outside Hitter', 'Middle Blocker'], fee: 50, team: null },
  { id: 'p24', name: 'Vijaya Kumar Thorati', age: '40+', gender: 'Male', positions: ['Setter'], fee: 30, team: null },
  { id: 'p25', name: 'Sandeep Kollu', age: '40+', gender: 'Male', positions: ['Outside Hitter'], fee: 50, team: null },
  { id: 'p26', name: 'Ravi Ankam', age: '40+', gender: 'Male', positions: ['Defensive Specialist'], fee: 30, team: null },
  { id: 'p27', name: 'Sohini Gady', age: '20-30', gender: 'Female', positions: ['Middle Blocker', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p28', name: 'Venkat Adusumalli', age: '30-40', gender: 'Male', positions: ['Defensive Specialist'], fee: 30, team: null },
  { id: 'p29', name: 'Virat Dadi', age: '10-20', gender: 'Male', positions: ['Libero'], fee: 50, team: null },
  { id: 'p30', name: 'Kiran Dadi', age: '40+', gender: 'Male', positions: ['Libero', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p31', name: 'Hrishikesh Enakolu', age: '20-30', gender: 'Male', positions: ['Outside Hitter'], fee: 50, team: null },
  { id: 'p32', name: 'Kasi', age: '30-40', gender: 'Male', positions: ['Opposite / Right Side'], fee: 50, team: null },
  { id: 'p33', name: 'Kasi (Son)', age: '30-40', gender: 'Male', positions: ['Setter'], fee: 50, team: null },
  { id: 'p34', name: 'Swamy Thota', age: '30-40', gender: 'Male', positions: ['Outside Hitter', 'Opposite / Right Side', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p35', name: 'Avinash Vajji', age: '30-40', gender: 'Male', positions: ['Setter', 'Libero', 'Defensive Specialist'], fee: 50, team: null },
  { id: 'p36', name: 'Dhruvan Obineedi', age: '10-20', gender: 'Male', positions: ['Outside Hitter'], fee: 30, team: null },
  { id: 'p37', name: 'Raghu Obineedi', age: '40+', gender: 'Male', positions: ['Setter'], fee: 30, team: null },
  { id: 'p38', name: 'Sravan Alluri', age: '30-40', gender: 'Male', positions: ['Defensive Specialist'], fee: null, team: null },
];

/* ------------------------------------------------------------
   Shared helpers used by both the public page and the auction.
   Assignments live in localStorage keyed by season id.
   ------------------------------------------------------------ */
const STORE_KEY = 'vpl-' + SEASON.id + '-assignments';

function loadAssignments() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveAssignments(map) {
  localStorage.setItem(STORE_KEY, JSON.stringify(map));
}

/* Returns a fresh copy of PLAYERS with saved team assignments merged in.
   Priority: saved localStorage  >  RESULTS (published results.js, optional)  >  base null. */
function getPlayers() {
  const saved = loadAssignments();
  const published = (typeof RESULTS !== 'undefined' && RESULTS) ? RESULTS : {};
  return PLAYERS.map(p => {
    const a = saved[p.id] || published[p.id] || {};
    return Object.assign({}, p, {
      team: a.team !== undefined ? a.team : p.team,
      price: a.price,
    });
  });
}

function teamById(id) {
  return TEAMS.find(t => t.id === id) || null;
}

/* ------------------------------------------------------------
   Player photos (stored in Netlify Blobs).
   Players upload their own photo from the Season 1 page. Each photo is
   stored server-side in a Netlify Blobs store keyed by player id and
   served back through the `player-photo` function. If a player has no
   photo yet, the card falls back to their initials automatically.
   (Locally, without `netlify dev`, the endpoint 404s → initials show.)
   You can still hard-code a path with a `photo:` field on a player.
   ------------------------------------------------------------ */
const PHOTO_ENDPOINT = '/.netlify/functions/player-photo';
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}
function photoSrc(p) {
  return p.photo || (PHOTO_ENDPOINT + '?id=' + p.id);
}
/* Avatar that shows the photo if it loads, else the initials. */
function avatarHTML(p, extraClass) {
  return '<span class="player-avatar ' + (extraClass || '') + '" data-initials="' + initials(p.name) + '">' +
         '<img src="' + photoSrc(p) + '" alt="" loading="lazy" onerror="this.remove()"></span>';
}

/* expose for non-module usage */
window.SEASON = SEASON;
window.TEAMS = TEAMS;
window.PLAYERS = PLAYERS;
window.POSITIONS = POSITIONS;
window.getPlayers = getPlayers;
window.teamById = teamById;
window.initials = initials;
window.photoSrc = photoSrc;
window.avatarHTML = avatarHTML;
window.isSpiker = isSpiker;
window.basePrice = basePrice;
window.PHOTO_ENDPOINT = PHOTO_ENDPOINT;
window.loadAssignments = loadAssignments;
window.saveAssignments = saveAssignments;
window.STORE_KEY = STORE_KEY;
