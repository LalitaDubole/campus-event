function openM(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeM(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

function toggleDD() {
  const dd = document.getElementById('ddMenu');
  if (dd) dd.classList.toggle('show');
}

function closeDD() {
  const dd = document.getElementById('ddMenu');
  if (dd) dd.classList.remove('show');
}

function toggleMob() {
  const nav = document.getElementById('mobileNav');
  if (nav) nav.classList.toggle('hidden');
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let curSlide = 0;
function goSl(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  curSlide = index;
}

setInterval(() => {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 0) goSl((curSlide + 1) % slides.length);
}, 4000);

function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    if (window.scrollY > 50) {
      nav.style.background = '#fff';
      nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
      nav.style.background = 'transparent';
      nav.style.boxShadow = 'none';
    }
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===================== COUNTDOWN =====================
function startCountdown() {
  fetch('/api/events')
    .then(r => r.json())
    .then(data => {
      if (!data.success || !data.events.length) return;
      const upcoming = data.events.find(e => new Date(e.date) > new Date());
      if (!upcoming) return;
      const cdN = document.getElementById('cdN');
      if (cdN) cdN.textContent = upcoming.title;
      const target = new Date(upcoming.date);
      setInterval(() => {
        const diff = target - new Date();
        if (diff <= 0) return;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cdD').textContent = String(d).padStart(2, '0');
        document.getElementById('cdH').textContent = String(h).padStart(2, '00');
        document.getElementById('cdM').textContent = String(m).padStart(2, '00');
        document.getElementById('cdS').textContent = String(s).padStart(2, '00');
      }, 1000);
    });
}

// ===================== EVENTS =====================
async function renderEv() {
  const search = document.getElementById('sI')?.value?.toLowerCase() || '';
  const category = document.getElementById('cF')?.value || 'All';
  try {
    const res = await fetch('/api/events');
    const data = await res.json();
    if (!data.success) return;
    let events = data.events;
    if (search) events = events.filter(e => e.title.toLowerCase().includes(search));
    if (category !== 'All') events = events.filter(e => e.category === category);
    const grid = document.getElementById('evG');
    const noEv = document.getElementById('noEv');
    if (!grid) return;
    if (events.length === 0) {
      grid.innerHTML = '';
      noEv?.classList.remove('hidden');
      return;
    }
    noEv?.classList.add('hidden');
    grid.innerHTML = events.map(e => `
      <div class="ev-card">
        <div class="p-5">
          <span class="badge badge-${e.category.toLowerCase()}">${e.category}</span>
          <h3 class="font-display text-lg font-bold mt-3 mb-2 text-ink">${e.title}</h3>
          <p class="text-muted text-sm mb-4">${e.description || ''}</p>
          <div class="flex flex-col gap-1.5 text-sm text-ink-l mb-5">
            <span><i class="fas fa-calendar mr-2 text-primary"></i>${new Date(e.date).toDateString()}</span>
            <span><i class="fas fa-clock mr-2 text-primary"></i>${e.time || 'TBA'}</span>
            <span><i class="fas fa-map-marker-alt mr-2 text-primary"></i>${e.venue || 'TBA'}</span>
            <span><i class="fas fa-users mr-2 text-primary"></i>${e.seats} seats</span>
          </div>
          <button onclick="registerEvent(${e.id}, '${e.title}')" class="btn-a w-full">Register Now</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error:', err);
  }
}

function filterCategory(category) {
  document.getElementById('cF').value = category;
  renderEv();
  document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
}

// ===================== EVENT REGISTRATION =====================
function registerEvent(eventId, eventTitle) {
  const userBtns = document.getElementById('userBtns');
  const isLoggedIn = userBtns && !userBtns.classList.contains('hidden');

  if (!isLoggedIn) {
    showToast('Please login first!', 'err');
    openM('loginM');
    return;
  }

  const name = document.getElementById('navUN')?.textContent || '';
  const email = document.getElementById('ddUE')?.textContent || '';
  document.getElementById('erName').value = name;
  document.getElementById('erEmail').value = email;
  document.getElementById('erStream').value = '';
  document.getElementById('erPhone').value = '';
  document.getElementById('erEventId').value = eventId;
  document.getElementById('eventRegTitle').textContent = eventTitle;

  openM('eventRegM');
}

async function submitEventReg() {
  const eventId = document.getElementById('erEventId')?.value;
  const body = {
    name: document.getElementById('erName')?.value,
    stream: document.getElementById('erStream')?.value,
    phone: document.getElementById('erPhone')?.value,
    email: document.getElementById('erEmail')?.value
  };

  if (!body.name || !body.phone || !body.email) {
    showToast('Name, phone aur email zaroori hain!', 'err');
    return;
  }

  const res = await fetch(`/api/events/register/${eventId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) closeM('eventRegM');
}

// ===================== MY REGISTRATIONS =====================
async function loadMyRegistrations() {
  const res = await fetch('/api/events/my-registrations');
  const data = await res.json();
  const list = document.getElementById('myRegsList');
  if (!list) return;
  if (!data.success || data.registrations.length === 0) {
    list.innerHTML = '<p class="text-muted text-sm text-center py-8">No registrations yet</p>';
    return;
  }
  list.innerHTML = data.registrations.map(r => `
    <div class="p-4 bg-cream rounded-xl border border-cream-dd">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-${r.category.toLowerCase()}">${r.category}</span>
      </div>
      <h4 class="font-semibold text-ink">${r.title}</h4>
      <p class="text-xs text-muted mt-1">
        <i class="fas fa-calendar mr-1"></i>${new Date(r.date).toDateString()}
        ${r.venue ? ` • <i class="fas fa-map-marker-alt mr-1"></i>${r.venue}` : ''}
      </p>
      <p class="text-xs text-primary mt-1 font-medium">
        <i class="fas fa-check-circle mr-1"></i>Registered on ${new Date(r.registered_at).toDateString()}
      </p>
    </div>
  `).join('');
}

// ===================== AUTH =====================
async function doReg() {
  const body = {
    full_name: document.getElementById('rN')?.value,
    phone: document.getElementById('rPh')?.value,
    email: document.getElementById('rE')?.value,
    department: document.getElementById('rDe')?.value,
    year: document.getElementById('rY')?.value,
    password: document.getElementById('rPa')?.value
  };
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) closeM('regM');
}

async function doLogin() {
  const body = {
    email: document.getElementById('lE')?.value,
    password: document.getElementById('lP')?.value
  };
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) {
    closeM('loginM');
    document.getElementById('guestBtns')?.classList.add('hidden');
    document.getElementById('userBtns')?.classList.remove('hidden');
    document.getElementById('userBtns')?.classList.add('flex');
    document.getElementById('navUN').textContent = data.user.name;
    document.getElementById('ddUN').textContent = data.user.name;
    document.getElementById('ddUE').textContent = data.user.email;
    updateThoughtUI(true, data.user.name);
  }
}

async function userOut() {
  await fetch('/api/auth/logout', { method: 'POST' });
  document.getElementById('guestBtns')?.classList.remove('hidden');
  document.getElementById('userBtns')?.classList.add('hidden');
  updateThoughtUI(false, '');
  showToast('Logged out!', 'info');
}

// ===================== ADMIN =====================
async function aLogin() {
  const u = document.getElementById('aU')?.value;
  const p = document.getElementById('aP')?.value;
  if (u === 'admin' && p === 'admin123') {
    showToast('Admin logged in!', 'ok');
    closeM('adminLoginM');
    loadAdminEvents();
    loadAdminNotices();
    loadAdminRegistrations();
    openM('adminPanelM');
  } else {
    showToast('Wrong credentials!', 'err');
  }
}

function switchTab(tab) {
  ['Events', 'Notices', 'Registrations'].forEach(t => {
    const btn = document.getElementById(`tab${t}`);
    const content = document.getElementById(`tabContent${t}`);
    if (btn) btn.className = t === tab
      ? 'flex-1 py-3 text-sm font-semibold text-primary border-b-2 border-primary'
      : 'flex-1 py-3 text-sm font-semibold text-muted border-b-2 border-transparent';
    if (content) content.classList.toggle('hidden', t !== tab);
  });
}

async function adminAddEvent() {
  const body = {
    title: document.getElementById('aTitle')?.value,
    description: document.getElementById('aDesc')?.value,
    category: document.getElementById('aCat')?.value,
    date: document.getElementById('aDate')?.value,
    time: document.getElementById('aTime')?.value,
    venue: document.getElementById('aVenue')?.value,
    seats: document.getElementById('aSeats')?.value
  };
  if (!body.title || !body.category || !body.date) {
    showToast('Title, category aur date zaroori hai!', 'err');
    return;
  }
  const res = await fetch('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) {
    loadAdminEvents();
    renderEv();
    document.getElementById('aTitle').value = '';
    document.getElementById('aDesc').value = '';
    document.getElementById('aDate').value = '';
    document.getElementById('aVenue').value = '';
  }
}

async function adminDeleteEvent(id) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) { loadAdminEvents(); renderEv(); }
}

