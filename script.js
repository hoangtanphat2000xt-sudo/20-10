// ==========================================
// 1. HIỆU ỨNG CÁNH HOA ĐÀO / HOA HỒNG RƠI (CANVAS)
// ==========================================
const canvas = document.getElementById('petal-canvas');
const ctx = canvas.getContext('2d');

let petals = [];
const PETAL_COUNT = 38;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * canvas.width;
    this.y = initial ? Math.random() * canvas.height : -25;
    this.size = 7 + Math.random() * 10;
    this.speedY = 0.7 + Math.random() * 1.3;
    this.speedX = -0.6 + Math.random() * 1.2;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.025;
    this.opacity = 0.45 + Math.random() * 0.45;
    const colors = ['#ff80ab', '#ff4081', '#f8bbd0', '#fce4ec', '#ec407a'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.4;
    this.angle += this.spin;

    if (this.y > canvas.height + 30 || this.x < -40 || this.x > canvas.width + 40) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    // Vẽ hình cánh hoa mềm mại
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.size * 0.6, -this.size * 0.5, this.size, this.size * 0.3, 0, this.size);
    ctx.bezierCurveTo(-this.size, this.size * 0.3, -this.size * 0.6, -this.size * 0.5, 0, 0);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < PETAL_COUNT; i++) {
  petals.push(new Petal());
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of petals) {
    p.update();
    p.draw();
  }
  requestAnimationFrame(animatePetals);
}
animatePetals();

// ==========================================
// 2. HỘP NHẠC WEB AUDIO API (DỊU DÀNG, KHÔNG CẦN FILE MP3 NGOÀI)
// ==========================================
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

// Giai điệu Music Box lãng mạn (tần số nốt nhạc)
const melodyNotes = [
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25,
  587.33, 698.46, 880.00, 1046.50, 880.00, 698.46,
  493.88, 587.33, 783.99, 987.77, 783.99, 587.33,
  523.25, 659.25, 783.99, 1046.50, 783.99, 659.25
];
let noteIndex = 0;

function playMusicBoxNote(freq) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 1.45);
}

function startMusic() {
  if (isMusicPlaying) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isMusicPlaying = true;
  const musicBtn = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  musicBtn.classList.add('playing');
  if (musicLabel) musicLabel.textContent = 'Đang phát';

  playMusicBoxNote(melodyNotes[noteIndex]);
  musicInterval = setInterval(() => {
    noteIndex = (noteIndex + 1) % melodyNotes.length;
    playMusicBoxNote(melodyNotes[noteIndex]);
  }, 480);
}

function stopMusic() {
  isMusicPlaying = false;
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  const musicBtn = document.getElementById('music-toggle');
  const musicLabel = document.getElementById('music-label');
  musicBtn.classList.remove('playing');
  if (musicLabel) musicLabel.textContent = 'Giai điệu';
}

document.getElementById('music-toggle').addEventListener('click', () => {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

// ==========================================
// 3. MỞ PHONG THƯ MỞ ĐẦU
// ==========================================
const openEnvelopeBtn = document.getElementById('open-envelope-btn');
const envelope = document.getElementById('envelope');
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');

function openEnvelope() {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  startMusic();
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 16);

  setTimeout(() => {
    introScreen.classList.add('fade-out');
    mainContent.classList.remove('hidden');
  }, 950);
}

openEnvelopeBtn.addEventListener('click', openEnvelope);
openEnvelopeBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openEnvelope();
  }
});

// ==========================================
// 4. HIỆU ỨNG TẶNG HOA & BẮN TIM
// ==========================================
let flowerCount = 0;
const sendFlowersBtn = document.getElementById('send-flowers-btn');
const flowerCounterEl = document.getElementById('flower-counter');

function spawnFloatingBurst(centerX, centerY, count = 12) {
  const emojis = ['💐', '🌷', '🌸', '💖', '🌹', '✨', '🥰', '💝'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'floating-burst';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const offsetX = (Math.random() - 0.5) * 260;
    const offsetY = (Math.random() - 0.5) * 100;
    el.style.left = `${centerX + offsetX}px`;
    el.style.top = `${centerY + offsetY}px`;
    el.style.animationDuration = `${1.2 + Math.random() * 0.9}s`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }
}

