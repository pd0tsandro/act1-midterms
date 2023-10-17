class Entry {
    constructor(owner, car, licensePlate, plan, availDate) {
        this.owner = owner;
        this.car = car;
        this.licensePlate = licensePlate;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();

        if (plan === 'lifetime') {
            this.expirationDate = 'Lifetime';
        } else {
            if (isNaN(plan)) {
                this.expirationDate = 'Invalid Plan';
            } else {
                const planMonths = parseInt(plan);
                const expirationDate = new Date(year, month - 1 + planMonths, day);
                this.expirationDate = `${expirationDate.getFullYear()}-${String(expirationDate.getMonth() + 1).padStart(2, '0')}-${String(expirationDate.getDate()).padStart(2, '0')}`;
            }
        }

        this.availedDate = availDate;
    }
}

class UI {
    static displayEntries(entries) {
        entries.forEach((entry) => {
            UI.addEntryToTable(entry);
        });
    }

    static addEntryToTable(entry) {
        const tableBody = document.querySelector('#tableBody');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${entry.owner}</td>
        <td>${entry.car}</td>
        <td class="lp-data">${entry.licensePlate}</td>
        <td>${entry.availedDate}</td>
        <td>${entry.expirationDate || "N/A"}</td>
        <td class='text-center'>
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-sm btn-outline-danger rounded-0 p-1 d-flex align-items-center justify-content-center delete">
                    <span class="material-symbols-outlined fs-6">delete</span>
                </button>
            </div>
        </td>
    `;
        tableBody.appendChild(row);
        // Other code to handle actions

        UI.deleteEntry(row.querySelector('.delete'));
    }
    static clearInput() {
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach((input) => input.value = "");
    }

    static parkOut(target) {
        target.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm(`Are you sure to mark this car as expired? This action cannot be undone.`) === false)
                return false;
            var licensePlate = target.closest('tr').querySelector('.lp-data').innerText;
            var entry = Store.getEntry(licensePlate);
            var now = new Date();
            var year = now.getFullYear();
            var day = now.getDate();
            var month = now.getMonth() + 1;
            var hours = now.getHours();
            var minutes = now.getMinutes();
            var sec = now.getSeconds();
            day = String(day).padStart(2, '0');
            month = String(month).padStart(2, '0');
            hours = hours > 12 ? hours - 12 : hours;
            hours = String(hours).padStart(2, '0');
            minutes = String(minutes).padStart(2, '0');
            sec = String(sec).padStart(2, '0');
            entry.expirationDate = `${year}-${month}-${day} ${hours}:${minutes}:${sec}`;
            Store.updateEntry(licensePlate, entry);
            target.closest('tr').querySelector('td:nth-child(5)').innerText = entry.expirationDate;
            target.setAttribute('disabled', true);
            this.showAlert(`Car with [${licensePlate}] License Plate has expired from the parking lot.`, 'success');
        });
    }

    static deleteEntry(target) {
        console.log("Delete button clicked");
        target.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm(`Are you sure to delete this data? This action cannot be undone.`) === false) {
                return;
            }
            const licensePlate = target.closest('tr').querySelector('.lp-data').innerText;
            Store.removeEntries(licensePlate); // Remove from localStorage
            target.closest('tr').remove(); // Remove from the table
            UI.showAlert('Car successfully removed from the parking lot list', 'success');
        });
    }
    

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className} px-2 py-1 rounded-0`;
        div.appendChild(document.createTextNode(message));
        const msgContainer = document.getElementById('msg');
        msgContainer.innerHTML = '';
        msgContainer.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }

    static validateInputs() {
        const owner = document.querySelector('#owner').value;
        const car = document.querySelector('#car').value;
        const licensePlate = document.querySelector('#licensePlate').value;
        if (owner === '' || car === '' || licensePlate === '') {
            UI.showAlert('All fields must be filled!', 'danger');
            return false;
        }
        return true;
    }
}

class Store {
    static getEntries() {
        const jsonData = localStorage.getItem('entries');
        return jsonData ? JSON.parse(jsonData) : [];
    }

