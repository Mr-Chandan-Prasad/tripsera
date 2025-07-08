localStorage.setItem('destinations', JSON.stringify([{ name: "Goa", desc: "Beaches", price: 5000, image: "https://via.placeholder.com/300" }]));
localStorage.setItem('newDestinations', JSON.stringify([{ name: "Kerala", desc: "Backwaters", price: 6000, image: "https://via.placeholder.com/300" }]));
localStorage.setItem('offers', JSON.stringify([{ title: "Summer Deal", desc: "20% off", price: 3000, image: "https://via.placeholder.com/300" }]));
localStorage.setItem('advertisements', JSON.stringify([{ title: "Ad 1", desc: "Visit now!", image: "https://via.placeholder.com/300" }]));
localStorage.setItem('gallery', JSON.stringify([{ title: "Beach", image: "https://via.placeholder.com/600x400" }]));
localStorage.setItem('testimonials', JSON.stringify([{ author: "John", text: "Great trip!" }]));

let token = localStorage.getItem('token') || null;

// Sidebar Toggle, Profile Dropdown, Menu Navigation, Login Logic, etc. remain unchanged...

// Data Management with Local Storage
function fetchData(endpoint, method = 'GET', body = null, id = null) {
    let data = JSON.parse(localStorage.getItem(endpoint)) || [];
    if (method === 'GET') {
        return Promise.resolve(data);
    } else if (method === 'POST') {
        const newItem = { _id: Date.now().toString(), ...body };
        data.push(newItem);
        localStorage.setItem(endpoint, JSON.stringify(data));
        return Promise.resolve(newItem);
    } else if (method === 'PUT' && id) {
        data = data.map(item => (item._id === id ? { ...item, ...body } : item));
        localStorage.setItem(endpoint, JSON.stringify(data));
        return Promise.resolve(data.find(item => item._id === id));
    } else if (method === 'DELETE' && id) {
        data = data.filter(item => item._id !== id);
        localStorage.setItem(endpoint, JSON.stringify(data));
        return Promise.resolve(null);
    }
    return Promise.resolve(data);
}

// Load All Data, Dashboard Stats, QR Code Management, Advertisements Management remain unchanged...

// New Destinations Management (Corrected)
function populateNewDestinationsSelect() {
    fetchData('destinations').then(destinations => {
        const select = document.getElementById('new-destination-select');
        if (!select) {
            console.error('Element with ID "new-destination-select" not found.');
            return;
        }
        select.innerHTML = '<option value="">Select a Destination</option>';
        destinations.forEach(dest => {
            select.innerHTML += `<option value="${dest._id}">${dest.name}</option>`;
        });
    }).catch(err => console.error('Error populating destinations:', err));
}

document.getElementById('new-destinations-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const destId = document.getElementById('new-destination-select').value;
    if (!destId) {
        alert('Please select a destination.');
        return;
    }
    fetchData('destinations').then(destinations => {
        const selectedDest = destinations.find(d => d._id === destId);
        if (!selectedDest) {
            alert('Selected destination not found.');
            return;
        }
        fetchData('newDestinations').then(newDestinations => {
            if (!newDestinations.some(d => d._id === selectedDest._id)) {
                newDestinations.unshift(selectedDest);
                if (newDestinations.length > 3) newDestinations.pop();
                localStorage.setItem('newDestinations', JSON.stringify(newDestinations));
                renderNewDestinations();
                alert('New destination added successfully!');
            } else {
                alert('This destination is already in the new destinations list.');
            }
        });
    }).catch(err => console.error('Error adding new destination:', err));
});

function renderNewDestinations() {
    populateNewDestinationsSelect();
    fetchData('newDestinations').then(newDestinations => {
        const list = document.getElementById('new-destinations-items');
        if (!list) {
            console.error('Element with ID "new-destinations-items" not found.');
            return;
        }
        list.innerHTML = '';
        if (!newDestinations.length) {
            list.innerHTML = '<p class="text-gray-600">No new destinations yet.</p>';
        } else {
            newDestinations.forEach(dest => {
                list.innerHTML += `
                    <div class="flex justify-between items-center border-b pb-2">
                        <div class="flex items-center space-x-4">
                            <img src="${dest.image || 'https://via.placeholder.com/150'}" alt="${dest.name}" class="w-16 h-16 object-cover rounded-md">
                            <div>
                                <p class="font-semibold text-gray-800">${dest.name}</p>
                                <p class="text-sm text-gray-600">${dest.desc || 'N/A'}</p>
                            </div>
                        </div>
                        <button class="delete-new-dest text-red-600 hover:text-red-800" data-id="${dest._id}"><i class="fas fa-trash"></i></button>
                    </div>`;
            });
        }
        attachDeleteListeners('delete-new-dest', deleteNewDestination);
    }).catch(err => console.error('Error rendering new destinations:', err));
}

function deleteNewDestination(id) {
    if (confirm('Are you sure?')) {
        fetchData('newDestinations').then(newDestinations => {
            const updatedDestinations = newDestinations.filter(dest => dest._id !== id);
            localStorage.setItem('newDestinations', JSON.stringify(updatedDestinations));
            renderNewDestinations();
        }).catch(err => console.error('Error deleting new destination:', err));
    }
}

// Offers Management, Bookings Management, Customers Management, etc. remain unchanged...

// Helper Functions
function attachDeleteListeners(className, deleteFunction) {
    document.querySelectorAll(`.${className}`).forEach(button => {
        button.removeEventListener('click', handleDelete);
        button.addEventListener('click', handleDelete);
        function handleDelete() {
            const id = button.getAttribute('data-id');
            deleteFunction(id);
        }
    });
}

// Other helper functions (attachMarkPaidListeners, attachPaymentProofListeners) and initialization remain unchanged...

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadAllData();
    }
    loadQrPreview();
    populateBookingOptions();
});



JSON.parse(localStorage.getItem('destinations'))