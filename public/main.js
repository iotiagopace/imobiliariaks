const params = new URLSearchParams(location.search);
const trackingFields = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','ttclid'];
const whatsappNumber = '5547992877202';

const track = (event, detail = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...detail });
};

track('page_view', { page_title: document.title, page_url: location.href });

const slides = [...document.querySelectorAll('.hero-slide')];
const slideControls = [...document.querySelectorAll('[data-slide]')];
let currentSlide = 0;
let slideTimer;
const showSlide = (index) => {
  currentSlide = index;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  slideControls.forEach((control, i) => control.classList.toggle('active', i === index));
};
const startSlider = () => {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide((currentSlide + 1) % slides.length), 6500);
};
slideControls.forEach((control) => control.addEventListener('click', () => {
  showSlide(Number(control.dataset.slide));
  startSlider();
}));
if (slides.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) startSlider();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('[data-lead-form]').forEach((form) => {
  let started = false;
  form.addEventListener('focusin', () => {
    if (!started) {
      started = true;
      track('form_start');
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const status = form.querySelector('.form-status');
    if (button.disabled) return;
    button.disabled = true;
    status.className = 'form-status';
    status.textContent = 'Enviando suas informações…';
    track('form_submit_attempt');

    const payload = Object.fromEntries(new FormData(form));
    trackingFields.forEach((field) => payload[field] = params.get(field) || '');
    Object.assign(payload, {
      page_url: location.href,
      page_title: document.title,
      referrer: document.referrer,
      submitted_at: new Date().toISOString(),
      landing_name: 'ks_imoveis_bombinhas_captura',
      lead_source: 'landing_page_imobiliaria_ks'
    });

    try {
      const endpoint = document.querySelector('meta[name="crm-endpoint"]')?.content;
      if (!endpoint) throw new Error('CRM_ENDPOINT_NOT_CONFIGURED');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`CRM_${response.status}`);
      status.className = 'form-status success';
      status.textContent = 'Recebemos seu interesse. Um especialista da KS vai retornar com opções alinhadas ao seu perfil.';
      form.reset();
      track('form_submit_success');
      track('generate_lead', { finalidade: payload.finalidade });
    } catch (error) {
      console.warn('Lead delivery:', error.message);
      status.className = 'form-status error';
      const message = `Olá, vim pela página de imóveis em Bombinhas. Meu nome é ${payload.nome}. Busco: ${payload.finalidade || 'quero orientação'}; ${payload.momento || 'pronto ou lançamento'}; região: ${payload.regiao || 'quero indicação'}; faixa: ${payload.faixa_investimento || 'a definir'}.`;
      status.innerHTML = `Não foi possível enviar agora. <a href="https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener"><u>Fale diretamente pelo WhatsApp.</u></a>`;
      track('form_submit_error');
    } finally {
      button.disabled = false;
    }
  });
});

document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
  link.addEventListener('click', () => track('whatsapp_click'));
});

document.querySelectorAll('[data-interest] a').forEach((link) => {
  link.addEventListener('click', () => {
    const interest = link.closest('[data-interest]').dataset.interest;
    document.querySelectorAll('input[name="interesse_especifico"]').forEach((input) => input.value = interest);
    track('property_interest_click', { interest });
  });
});

document.querySelectorAll('[data-region]').forEach((button) => {
  button.addEventListener('click', () => {
    const region = button.dataset.region;
    const regionSelect = document.querySelector('#contato select[name="regiao"]');
    if (regionSelect) regionSelect.value = region;
    document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' });
    track('region_interest_click', { region });
  });
});