async function loadAdminEvents() {
  const res = await fetch('/api/events');
  const data = await res.json();
  if (!data.success) return;
  const list = document.getElementById('adminEvList');
  if (!list) return;
  if (data.events.length === 0) {
    list.innerHTML = '<p class="text-muted text-sm">No events yet</p>';
    return;
  }
  list.innerHTML = data.events.map(e => `
    <div class="flex items-center justify-between p-3 bg-cream rounded-xl border border-cream-dd">
      <div>
        <p class="font-semibold text-sm text-ink">${e.title}</p>
        <p class="text-xs text-muted">${e.category} • ${new Date(e.date).toDateString()}</p>
      </div>
      <button onclick="adminDeleteEvent(${e.id})" class="text-red-500 hover:text-red-700 text-sm font-medium">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

// ===================== NOTICES =====================
async function loadNotices() {
  const res = await fetch('/api/events/notices');
  const data = await res.json();
  const list = document.getElementById('noticesList');
  const noNotices = document.getElementById('noNotices');
  if (!list) return;
  if (!data.success || data.notices.length === 0) {
    list.innerHTML = '';
    noNotices?.classList.remove('hidden');
    return;
  }
  noNotices?.classList.add('hidden');
  list.innerHTML = data.notices.map(n => `
    <div class="ev-card p-6">
      <div class="flex items-start gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl bg-accent-p flex items-center justify-center flex-shrink-0">
          <i class="fas fa-bell text-accent text-sm"></i>
        </div>
        <div>
          <h3 class="font-display font-bold text-ink">${n.title}</h3>
          <p class="text-xs text-muted">${new Date(n.created_at).toDateString()}</p>
        </div>
      </div>
      <p class="text-sm text-ink-l leading-relaxed">${n.content}</p>
    </div>
  `).join('');
}

async function adminAddNotice() {
  const body = {
    title: document.getElementById('nTitle')?.value,
    content: document.getElementById('nContent')?.value
  };
  if (!body.title || !body.content) {
    showToast('Title or content are important!', 'err');
    return;
  }
  const res = await fetch('/api/admin/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) {
    document.getElementById('nTitle').value = '';
    document.getElementById('nContent').value = '';
    loadNotices();
    loadAdminNotices();
  }
}

async function loadAdminNotices() {
  const res = await fetch('/api/events/notices');
  const data = await res.json();
  const list = document.getElementById('adminNoticeList');
  if (!list) return;
  if (!data.success || data.notices.length === 0) {
    list.innerHTML = '<p class="text-muted text-sm">No notices yet</p>';
    return;
  }
  list.innerHTML = data.notices.map(n => `
    <div class="flex items-center justify-between p-3 bg-cream rounded-xl border border-cream-dd">
      <div>
        <p class="font-semibold text-sm text-ink">${n.title}</p>
        <p class="text-xs text-muted">${new Date(n.created_at).toDateString()}</p>
      </div>
      <button onclick="adminDeleteNotice(${n.id})" class="text-red-500 hover:text-red-700 text-sm">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');
}

async function adminDeleteNotice(id) {
  if (!confirm('Delete this notice?')) return;
  const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) { loadNotices(); loadAdminNotices(); }
}

