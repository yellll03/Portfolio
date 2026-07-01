(function () {
  'use strict';

  const storageKey = 'campus-event-portfolio-demo-v1';
  const today = startOfDay(new Date());
  let pendingDeleteId = null;
  let toastTimer = null;

  const elements = {
    form: document.getElementById('event-form'),
    id: document.getElementById('event-id'),
    name: document.getElementById('event-name'),
    type: document.getElementById('event-type'),
    venue: document.getElementById('event-venue'),
    date: document.getElementById('event-date'),
    organizer: document.getElementById('event-organizer'),
    table: document.getElementById('events-table'),
    empty: document.getElementById('empty-state'),
    search: document.getElementById('event-search'),
    typeFilter: document.getElementById('type-filter'),
    modal: document.getElementById('delete-modal'),
    toast: document.getElementById('toast')
  };

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function sampleEvents() {
    return [
      { id: 1, name: 'Student Leadership Summit', type: 'Student Life', venue: 'University Auditorium', date: toIsoDate(addDays(today, 4)), organizer: 'Student Council' },
      { id: 2, name: 'Technology Career Fair', type: 'Career', venue: 'Main Gymnasium', date: toIsoDate(addDays(today, 9)), organizer: 'Career Services' },
      { id: 3, name: 'Research Colloquium', type: 'Academic', venue: 'AVR 3', date: toIsoDate(addDays(today, 15)), organizer: 'Research Office' },
      { id: 4, name: 'Campus Arts Night', type: 'Arts & Culture', venue: 'Open Grounds', date: toIsoDate(addDays(today, 22)), organizer: 'Arts Society' },
      { id: 5, name: 'Community Outreach Day', type: 'Community', venue: 'Barangay Hall', date: toIsoDate(addDays(today, 31)), organizer: 'Volunteer Corps' },
      { id: 6, name: 'University Sports Fest', type: 'Sports', venue: 'Sports Complex', date: toIsoDate(addDays(today, 43)), organizer: 'Athletics Office' }
    ];
  }

  function loadEvents() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(stored)) return stored;
    } catch (error) {
      // The demo works without storage when browser privacy settings block it.
    }
    return sampleEvents();
  }

  let events = loadEvents();

  function saveEvents() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) {
      // Keep the current in-memory session functional.
    }
  }

  function formatDate(value, options) {
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString(undefined, options || { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getFilteredEvents() {
    const query = elements.search.value.trim().toLowerCase();
    const selectedType = elements.typeFilter.value;

    return events
      .filter((event) => {
        const haystack = `${event.name} ${event.venue} ${event.organizer}`.toLowerCase();
        return (!query || haystack.includes(query)) && (!selectedType || event.type === selectedType);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function updateSummary() {
    const month = today.getMonth();
    const year = today.getFullYear();
    const upcoming = events.filter((event) => new Date(`${event.date}T00:00:00`) >= today);
    const thisMonth = events.filter((event) => {
      const date = new Date(`${event.date}T00:00:00`);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    document.getElementById('total-events').textContent = events.length;
    document.getElementById('month-events').textContent = thisMonth.length;
    document.getElementById('upcoming-events').textContent = upcoming.length;
    document.getElementById('organizer-count').textContent = new Set(events.map((event) => event.organizer.toLowerCase())).size;
    document.getElementById('month-label').textContent = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  function renderCalendar() {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const eventDays = new Set(
      events
        .map((event) => new Date(`${event.date}T00:00:00`))
        .filter((date) => date.getMonth() === month && date.getFullYear() === year)
        .map((date) => date.getDate())
    );

    document.getElementById('calendar-title').textContent = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const cells = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push('<span class="calendar-day muted" aria-hidden="true"></span>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const classes = ['calendar-day'];
      if (day === today.getDate()) classes.push('today');
      if (eventDays.has(day)) classes.push('has-event');
      cells.push(`<span class="${classes.join(' ')}">${day}</span>`);
    }

    document.getElementById('calendar-grid').innerHTML = cells.join('');

    const next = events
      .filter((event) => new Date(`${event.date}T00:00:00`) >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    document.getElementById('next-event-card').innerHTML = next
      ? `<strong>${escapeHtml(next.name)}</strong><span>${formatDate(next.date, { weekday: 'short', month: 'short', day: 'numeric' })} · ${escapeHtml(next.venue)}</span>`
      : '<span>No upcoming events scheduled.</span>';
  }

  function renderTable() {
    const filtered = getFilteredEvents();
    document.getElementById('result-count').textContent = `${filtered.length} of ${events.length} event${events.length === 1 ? '' : 's'}`;
    elements.empty.hidden = filtered.length !== 0;
    elements.table.parentElement.parentElement.hidden = filtered.length === 0;

    elements.table.innerHTML = filtered.map((event) => `
      <tr>
        <td data-label="Event"><strong>${escapeHtml(event.name)}</strong></td>
        <td data-label="Type"><span class="type-pill">${escapeHtml(event.type)}</span></td>
        <td data-label="Venue">${escapeHtml(event.venue)}</td>
        <td data-label="Date">${formatDate(event.date)}</td>
        <td data-label="Organizer">${escapeHtml(event.organizer)}</td>
        <td data-label="Actions">
          <div class="row-actions">
            <button type="button" data-edit="${event.id}">Edit</button>
            <button class="delete" type="button" data-delete="${event.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderAll() {
    updateSummary();
    renderCalendar();
    renderTable();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = window.setTimeout(() => {
      elements.toast.hidden = true;
    }, 3200);
  }

  function clearValidation() {
    elements.form.querySelectorAll('input, select').forEach((field) => field.classList.remove('invalid'));
    elements.form.querySelectorAll('.field-error').forEach((error) => { error.textContent = ''; });
  }

  function validateForm() {
    clearValidation();
    let valid = true;
    const fields = [elements.name, elements.type, elements.venue, elements.date, elements.organizer];

    fields.forEach((field) => {
      const error = field.parentElement.querySelector('.field-error');
      if (!field.value.trim()) {
        field.classList.add('invalid');
        error.textContent = 'This field is required.';
        valid = false;
      } else if (field !== elements.type && field !== elements.date && field.value.trim().length < 3) {
        field.classList.add('invalid');
        error.textContent = 'Enter at least 3 characters.';
        valid = false;
      }
    });

    if (elements.date.value && new Date(`${elements.date.value}T00:00:00`) < today) {
      elements.date.classList.add('invalid');
      elements.date.parentElement.querySelector('.field-error').textContent = 'Choose today or a future date.';
      valid = false;
    }

    return valid;
  }

  function resetForm() {
    elements.form.reset();
    elements.id.value = '';
    elements.date.min = toIsoDate(today);
    document.getElementById('form-mode-label').textContent = 'Create record';
    document.getElementById('form-title').textContent = 'Add New Event';
    document.getElementById('submit-event').textContent = 'Add Event';
    document.getElementById('cancel-edit').hidden = true;
    clearValidation();
  }

  function beginEdit(id) {
    const event = events.find((item) => item.id === id);
    if (!event) return;

    elements.id.value = event.id;
    elements.name.value = event.name;
    elements.type.value = event.type;
    elements.venue.value = event.venue;
    elements.date.value = event.date;
    elements.organizer.value = event.organizer;
    document.getElementById('form-mode-label').textContent = 'Update record';
    document.getElementById('form-title').textContent = 'Edit Event';
    document.getElementById('submit-event').textContent = 'Save Changes';
    document.getElementById('cancel-edit').hidden = false;
    clearValidation();
    document.querySelector('.event-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    elements.name.focus({ preventScroll: true });
  }

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showToast('Please complete the highlighted fields.');
      return;
    }

    const record = {
      id: elements.id.value ? Number(elements.id.value) : Date.now(),
      name: elements.name.value.trim(),
      type: elements.type.value,
      venue: elements.venue.value.trim(),
      date: elements.date.value,
      organizer: elements.organizer.value.trim()
    };

    if (elements.id.value) {
      events = events.map((item) => item.id === record.id ? record : item);
      showToast('Event updated successfully.');
    } else {
      events.push(record);
      showToast('Event added successfully.');
    }

    saveEvents();
    resetForm();
    renderAll();
  });

  elements.table.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit]');
    const deleteButton = event.target.closest('[data-delete]');

    if (editButton) beginEdit(Number(editButton.dataset.edit));
    if (deleteButton) {
      pendingDeleteId = Number(deleteButton.dataset.delete);
      elements.modal.hidden = false;
      document.getElementById('confirm-delete').focus();
    }
  });

  document.getElementById('filter-form').addEventListener('submit', (event) => {
    event.preventDefault();
    renderTable();
  });

  elements.search.addEventListener('input', renderTable);
  elements.typeFilter.addEventListener('change', renderTable);

  document.getElementById('clear-filters').addEventListener('click', () => {
    elements.search.value = '';
    elements.typeFilter.value = '';
    renderTable();
  });

  document.getElementById('cancel-edit').addEventListener('click', resetForm);

  document.getElementById('cancel-delete').addEventListener('click', () => {
    pendingDeleteId = null;
    elements.modal.hidden = true;
  });

  document.getElementById('confirm-delete').addEventListener('click', () => {
    events = events.filter((event) => event.id !== pendingDeleteId);
    pendingDeleteId = null;
    elements.modal.hidden = true;
    saveEvents();
    resetForm();
    renderAll();
    showToast('Event deleted from the simulation.');
  });

  elements.modal.addEventListener('click', (event) => {
    if (event.target === elements.modal) {
      pendingDeleteId = null;
      elements.modal.hidden = true;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !elements.modal.hidden) {
      pendingDeleteId = null;
      elements.modal.hidden = true;
    }
  });

  document.getElementById('reset-demo').addEventListener('click', () => {
    events = sampleEvents();
    saveEvents();
    elements.search.value = '';
    elements.typeFilter.value = '';
    resetForm();
    renderAll();
    showToast('Demo data restored.');
  });

  document.getElementById('current-date').textContent = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  elements.date.min = toIsoDate(today);
  renderAll();
}());
