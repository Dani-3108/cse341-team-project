const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};
const fillFilterOptions = (selectEl, values, selectedValue) => {
    if (!selectEl) {
        return;
    }

    values.forEach((value) => {
        const optionEl = document.createElement('option');
        optionEl.value = value;
        optionEl.textContent = value.charAt(0).toUpperCase() + value.slice(1);
        selectEl.appendChild(optionEl);
    });

    if (values.includes(selectedValue)) {
        selectEl.value = selectedValue;
    }
};

const hookTripsCatalog = async () => {
    const listEl = document.getElementById('trips-list');
    const templateEl = document.getElementById('trip-card-template');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status})`);
        }

        const payload = await response.json();
        const trips = payload.trips || [];
        const fragment = document.createDocumentFragment();

        const params = new URLSearchParams(window.location.search);
        const regions = [...new Set(trips.map((trip) => trip.region))];
        const seasons = [...new Set(trips.map((trip) => trip.bestSeason))];

        fillFilterOptions(document.getElementById('region-filter'), regions, params.get('region'));
        fillFilterOptions(document.getElementById('season-filter'), seasons, params.get('season'));

        const selectedRegion = params.get('region');
        const selectedSeason = params.get('season');

        const visibleTrips = trips.filter((trip) => {
            const matchesRegion = !selectedRegion || selectedRegion === 'all' || trip.region === selectedRegion;
            const matchesSeason = !selectedSeason || selectedSeason === 'all' || trip.bestSeason === selectedSeason;
            return matchesRegion && matchesSeason;
        });

        visibleTrips.forEach((trip) => {
            const card = templateEl.content.cloneNode(true);

            card.querySelector('[data-field="card"]').classList.add(trip.region);
            card.querySelector('[data-field="name"]').textContent = trip.name;
            card.querySelector('[data-field="region"]').textContent = trip.region;
            card.querySelector('[data-field="start"]').textContent = trip.startStation;
            card.querySelector('[data-field="end"]').textContent = trip.endStation;
            card.querySelector('[data-field="duration"]').textContent = trip.duration;
            card.querySelector('[data-field="distance"]').textContent = `${trip.distance}km`;
            card.querySelector('[data-field="description"]').textContent = trip.description;

            const seasonEl = card.querySelector('[data-field="season"]');
            seasonEl.classList.add(`season-${trip.bestSeason}`);
            seasonEl.textContent = `Best in ${trip.bestSeason}`;

            card.querySelector('[data-field="link"]').href = `/trips/${trip.id}`;

            const highlightsEl = card.querySelector('[data-field="highlights"]');
            trip.highlights.forEach((highlight) => {
                const tagEl = document.createElement('span');
                tagEl.className = 'highlight-tag';
                tagEl.textContent = highlight;
                highlightsEl.appendChild(tagEl);
            });

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trips right now. Please try again in a moment.';
        }
    }
};

const hookTripSchedules = () => {
    const sectionEl = document.getElementById('trip-schedules');
    if (!sectionEl) {
        return;
    }

    const tripId = sectionEl.dataset.tripId;
    const monthSelectEl = document.getElementById('schedule-month');
    const listEl = document.getElementById('schedules-list');
    const templateEl = document.getElementById('schedule-card-template');
    const loadingEl = document.getElementById('schedules-loading');
    const emptyEl = document.getElementById('schedules-empty');
    const errorEl = document.getElementById('schedules-error');

    const loadSchedules = async () => {
        loadingEl.hidden = false;
        emptyEl.hidden = true;
        errorEl.hidden = true;

        const query = monthSelectEl.value ? `?month=${encodeURIComponent(monthSelectEl.value)}` : '';

        try {
            const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}/schedules${query}`);
            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const payload = await response.json();
            const schedules = payload.schedules || [];
            const fragment = document.createDocumentFragment();

            schedules.forEach((schedule) => {
                const card = templateEl.content.cloneNode(true);

                card.querySelector('[data-field="departure"]').textContent = schedule.departureTime;
                card.querySelector('[data-field="arrival"]').textContent = schedule.arrivalTime;

                const daysEl = card.querySelector('[data-field="days"]');
                schedule.daysOfWeek.forEach((day) => {
                    const dayEl = document.createElement('span');
                    dayEl.className = 'day-badge';
                    dayEl.textContent = day.substring(0, 3);
                    daysEl.appendChild(dayEl);
                });

                const bookEl = card.querySelector('[data-field="book"]');
                const unavailableEl = card.querySelector('[data-field="unavailable"]');
                if (schedule.status) {
                    bookEl.href = `/trips/booking/${schedule.id}`;
                } else {
                    bookEl.hidden = true;
                    unavailableEl.hidden = false;
                }

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);
            emptyEl.hidden = schedules.length > 0;
        } catch {
            listEl.replaceChildren();
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load schedules right now. Please try again in a moment.';
        } finally {
            loadingEl.hidden = true;
        }
    };

    monthSelectEl.addEventListener('change', loadSchedules);
    loadSchedules();
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripsCatalog();
    hookTripSchedules();
    hookBookingsAdmin();
});

const hookBookingsAdmin = async () => {
    const sectionEl = document.getElementById('bookings-admin');

    if (!sectionEl) {
        return;
    }

    const listEl = sectionEl.querySelector('#bookings-list');
    const templateEl = sectionEl.querySelector('#booking-template');
    const loadingEl = sectionEl.querySelector('#bookings-loading');
    const emptyEl = sectionEl.querySelector('#bookings-empty');
    const errorEl = sectionEl.querySelector('#bookings-error');

    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
            throw new Error(`Failed to load bookings`);
        }

        const { bookings } = await response.json();

        if (bookings.length === 0) {
            emptyEl.hidden = false;
            return;
        }
        
        const fragment = document.createDocumentFragment();

        bookings.forEach((booking) => {
            const clone = templateEl.content.cloneNode(true);

            clone.querySelector('.booking-id').textContent = booking.id;
            clone.querySelector('.booking-trip').textContent = booking.trip;
            clone.querySelector('.booking-schedule').textContent = booking.schedule;
            clone.querySelector('.booking-class').textContent = booking.class;
            clone.querySelector('.booking-day').textContent = booking.day;
            clone.querySelector('.booking-date').textContent = booking.createdAt;

            const passengersEl = clone.querySelector('.booking-passengers');
            booking.passengers.forEach((passenger) => {
                const li = document.createElement('li');
                li.textContent = `${passenger.firstName} ${passenger.lastName}`;
                passengersEl.appendChild(li);
            });

            fragment.appendChild(clone);
        });

        listEl.replaceChildren(fragment);
    } catch (error) {
        console.error('Error loading bookings', error);
        errorEl.hidden = false;
    } finally {
        loadingEl.hidden = true;
    }
};