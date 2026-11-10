// Client-side validation only. No form values are stored or sent from this page.
function showFormSuccess(form, message) {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  message.hidden = false;
  message.focus?.();
  form.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(form => {
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('invalid', () => field.closest('.form-field')?.classList.add('is-invalid'));
      field.addEventListener('input', () => field.closest('.form-field')?.classList.remove('is-invalid'));
      field.addEventListener('change', () => field.closest('.form-field')?.classList.remove('is-invalid'));
    });
  });

  const membershipForm = document.querySelector('#membership-form');
  const membershipSuccess = document.querySelector('#membership-success');
  if (membershipForm && membershipSuccess) {
    membershipForm.addEventListener('submit', event => {
      event.preventDefault();
      showFormSuccess(membershipForm, membershipSuccess);
    });
  }

  const contactForm = document.querySelector('#contact-form');
  const contactSuccess = document.querySelector('#contact-success');
  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      showFormSuccess(contactForm, contactSuccess);
    });
  }
});

// TODO [EDIT ME]: Connect a secure Formspree, EmailJS, or Google Forms endpoint before launch.