sendFlowersBtn.addEventListener('click', (e) => {
  flowerCount += 1;
  flowerCounterEl.textContent = flowerCount;
  const rect = sendFlowersBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top;
  spawnFloatingBurst(x, y, 14);
});

// ==========================================
// 5. LẬT THẺ TRÊN ĐIỆN THOẠI / CLICK
// ==========================================
document.querySelectorAll('.reason-card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

// ==========================================
// 6. LỌ SAO YÊU THƯƠNG NGẪU NHIÊN CHO GIA THƯ
// ==========================================
const loveNotes = [
  '🌟 Chúc Lê Nguyễn Gia Thư hôm nay nhận được thật nhiều niềm vui và luôn cười tươi như hoa nhé!',
  '💖 Cảm ơn Gia Thư vì đã đến và làm cho những ngày bình thường của tui trở nên đặc biệt.',
  '🌷 Chúc công chúa của tui luôn xinh đẹp, tự tin và đạt được mọi điều em mong ước!',
  '🍓 Dù hôm nay của Thư có bận rộn thế nào, nhớ là luôn có một người ở đây thương Thư rất nhiều!',
  '✨ Nụ cười của Gia Thư chính là món quà tuyệt vời nhất mà tui có được.',
  '🧁 Chúc bồ yêu một ngày lễ ngọt ngào như trà sữa full topping, ấm áp như vòng tay của tui!',
  '👑 Trong hàng tỉ người trên thế giới, Lê Nguyễn Gia Thư vẫn luôn là cô gái tuyệt vời nhất!',
  '💌 Hôm nay Thư chỉ cần xinh đẹp và hạnh phúc thôi, cả thế giới cứ để tui lo nha!'
];

let lastNoteIdx = -1;
const jarNoteText = document.getElementById('jar-note-text');
const drawWishBtn = document.getElementById('draw-wish-btn');
const jarTrigger = document.getElementById('jar-trigger');

function drawRandomLoveNote() {
  let idx;
  do {
    idx = Math.floor(Math.random() * loveNotes.length);
  } while (idx === lastNoteIdx && loveNotes.length > 1);
  lastNoteIdx = idx;

  jarNoteText.style.opacity = '0';
  jarNoteText.style.transform = 'translateY(6px)';

  setTimeout(() => {
    jarNoteText.textContent = `“${loveNotes[idx]}”`;
    jarNoteText.style.opacity = '1';
    jarNoteText.style.transform = 'translateY(0)';
  }, 200);

  const rect = drawWishBtn.getBoundingClientRect();
  spawnFloatingBurst(rect.left + rect.width / 2, rect.top, 8);
}

drawWishBtn.addEventListener('click', drawRandomLoveNote);
jarTrigger.addEventListener('click', drawRandomLoveNote);

// ==========================================
// 7. CÂU HỎI ĐÁNG YÊU (NÚT "HÔNG" CHẠY TRỐN)
// ==========================================
const yesLoveBtn = document.getElementById('yes-love-btn');
const noLoveBtn = document.getElementById('no-love-btn');
const celebrationModal = document.getElementById('celebration-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

const funnyNoTexts = [
  'Ủa bấm nhầm hả? 🤨',
  'Suy nghĩ kỹ lại đi nha! 🥺',
  'Đừng mà, chọn nút bên trái kìa! 💕',
  'Hông cho bấm nút này đâu 😜',
  'Bắt buộc phải thương tui!! 💖'
];
let noClickCount = 0;

function dodgeNoButton() {
  noClickCount++;
  noLoveBtn.textContent = funnyNoTexts[noClickCount % funnyNoTexts.length];

  // Phóng to nút "Thương nhiều lắm luôn"
  const scale = Math.min(1 + noClickCount * 0.12, 1.65);
  yesLoveBtn.style.transform = `scale(${scale})`;

  // Di chuyển nhẹ nút "Hông"
  const randomX = (Math.random() - 0.5) * 140;
  const randomY = (Math.random() - 0.5) * 50;
  noLoveBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
}

noLoveBtn.addEventListener('mouseover', dodgeNoButton);
noLoveBtn.addEventListener('click', dodgeNoButton);

yesLoveBtn.addEventListener('click', () => {
  celebrationModal.classList.remove('hidden');
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 24);
});

closeModalBtn.addEventListener('click', () => {
  celebrationModal.classList.add('hidden');
});

// ==========================================
// 8. TUỲ CHỈNH NGÀY LỄ (20/10 vs 20/11) & LỜI CHÚC
// ==========================================
const customizeToggle = document.getElementById('customize-toggle');
const customizeModal = document.getElementById('customize-modal');
const saveCustomBtn = document.getElementById('save-custom-btn');
const cancelCustomBtn = document.getElementById('cancel-custom-btn');
const selectDateMode = document.getElementById('select-date-mode');
const inputSender = document.getElementById('input-sender');
const inputCustomWish = document.getElementById('input-custom-wish');

const defaultWishes = [
  'Nhân ngày Phụ nữ Việt Nam, tui muốn dành một góc nhỏ đặc biệt này chỉ để nói rằng: Cảm ơn Lê Nguyễn Gia Thư vì đã luôn là chính em — một cô gái vừa xinh đẹp, ấm áp, lại vừa đáng yêu đến nhường này.',
  'Chúc bồ của tui không chỉ riêng ngày hôm nay mà cả 365 ngày trong năm đều luôn rạng rỡ như những đóa hoa ban mai, luôn bình yên, hạnh phúc và được yêu thương thật nhiều.',
  'Mọi muộn phiền ngoài kia cứ để tui lo, việc của Gia Thư là cứ mãi tươi cười và hạnh phúc bên tui thôi nhé!'
];

function applyCustomization(mode, sender, paragraphs) {
  const envBadge = document.getElementById('envelope-date-badge');
  const heroOccasion = document.getElementById('display-occasion');
  const letterDateLabel = document.getElementById('letter-date-label');
  const displaySender = document.getElementById('display-sender');
  const letterBody = document.getElementById('letter-body');

  if (mode === '20-11-women') {
    envBadge.textContent = 'Ngày Phụ Nữ Việt Nam • 20/11';
    heroOccasion.textContent = "Happy Vietnamese Women's Day • 20/11";
    letterDateLabel.textContent = 'Ngày 20 tháng 11';
  } else if (mode === '20-11-teacher') {
    envBadge.textContent = 'Chúc Mừng Ngày 20/11';
    heroOccasion.textContent = 'Happy Vietnamese Celebration • 20/11';
    letterDateLabel.textContent = 'Ngày 20 tháng 11';
  } else {
    envBadge.textContent = 'Ngày Phụ Nữ Việt Nam • 20/10';
    heroOccasion.textContent = "Happy Vietnamese Women's Day • 20/10";
    letterDateLabel.textContent = 'Ngày 20 tháng 10';
  }

  if (sender && sender.trim()) {
    displaySender.textContent = sender.trim();
  }

  if (paragraphs && paragraphs.length > 0) {
    letterBody.innerHTML = '';
    paragraphs.forEach((pText) => {
      if (pText.trim()) {
        const p = document.createElement('p');
        p.textContent = pText.trim();
        letterBody.appendChild(p);
      }
    });
  }
}

customizeToggle.addEventListener('click', () => {
  const currentParas = Array.from(document.querySelectorAll('#letter-body p')).map((p) => p.textContent.trim());
  inputCustomWish.value = currentParas.join('\n\n');
  customizeModal.classList.remove('hidden');
});

cancelCustomBtn.addEventListener('click', () => {
  customizeModal.classList.add('hidden');
});

saveCustomBtn.addEventListener('click', () => {
  const mode = selectDateMode.value;
  const sender = inputSender.value;
  const paragraphs = inputCustomWish.value.split(/\n+/).filter((line) => line.trim() !== '');

  applyCustomization(mode, sender, paragraphs.length ? paragraphs : defaultWishes);
  customizeModal.classList.add('hidden');
  spawnFloatingBurst(window.innerWidth / 2, window.innerHeight / 2, 10);
});
