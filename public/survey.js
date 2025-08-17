// Progressive Survey Section for StudentSave.az

const surveyQuestions = [
  {
    id: 'q1',
    type: 'radio',
    question: 'Platformadan istifadə edərdinmi?',
    required: true,
    options: [
      'Bəli, mütləq istifadə edərdim',
      'Bəlkə istifadə edərəm',
      'Yox, istifadə etmərəm'
    ]
  },
  {
    id: 'q2',
    type: 'checkbox',
    question: 'Əgər istifadə etməzsənsə səbəbi nə ola bilər?',
    required: false,
    options: [
      'Unudaram',
      'İstifadəsi çətindir',
      'Sayt olması (app deyil)',
      'Gündəlik həyatda ehtiyac duymuram',
      'Endirimlər azdır',
      'Digər'
    ]
  },
  {
    id: 'q3',
    type: 'textarea',
    question: 'Dizaynda hansı çatışmazlıqları görürsən? (Məs: kateqoriyalar azdır, məlumat yetərsizdir və s.)',
    required: false,
    placeholder: 'Fikirlərini yaz...'
  },
  {
    id: 'q4',
    type: 'textarea',
    question: 'Platformada olmayan, amma sənin istədiyin hər hansı bir şey varmı?',
    required: false,
    placeholder: 'Nə istəyirsənsə qeyd et...'
  },
  {
    id: 'q5',
    type: 'textarea',
    question: 'Real olaraq düşün – növbəti dəfə bir yerə getməzdən əvvəl bu platformaya baxacağını düşünürsənmi?',
    required: true,
    placeholder: 'Dürüst cavab yaz, nə vaxt və nə üçün istifadə edərsən, ya da etməzsən.'
  },
  {
    id: 'q6',
    type: 'checkbox',
    question: 'Sənin üçün ən vacib kateqoriyalar hansılardır?',
    required: false,
    options: [
      'Yemək',
      'Əyləncə',
      'Geyim',
      'Təhsil',
      'Kofe'
    ]
  }
];

const surveyState = {
  current: 0,
  answers: {}
};

const container = document.getElementById('progressiveSurveySection');

function fadeOutIn(element, cb) {
  element.style.opacity = 1;
  element.style.transition = 'opacity 0.3s';
  element.style.opacity = 0;
  setTimeout(() => {
    cb();
    element.style.opacity = 0;
    setTimeout(() => {
      element.style.opacity = 1;
    }, 10);
  }, 300);
}

function renderSurvey() {
  const q = surveyQuestions[surveyState.current];
  container.innerHTML = `
    <div class="survey-outer">
      <div class="survey-title">Fikrin bizim üçün önəmlidir</div>
      <div class="survey-subtitle">Anketə qatıl - platformamızı birlikdə inkişaf etdirək</div>
      <form class="survey-form" autocomplete="off">
        <div class="survey-question-area">
          ${renderQuestion(q)}
        </div>
        <button type="submit" class="survey-submit-btn">Göndər</button>
      </form>
    </div>
  `;
  attachHandlers();
}

function renderQuestion(q) {
  if (!q) return '';
  let html = `<div class="survey-question">${q.question}${q.required ? ' <span style="color:#ef4444">*</span>' : ''}</div>`;
  switch (q.type) {
    case 'text':
      html += `<input type="text" class="survey-input" name="${q.id}" ${q.required ? 'required' : ''} autofocus>`;
      break;
    case 'textarea':
      html += `<textarea class="survey-input" name="${q.id}" rows="3" placeholder="${q.placeholder || ''}"></textarea>`;
      break;
    case 'radio':
      html += q.options.map(opt => `
        <label class="survey-radio">
          <input type="radio" name="${q.id}" value="${opt}">
          <span>${opt}</span>
        </label>
      `).join('');
      // Add hidden text input for "Digər" option
      if (q.options.includes('Digər')) {
        html += `<input type="text" class="survey-input other-input" name="${q.id}_other" placeholder="Dəqiq fikrini yaz..." style="display:none; margin-top:8px;">`;
      }
      break;
    case 'checkbox':
      html += q.options.map(opt => `
        <label class="survey-checkbox">
          <input type="checkbox" name="${q.id}" value="${opt}">
          <span>${opt}</span>
        </label>
      `).join('');
      // Add hidden text input for "Digər" option
      if (q.options.includes('Digər')) {
        html += `<input type="text" class="survey-input other-input" name="${q.id}_other" placeholder="Dəqiq fikrini yaz..." style="display:none; margin-top:8px;">`;
      }
      break;
  }
  return html;
}