// ===================== ADMIN REGISTRATIONS =====================
async function loadAdminRegistrations() {
  const res = await fetch('/api/events/all-registrations');
  const data = await res.json();
  const list = document.getElementById('adminRegsList');
  if (!list) return;
  if (!data.success || data.registrations.length === 0) {
    list.innerHTML = '<p class="text-muted text-sm text-center py-4">No registrations yet</p>';
    return;
  }
  list.innerHTML = data.registrations.map(r => `
    <div class="p-3 bg-cream rounded-xl border border-cream-dd">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm text-ink">${r.name || 'N/A'}</span>
        <span class="badge badge-${r.category.toLowerCase()}">${r.category}</span>
      </div>
      <p class="text-xs text-primary font-medium mb-1">${r.event_title}</p>
      <div class="flex flex-wrap gap-3 text-xs text-muted">
        <span><i class="fas fa-graduation-cap mr-1"></i>${r.stream || 'N/A'}</span>
        <span><i class="fas fa-phone mr-1"></i>${r.phone || 'N/A'}</span>
        <span><i class="fas fa-envelope mr-1"></i>${r.email || 'N/A'}</span>
      </div>
    </div>
  `).join('');
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  renderEv();
  startCountdown();
  loadNotices();
  loadThoughts();
});
// Load thoughts
async function loadThoughts() {
  const res = await fetch('/api/events/thoughts');
  const data = await res.json();
  const list = document.getElementById('thoughtsList');
  const noThoughts = document.getElementById('noThoughts');
  if (!list) return;
  if (!data.success || data.thoughts.length === 0) {
    list.innerHTML = '';
    noThoughts?.classList.remove('hidden');
    return;
  }
  noThoughts?.classList.add('hidden');
  list.innerHTML = data.thoughts.map(t => `
    <div class="ev-card p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-primary-p flex items-center justify-center flex-shrink-0">
          <span class="text-primary font-bold text-sm">${t.user_name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p class="font-semibold text-ink text-sm">${t.user_name}</p>
          <p class="text-xs text-muted">${new Date(t.created_at).toDateString()}</p>
        </div>
      </div>
      <p class="text-ink-l text-sm leading-relaxed">${t.message}</p>
    </div>
  `).join('');
}

// Post thought
async function postThought() {
  const message = document.getElementById('thoughtMsg')?.value?.trim();
  if (!message) {
    showToast('Kuch likho pehle!', 'err');
    return;
  }
  const res = await fetch('/api/events/thoughts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  const data = await res.json();
  showToast(data.message, data.success ? 'ok' : 'err');
  if (data.success) {
    document.getElementById('thoughtMsg').value = '';
    loadThoughts();
  }
}

// Show/hide thought form based on login
function updateThoughtUI(isLoggedIn, userName) {
  const form = document.getElementById('thoughtForm');
  const prompt = document.getElementById('thoughtLoginPrompt');
  const nameEl = document.getElementById('thoughtUserName');
  if (isLoggedIn) {
    form?.classList.remove('hidden');
    prompt?.classList.add('hidden');
    if (nameEl) nameEl.textContent = userName;
  } else {
    form?.classList.add('hidden');
    prompt?.classList.remove('hidden');
  }
}