    static saveEntries(entries) {
        localStorage.setItem('entries', JSON.stringify(entries));
    }


    static addEntries(entry) {
        const entries = Store.getEntries();
        entries.push(entry);
        localStorage.setItem('entries', JSON.stringify(entries));
    }


    static removeEntries(licensePlate) {
        const entries = Store.getEntries();
        entries.forEach((entry, index) => {
            if (entry.licensePlate === licensePlate) {
                entries.splice(index, 1);
            }
        });
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    static getEntry(licensePlate) {
        const entries = Store.getEntries();
        var selectedEntry = {};
        entries.forEach((entry, index) => {
            if (entry.licensePlate === licensePlate) {
                selectedEntry = entry;
            }
        });
        return selectedEntry;
    }

    static updateEntry(licensePlate, data) {
        const entries = Store.getEntries();
        entries.forEach((entry, index) => {
            if (entry.licensePlate === licensePlate) {
                entries[index] = data;
            }
        });
        localStorage.setItem('entries', JSON.stringify(entries));
    }
}


function loadCarData() {
    fetch('json/cars.json') 
        .then((response) => response.json())
        .then((data) => {
            const carDropdown = document.querySelector('#car');
            carDropdown.innerHTML = '<option value="">Select a Car</option>';
            data.forEach((carEntry) => {
                const car = carEntry.car;
                const option = document.createElement('option');
                option.value = car;
                option.text = car;
                carDropdown.appendChild(option);
            });
        })
        .catch((error) => console.error('Error loading car data:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    loadCarData();
    const entries = Store.getEntries();
    UI.displayEntries(entries);
    const searchInput = document.querySelector('#searchInput');
    const savedSearchValue = localStorage.getItem('searchValue');
    if (savedSearchValue) {
        searchInput.value = savedSearchValue;
        searchInput.dispatchEvent(new Event('keyup'));
    }
});




document.querySelector('#entryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const owner = document.querySelector('#owner').value;
    const car = document.querySelector('#car').value;
    const licensePlate = document.querySelector('#licensePlate').value;
    const plan = document.querySelector('#plan').value;

    if (!UI.validateInputs()) {
        return;
    }

    const availDate = document.querySelector('#availDate').value;

    const entry = new Entry(owner, car, licensePlate, plan, availDate);
    Store.addEntries(entry);

    UI.clearInput();
    UI.showAlert('Car successfully added to the parking lot', 'success');

    // Reload the page to display the updated data
    location.reload();
});

    document.querySelector('#tableBody').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        UI.deleteEntry(e.target);
    }
    });
        
    

    document.querySelector('#searchInput').addEventListener('keyup', function searchTable() {
        const searchValue = document.querySelector('#searchInput').value.trim().toUpperCase();
        const tableRows = document.querySelectorAll('#tableBody tr');
    
        localStorage.setItem('searchValue', searchValue);
        tableRows.forEach((row) => {
            const rowDataCells = row.querySelectorAll('td');
            let matchFound = false;
    
            rowDataCells.forEach((cell, index) => {
                if (index < rowDataCells.length - 1) {
                    const cellText = cell.textContent.toUpperCase();
                    if (cellText.startsWith(searchValue)) {
                        matchFound = true;
                    }
                }
            });
    
            if (matchFound) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    function sortTableByExpiration(sortOrder) {
        const table = document.querySelector('#parkingTable');
        const tableBody = table.querySelector('tbody');
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const dateA = new Date(a.cells[4].textContent);
            const dateB = new Date(b.cells[4].textContent);
            
            if (sortOrder === 'farthest') {
                return dateB - dateA; // Sort by farthest expiration date
            } else {
                return dateA - dateB; // Sort by nearest expiration date (default)
            }
        });
    
        tableBody.innerHTML = '';
        rows.forEach(row => tableBody.appendChild(row));
    }
    
  
    document.querySelector('#sortExpirationSelect').addEventListener('change', function() {
        const selectedOption = this.value;
        sortTableByExpiration(selectedOption);
    });
