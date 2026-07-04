const params = new URLSearchParams(location.search);
const trackingFields = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','ttclid'];

const track = (event, detail = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...detail });
};

track('page_view', { page_title: document.title, page_url: location.href });

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
      landing_name: 'ks_empreendimento_lancamento',
      empreendimento_nome: 'Vila Coral',
      empreendimento_localizacao: 'Canto Grande, Bombinhas/SC'
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
      status.textContent = 'Recebemos seu interesse. Um consultor da KS vai retornar com as informações do empreendimento.';
      form.reset();
      track('form_submit_success');
      track('generate_lead', { finalidade: payload.finalidade });
    } catch (error) {
      console.warn('Lead delivery:', error.message);
      status.className = 'form-status error';
      status.innerHTML = 'Não foi possível enviar agora. <a href="https://wa.me/554733691515?text=Olá,%20quero%20conhecer%20o%20Vila%20Coral." target="_blank" rel="noopener"><u>Fale diretamente pelo WhatsApp.</u></a>';
      track('form_submit_error');
    } finally {
      button.disabled = false;
    }
  });
});

document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
  link.addEventListener('click', () => track('whatsapp_click'));
});