function attachHandlers() {
  const form = container.querySelector('.survey-form');
  const q = surveyQuestions[surveyState.current];
  if (!form) return;

  // Show/hide "Digər" text input when selected
  const inputs = form.querySelectorAll(`input[name="${q.id}"]`);
  const otherInput = form.querySelector('.other-input');

  if (otherInput) {
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.value === 'Digər' && input.checked) {
          otherInput.style.display = 'block';
          otherInput.focus();
        } else if (input.type === 'radio') {
          otherInput.style.display = 'none';
          otherInput.value = '';
        } else if (input.type === 'checkbox') {
          // For checkbox, check if any "Digər" checkbox is checked
          const anyOtherChecked = Array.from(inputs).some(i => i.value === 'Digər' && i.checked);
          if (anyOtherChecked) {
            otherInput.style.display = 'block';
            otherInput.focus();
          } else {
            otherInput.style.display = 'none';
            otherInput.value = '';
          }
        }
      });
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let value;

    if (q.type === 'radio') {
      const checked = form.querySelector(`input[name="${q.id}"]:checked`);
      if (q.required && !checked) {
        form.querySelectorAll(`input[name="${q.id}"]`).forEach(r => r.classList.add('survey-error'));
        return;
      }
      if (checked.value === 'Digər' && otherInput) {
        value = otherInput.value.trim();
        if (q.required && !value) {
          otherInput.classList.add('survey-error');
          return;
        }
      } else {
        value = checked ? checked.value : '';
      }
    } else if (q.type === 'checkbox') {
      const checkedBoxes = Array.from(form.querySelectorAll(`input[name="${q.id}"]:checked`));
      const checkedValues = checkedBoxes.map(cb => cb.value);
      if (q.required && checkedValues.length === 0) {
        form.querySelectorAll(`input[name="${q.id}"]`).forEach(r => r.classList.add('survey-error'));
        return;
      }
      if (checkedValues.includes('Digər') && otherInput) {
        const otherVal = otherInput.value.trim();
        if (q.required && !otherVal) {
          otherInput.classList.add('survey-error');
          return;
        }
        // Replace "Digər" with the actual input value
        const index = checkedValues.indexOf('Digər');
        checkedValues[index] = otherVal;
      }
      value = checkedValues;
    } else if (q.type === 'text' || q.type === 'textarea') {
      const input = form.querySelector('.survey-input');
      value = input.value.trim();
      if (q.required && !value) {
        input.classList.add('survey-error');
        return;
      }
    }

    surveyState.answers[q.id] = value;
    if (surveyState.current < surveyQuestions.length - 1) {
      fadeOutIn(container, () => {
        surveyState.current++;
        renderSurvey();
      });
    } else {
      showThankYou();
      console.log('Survey answers:', surveyState.answers); // For debug, remove in prod
    }
  });

  // Remove error on input/change
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('survey-error'));
    el.addEventListener('change', () => el.classList.remove('survey-error'));
  });
}

function showThankYou() {
  fadeOutIn(container, () => {
    container.innerHTML = `
      <div class="survey-thankyou-popup">
        <div class="thankyou-icon">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="36" fill="#1F2937"/>
            <path d="M24 37.5L33 46.5L48 31.5" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="thankyou-title">Təşəkkür edirik!</div>
        <div class="thankyou-desc">Rəyinizi bizimlə paylaşdığınız üçün təşəkkürlər.</div>
      </div>
    `;
    const closeBtn = container.querySelector('.thankyou-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        container.innerHTML = '';
      });
    }
  });
}

(function injectSurveyStyles() {
  const css = `
.survey-thankyou-popup {
  background: #fff;
  border-radius: 2rem;
  box-shadow: 0 8px 32px 0 rgba(59,130,246,0.10), 0 2px 8px 0 rgba(100,116,139,0.08);
  padding: 2.5rem 2rem 2.2rem 2rem;
  min-width: 320px;
  max-width: 380px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 340px;
  position: relative;
}
.thankyou-icon {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thankyou-title {
  font-size: 2rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 1rem;
  text-align: center;
  font-family: inherit;
}
.thankyou-desc {
  font-size: 1.13rem;
  color: #444;
  margin-bottom: 2.2rem;
  text-align: center;
  font-weight: 500;
  font-family: inherit;
}
.thankyou-close-btn {
  width: 100%;
  background: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 1rem;
  padding: 1.1rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(59,130,246,0.13);
  letter-spacing: 0.2px;
  margin-top: 0.5rem;
}
.thankyou-close-btn:hover {
  background: #2563eb;
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 18px rgba(59,130,246,0.13);
}
@media (max-width: 480px) {
  .survey-thankyou-popup {
    min-width: 0;
    max-width: 98vw;
    padding: 1.2rem 0.3rem 1.2rem 0.3rem;
    min-height: 180px;
  }
  .thankyou-title { font-size: 1.1rem; }
  .thankyou-desc { font-size: 0.95rem; }
  .thankyou-close-btn { font-size: 1rem; padding: 0.7rem 0; }
}
`;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
})();

// Initial render
renderSurvey();

