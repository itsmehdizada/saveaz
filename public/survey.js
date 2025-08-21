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
    question: 'Vebsaytda olmayan, amma sənin istədiyin hər hansı bir şey varmı?',
    required: false,
    placeholder: 'Vebsaytdan istifadəni daha maraqlı edəcək bir funksiya...'
  },
  {
    id: 'q4',
    type: 'radio',
    question: 'Tələbə endirimlərindən istifadə edirsən?',
    options: [
      "Tez-tez",
      'Xəbərim olsa edərəm',
      'Nadir hallarda',
      'İstifadə etmirəm',
    ],
    required: true,
  },
  {
    id: 'q5',
    type: 'radio',
    question: 'Bu vebsayt ilə endirimlərdən daha çox istifadə edəcəyini düşünürsən?',
    options: [
      "Bəli",
      'Xeyr, çünki...'
    ],
    required: true
  },
  {
    id: 'q6',
    type: 'checkbox',
    question: 'Sənin üçün ən vacib kateqoriyalar hansılardır?',
    required: true,
    options: [
      'Yemək',
      'Əyləncə',
      'Geyim',
      'Təhsil',
      'Kofe'
    ]
  },
  {
    id: 'q7',
    type: 'textarea',
    question: 'Əlavə kateqoriya təklifin var?',
    required: false,
    placeholder: "Fərqli kateqoriya..."
  },
  {
    id: 'q8',
    type: 'textarea',
    question: 'Vebsaytdan hansı situasiyalarda istifadə etməyi düşünürsən?',
    required: false,
    placeholder: "Universitet çıxışı yemək məkanı axtararkən..."
  },
  {
    id: 'q9',
    type: 'radio',
    question: 'Əvvəlcədən yoxsa məkana getmədən az əvvəl endirim axtarmağı üstün tutursan',
    required: true,
    options: [
      'Evdə/Əvvəlcədən',
      'Məkana gedərkən',
      'Hər ikisi'
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
      // Add hidden text input for "Digər" option or options containing "çünki"
      if (q.options.includes('Digər') || q.options.some(opt => opt.includes('çünki'))) {
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
      // Add hidden text input for "Digər" option or options containing "çünki"
      if (q.options.includes('Digər') || q.options.some(opt => opt.includes('çünki'))) {
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

  // Show/hide text input when "Digər" or options containing "çünki" are selected
  const inputs = form.querySelectorAll(`input[name="${q.id}"]`);
  const otherInput = form.querySelector('.other-input');

  if (otherInput) {
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const shouldShowInput = input.value === 'Digər' || input.value.includes('çünki');
        
        if (shouldShowInput && input.checked) {
          otherInput.style.display = 'block';
          otherInput.focus();
        } else if (input.type === 'radio') {
          otherInput.style.display = 'none';
          otherInput.value = '';
        } else if (input.type === 'checkbox') {
          // For checkbox, check if any "Digər" or "çünki" checkbox is checked
          const anySpecialChecked = Array.from(inputs).some(i => 
            (i.value === 'Digər' || i.value.includes('çünki')) && i.checked
          );
          if (anySpecialChecked) {
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
      const shouldUseOtherInput = checked && (checked.value === 'Digər' || checked.value.includes('çünki'));
      if (shouldUseOtherInput && otherInput) {
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
      
      // Handle both "Digər" and options containing "çünki"
      const specialOptions = checkedValues.filter(val => val === 'Digər' || val.includes('çünki'));
      if (specialOptions.length > 0 && otherInput) {
        const otherVal = otherInput.value.trim();
        if (q.required && !otherVal) {
          otherInput.classList.add('survey-error');
          return;
        }
        // Replace special options with the actual input value
        specialOptions.forEach(specialOpt => {
          const index = checkedValues.indexOf(specialOpt);
          checkedValues[index] = otherVal;
        });
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
      submitSurveyAnswers(); // <-- send answers to Google Sheets
      showThankYou();
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

const GOOGLE_SCRIPT_URL_FORM = 'https://script.google.com/macros/s/AKfycbwJ_8EoXO7hyvovtqh0rtYemUSanZ0FXQjVJUMjg0dqrv7jrXooh-gzgyrLakKPW9C8/exec';

function generateUserId() {
    let userId = sessionStorage.getItem('survey_user_id');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('survey_user_id', userId);
    }
    return userId;
}

async function submitSurveyAnswers() {
    console.log('Submitting survey answers:', surveyState.answers);

    try {
        await fetch(GOOGLE_SCRIPT_URL_FORM, {
            method: 'POST',
            mode: 'no-cors', // fire-and-forget
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: generateUserId(),
                ...surveyState.answers
            })
        });

        console.log('Survey answers sent (no-cors fire-and-forget)');
    } catch (error) {
        console.error('Error submitting survey:', error);
    }
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


// ------------------------------------------------------------------------------------------------------- //


// Your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4qHrBR7Ca1SwnZgimF_9NSRHV8zrSZ5aHEJsauKR8Wxf_Qt8f9ExzSs0oyu0wrNFdEw/exec';

class RatingModal {
    constructor() {
        this.modal = document.getElementById('ratingModal');
        this.stars = document.querySelectorAll('.rating-star');
        this.submitButton = document.querySelector('.rating-submit');
        this.selectedRating = 0;
        
        this.init();
    }
    
    init() {
        if (!this.modal) {
            console.error('Rating modal not found!');
            return;
        }
        
        // Add event listeners to stars
        this.stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.selectRating(parseInt(e.target.dataset.value));
            });
            
            star.addEventListener('mouseover', (e) => {
                this.hoverRating(parseInt(e.target.dataset.value));
            });
        });
        
        // Reset stars on mouse leave
        const starsContainer = document.querySelector('.rating-stars');
        if (starsContainer) {
            starsContainer.addEventListener('mouseleave', () => {
                this.updateStarDisplay(this.selectedRating);
            });
        }
        
        // Submit button
        if (this.submitButton) {
            this.submitButton.addEventListener('click', () => {
                this.submitRating();
            });
        }
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }
    
    selectRating(rating) {
        this.selectedRating = rating;
        this.updateStarDisplay(rating);
        
        // Enable submit button
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.style.opacity = '1';
        }
    }
    
    hoverRating(rating) {
        this.updateStarDisplay(rating);
    }
    
    updateStarDisplay(rating) {
        this.stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
                star.classList.add('active');
            } else {
                star.style.color = '#ddd';
                star.classList.remove('active');
            }
        });
    }
    
    async submitRating() {
      if (this.selectedRating === 0) {
          this.showMessage('Please select a rating first!', 'error');
          return;
      }
      
      console.log('Submitting rating:', this.selectedRating);
      
      // Disable submit button to prevent double submission
      this.submitButton.disabled = true;
      this.submitButton.textContent = 'Submitting...';
      this.submitButton.style.opacity = '0.6';
      
      try {
          // Method 1: Try with form data and no-cors mode
          const formData = new FormData();
          formData.append('rating', this.selectedRating);
          formData.append('userId', this.generateUserId());
          formData.append('url', window.location.href);
          formData.append('userAgent', navigator.userAgent);
          formData.append('referrer', document.referrer);
          
          console.log('Sending to:', GOOGLE_SCRIPT_URL);
          
          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors', // This bypasses CORS but limits response access
              body: formData
          });
          
          // With no-cors mode, we can't read the response
          // So we'll assume success if no error was thrown
          console.log('Request sent successfully (no-cors mode)');
          this.showSuccessMessage();
          
          // Close modal after delay
          setTimeout(() => {
              this.closeModal();
          }, 2500);
          
      } catch (error) {
          console.error('Error submitting rating:', error);
          
          // Try fallback method with JSONP
          try {
              console.log('Trying fallback JSONP method...');
              await this.submitRatingJSONP();
          } catch (jsonpError) {
              console.error('JSONP method also failed:', jsonpError);
              this.showMessage('Failed to submit rating. Please try again.', 'error');
              
              // Re-enable submit button
              this.submitButton.disabled = false;
              this.submitButton.textContent = 'Submit';
              this.submitButton.style.opacity = '1';
          }
      }
  }
  
  // Add this new function to your JavaScript class
  submitRatingJSONP() {
      return new Promise((resolve, reject) => {
          // Create a unique callback name
          const callbackName = 'ratingCallback_' + Date.now();
          
          // Create the callback function
          window[callbackName] = (data) => {
              // Clean up
              document.head.removeChild(script);
              delete window[callbackName];
              
              if (data.status === 'success') {
                  this.showSuccessMessage();
                  setTimeout(() => {
                      this.closeModal();
                  }, 2500);
                  resolve(data);
              } else {
                  reject(new Error(data.message || 'Unknown error'));
              }
          };
          
          // Build the URL with parameters
          const params = new URLSearchParams({
              rating: this.selectedRating,
              userId: this.generateUserId(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              callback: callbackName
          });
          
          // Create script element
          const script = document.createElement('script');
          script.src = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
          script.onerror = () => {
              document.head.removeChild(script);
              delete window[callbackName];
              reject(new Error('Network error'));
          };
          
          // Add to head to trigger the request
          document.head.appendChild(script);
          
          // Timeout after 10 seconds
          setTimeout(() => {
              if (window[callbackName]) {
                  document.head.removeChild(script);
                  delete window[callbackName];
                  reject(new Error('Request timeout'));
              }
          }, 10000);
      });
  }
    
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = this.modal.querySelector('.rating-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'rating-message';
            this.modal.querySelector('.rating-modal-card').appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.className = `rating-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide after 3 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (messageEl) {
                    messageEl.style.display = 'none';
                }
            }, 3000);
        }
    }
    
    showSuccessMessage() {
        const modalCard = this.modal.querySelector('.rating-modal-card');
        modalCard.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✓</div>
                <h3>Thank you!</h3>
                <p>Your ${this.selectedRating}-star rating has been submitted successfully.</p>
            </div>
        `;
    }
    
    generateUserId() {
        // Generate a unique user ID for tracking (stored in session)
        let userId = sessionStorage.getItem('rating_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('rating_user_id', userId);
        }
        return userId;
    }
    
    openModal() {
        this.modal.style.display = 'flex';
        this.resetModal();
        
        // Focus first star for accessibility
        if (this.stars.length > 0) {
            this.stars[0].focus();
        }
    }
    
    closeModal() {
        this.modal.style.display = 'none';
        this.resetModal();
    }
    
    resetModal() {
        // Reset rating selection
        this.selectedRating = 0;
        this.updateStarDisplay(0);
        
        // Reset submit button
        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = 'Submit';
            this.submitButton.style.opacity = '0.6';
        }
        
        // Hide any messages
        const messageEl = this.modal.querySelector('.rating-message');
        if (messageEl) {
            messageEl.style.display = 'none';
        }
        
        // Reset modal content if showing success
        const modalCard = this.modal.querySelector('.rating-modal-card');
        if (modalCard.querySelector('.success-message')) {
            modalCard.innerHTML = `
                <h3 id="ratingModalTitle" class="rating-modal-title">Rate your discount</h3>
                <p class="rating-modal-subtitle">How was your experience?</p>
                <div class="rating-stars" aria-label="Choose your rating">
                    <button type="button" class="rating-star" data-value="1" aria-label="1 star">★</button>
                    <button type="button" class="rating-star" data-value="2" aria-label="2 stars">★</button>
                    <button type="button" class="rating-star" data-value="3" aria-label="3 stars">★</button>
                    <button type="button" class="rating-star" data-value="4" aria-label="4 stars">★</button>
                    <button type="button" class="rating-star" data-value="5" aria-label="5 stars">★</button>
                </div>
                <button type="button" class="rating-submit">Submit</button>
            `;
            
            // Re-initialize after resetting HTML
            this.stars = modalCard.querySelectorAll('.rating-star');
            this.submitButton = modalCard.querySelector('.rating-submit');
            this.init();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the rating modal
    window.ratingModal = new RatingModal();
    
    console.log('Rating modal initialized');
});

// Function to show the rating modal (call this from anywhere)
function showRatingModal() {
    if (window.ratingModal) {
        window.ratingModal.openModal();
    } else {
        console.error('Rating modal not initialized yet');
    }
}

// Function to close the rating modal (call this from anywhere)
function closeRatingModal() {
    if (window.ratingModal) {
        window.ratingModal.closeModal();
    }
}

// Example: Show modal after 5 seconds (remove this if you don't want it)
// setTimeout(showRatingModal, 5000);
