// Инициализация
Telegram.WebApp.ready(); Telegram.WebApp.expand();

// Ключи
const TAVILY_KEY = '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';
const HF_TOKEN = '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';

// 3D-кубики
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
const cubes = [];
for (let i = 0; i < 100; i++) {
  cubes.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 5 + Math.random() * 15, speed: 0.5 + Math.random() });
}
function drawCubes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cubes.forEach(c => {
    const dx = mouseX - c.x, dy = mouseY - c.y;
    c.x += dx * 0.01; c.y += dy * 0.01;
    ctx.fillStyle = `rgba(255,107,53,0.6)`;
    ctx.fillRect(c.x, c.y, c.size, c.size);
  });
  requestAnimationFrame(drawCubes);
}
drawCubes();

// Стартовый экран + прогресс
let progress = 0;
const progressInterval = setInterval(() => {
  progress += 10;
  document.querySelector('.progress').textContent = `Готовность: ${progress}%`;
  if (progress >= 100) clearInterval(progressInterval);
}, 100);

// Функции
function toggleMenu() { document.getElementById('menu').style.display = document.getElementById('menu').style.display === 'block' ? 'none' : 'block'; }
function sendQuery() { googleSearch(); }

async function generateImage() {
  const prompt = document.getElementById('query').value || 'картинка';
  document.getElementById('result').innerHTML = '<p class="loading">Генерирую...</p>';
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
      body: JSON.stringify({ inputs: prompt })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById('result').innerHTML = `<img src="${url}" alt="Картинка" style="max-width:100%;border-radius:8px;">`;
  } catch { document.getElementById('result').innerHTML = '<p>Ошибка</p>'; }
}

async function googleSearch() {
  const query = document.getElementById('query').value || 'информация';
  document.getElementById('result').innerHTML = '<p class="loading">Ищу...</p>';
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_KEY, query, include_answer: true })
    });
    const data = await res.json();
    document.getElementById('result').innerHTML = `<p>${data.answer || 'Не нашёл'}</p>`;
  } catch { document.getElementById('result').innerHTML = '<p>Ошибка поиска</p>'; }
}

async function solveMath() {
  const query = document.getElementById('query').value || '2+2';
  document.getElementById('result').innerHTML = '<p class="loading">Решая...</p>';
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.min.js';
  script.onload = () => {
    try {
      const result = math.evaluate(query);
      document.getElementById('result').innerHTML = `<p>Ответ: ${result}</p>`;
    } catch { document.getElementById('result').innerHTML = '<p>Ошибка</p>'; }
  };
  document.head.appendChild(script);
}

function uploadFile() {
  document.getElementById('fileInput').click();
}

function handleFile(files) {
  const file = files[0];
  if (file) {
    document.getElementById('result').innerHTML = '<p class="loading">Анализирую файл...</p>';
    // Загрузка и анализ через HF (для фото)
    const formData = new FormData();
    formData.append('file', file);
    fetch('https://api-inference.huggingface.co/models/llava-hf/llava-v1.6-mistral-7b-hf', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${HF_TOKEN}` },
      body: formData
    }).then(res => res.json()).then(data => {
      document.getElementById('result').innerHTML = `<p>Анализ: ${data[0]?.generated_text || 'Готово'}</p>`;
    }).catch(() => document.getElementById('result').innerHTML = '<p>Ошибка анализа</p>');
  }
}

function voiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ru-RU';
  recognition.onresult = (e) => {
    document.getElementById('query').value = e.results[0][0].transcript;
  };
  recognition.start();
}

function randomFact() {
  const facts = ['Факт 1: Земля вращается на 1670 км/ч.', 'Факт 2: Осьминоги имеют 3 сердца.'];
  document.getElementById('result').innerHTML = `<p>${facts[Math.floor(Math.random() * facts.length)]}</p>`;
}

function switchAccount() {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  // Логика смены аккаунта (симуляция)
  alert('Аккаунты: ' + accounts.join(', '));
}

function makePresentation() {
  // Код PPTX как в прошлом сообщении
  const pptx = new PptxGenJS();
  pptx.addSlide().addText('Презентация готова!', { x: 1, y: 2, fontSize: 32 });
  pptx.writeFile({ fileName: 'presentation.pptx' });
  document.getElementById('result').innerHTML = '<p>Скачивается...</p>';
}
  </script>
</body>
</html>
