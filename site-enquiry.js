document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.site-enquiry-form, .site-enquiry-existing').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const service = String(fields.get('service') || 'Website enquiry');
      const lines = ['Name: ' + (fields.get('name') || ''), 'Email: ' + (fields.get('email') || ''), 'Phone: ' + (fields.get('phone') || ''), 'Service: ' + service, '', String(fields.get('message') || ''), '', 'Page: ' + document.title];
      const url = 'mailto:enquiry@globaladvertisingmedia.in?subject=' + encodeURIComponent('Website enquiry: ' + service) + '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = url;
      const status = form.querySelector('.site-enquiry-status, .form-note');
      if (status) status.textContent = 'Your enquiry is ready in your email app. Please review and send it. If no app opens, email enquiry@globaladvertisingmedia.in directly.';
    });
  });
});
