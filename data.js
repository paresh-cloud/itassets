/* =====================================================================
   data.js — Shared data layer for the IT Asset Management CRM
   Used by asset.html, user.html and ticket.html so that Assets,
   Assignments and Tickets are read from / written to the SAME
   localStorage records, instead of each page keeping its own copy.
   ===================================================================== */

const STORAGE_KEYS = {
    ASSETS: 'it_assets',
    ASSIGNMENTS: 'it_assignments',
    TICKETS: 'it_tickets'
};

/* ---------------- Default seed data (first run only) ---------------- */

const DEFAULT_ASSETS = [
    {
        id: 'AST-LAP-01', category: 'Laptop', brand: 'Dell', model: 'XPS 15', serial: 'SN-882910',
        location: 'Mumbai', status: 'Active', assignedTo: 'Suresh Patel',
        cost: '135000', purchaseDate: '2024-01-15', warranty: '3 Years', condition: 'Good',
        remarks: 'Primary workstation',
        specs: [
            { label: 'Outlook ID', value: 'john.doe@company.com' },
            { label: 'MAC ID', value: '00:1A:2B:3C:4D:5E' },
            { label: 'RAM', value: '32 GB DDR5' },
            { label: 'Storage', value: '1TB NVMe SSD' },
            { label: 'Processor', value: 'Intel Core i7 13th Gen' }
        ]
    },
    {
        id: 'AST-SYS-02', category: 'Desktop (System)', brand: 'HP', model: 'ProDesk 600', serial: 'SN-776655',
        location: 'Delhi', status: 'In Stock', assignedTo: 'Unassigned',
        cost: '65000', purchaseDate: '2023-11-20', warranty: '2 Years', condition: 'New',
        remarks: 'Finance team system',
        specs: [
            { label: 'Outlook ID', value: 'alice.smith@company.com' },
            { label: 'MAC ID', value: '11:22:33:44:55:66' },
            { label: 'RAM', value: '16GB DDR4' },
            { label: 'Storage', value: '512GB SSD' }
        ]
    },
    {
        id: 'AST-LAP-03', category: 'Laptop', brand: 'Lenovo', model: 'ThinkPad T14', serial: 'SN-994422',
        location: 'Mumbai', status: 'In Stock', assignedTo: 'Unassigned',
        cost: '95000', purchaseDate: '2024-02-01', warranty: '3 Years', condition: 'New',
        remarks: 'Stock Unit',
        specs: [
            { label: 'Outlook ID', value: 'user3@company.com' },
            { label: 'MAC ID', value: '00:1A:2B:3C:4D:99' }
        ]
    }
];

const DEFAULT_ASSIGNMENTS = [
    { id: 1, userName: 'Ramesh Kumar', userOutlook: 'ramesh@company.com', dept: 'Engineering', assetId: 'AST-LAP-01', startTime: '2025-01-15 09:00', stopTime: '2026-01-15 18:00', status: 'Stopped' },
    { id: 2, userName: 'Suresh Patel', userOutlook: 'suresh@company.com', dept: 'Marketing', assetId: 'AST-LAP-01', startTime: '2026-01-20 10:00', stopTime: 'Currently Active', status: 'Active' }
];

const DEFAULT_TICKETS = [
    { id: 'TCK-1001', userName: 'Suresh Patel', userEmail: 'suresh@company.com', assetId: 'AST-LAP-01', category: 'Hardware Failure', priority: 'High', description: 'Screen flickering intermittently during video calls.', createdDate: '2026-02-02 10:30', status: 'In Progress' },
    { id: 'TCK-1002', userName: 'Ramesh Kumar', userEmail: 'ramesh@company.com', assetId: 'AST-SYS-02', category: 'Software Issue', priority: 'Medium', description: 'Requires administrative rights for software installation.', createdDate: '2026-02-05 14:15', status: 'Open' }
];

/* Per-category extra spec fields, shared by the Add/Edit Asset form and CSV import */
const CATEGORY_SCHEMAS = {
    "Laptop": [
        { id: 'spec_outlook', label: 'Outlook ID', placeholder: 'e.g. user@company.com' },
        { id: 'spec_mac', label: 'MAC ID', placeholder: 'e.g. 00:1A:2B:3C:4D:5E' },
        { id: 'spec_ram', label: 'RAM', placeholder: 'e.g. 16GB / 32GB' },
        { id: 'spec_storage', label: 'Storage', placeholder: 'e.g. 512GB SSD' },
        { id: 'spec_processor', label: 'Processor', placeholder: 'e.g. Intel i7 / M2' },
        { id: 'spec_os', label: 'Operating System', placeholder: 'e.g. Windows 11 / macOS' }
    ],
    "Desktop (System)": [
        { id: 'spec_outlook', label: 'Outlook ID', placeholder: 'e.g. user@company.com' },
        { id: 'spec_mac', label: 'MAC ID', placeholder: 'e.g. 00:1A:2B:3C:4D:5E' },
        { id: 'spec_ram', label: 'RAM', placeholder: 'e.g. 32GB DDR4' },
        { id: 'spec_storage', label: 'Storage', placeholder: 'e.g. 1TB SSD' },
        { id: 'spec_gpu', label: 'Graphics Card', placeholder: 'e.g. RTX 3060' }
    ],
    "Printer": [
        { id: 'spec_print_type', label: 'Printer Type', placeholder: 'e.g. LaserJet' },
        { id: 'spec_ip', label: 'IP Address', placeholder: 'e.g. 192.168.1.150' }
    ],
    "Router": [
        { id: 'spec_ip', label: 'IP Address', placeholder: 'e.g. 192.168.1.1' },
        { id: 'spec_ports', label: 'Ports Count', placeholder: 'e.g. 8 Ports' }
    ],
    "Mobile": [
        { id: 'spec_imei', label: 'IMEI Number', placeholder: 'e.g. 356938035641098' }
    ],
    "Storage & Backup": [
        { id: 'spec_capacity', label: 'Total Capacity', placeholder: 'e.g. 16TB' }
    ],
    "Display & AV Equipment": [
        { id: 'spec_resolution', label: 'Resolution', placeholder: 'e.g. 4K UHD' }
    ],
    "Security & Surveillance": [
        { id: 'spec_ip', label: 'IP Address', placeholder: 'e.g. 192.168.2.50' }
    ],
    "Other IT Equipment": [
        { id: 'spec_custom', label: 'Specification', placeholder: 'Custom Detail' }
    ]
};

/* ---------------- Low level storage helpers ---------------- */

function _readKey(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.error('data.js: failed to read', key, e);
        return fallback;
    }
}

function _writeKey(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    // storage events only fire in OTHER tabs, so also notify listeners in THIS tab
    window.dispatchEvent(new CustomEvent('it-data-changed', { detail: { key } }));
}

function getAssets() { return _readKey(STORAGE_KEYS.ASSETS, DEFAULT_ASSETS); }
function setAssets(data) { _writeKey(STORAGE_KEYS.ASSETS, data); }

function getAssignments() { return _readKey(STORAGE_KEYS.ASSIGNMENTS, DEFAULT_ASSIGNMENTS); }
function setAssignments(data) { _writeKey(STORAGE_KEYS.ASSIGNMENTS, data); }

function getTickets() { return _readKey(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS); }
function setTickets(data) { _writeKey(STORAGE_KEYS.TICKETS, data); }

/* Make sure localStorage has data the very first time any page is opened */
function ensureSeedData() {
    if (!localStorage.getItem(STORAGE_KEYS.ASSETS)) setAssets(DEFAULT_ASSETS);
    if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) setAssignments(DEFAULT_ASSIGNMENTS);
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) setTickets(DEFAULT_TICKETS);
}

/* Keep each asset's status / assignedTo in sync with the Assignments list.
   The Assignments list (managed on user.html) is the source of truth for
   "who currently has this asset". Returns the (possibly updated) assets array. */
function reconcileAssetAssignments() {
    const assets = getAssets();
    const assignments = getAssignments();
    let changed = false;

    assets.forEach(asset => {
        const active = assignments.find(a => a.assetId === asset.id && a.status === 'Active');
        const newAssignedTo = active ? active.userName : 'Unassigned';
        const newStatus = active ? 'Active' : 'In Stock';
        if (asset.assignedTo !== newAssignedTo || asset.status !== newStatus) {
            asset.assignedTo = newAssignedTo;
            asset.status = newStatus;
            changed = true;
        }
    });

    if (changed) setAssets(assets);
    return assets;
}

/* Generate a unique Asset ID, e.g. AST-LAP-04, avoiding collisions */
function generateAssetId(categoryHint) {
    const map = {
        'Laptop': 'LAP', 'Desktop (System)': 'SYS', 'Printer': 'PRN', 'Router': 'RTR',
        'Mobile': 'MOB', 'Storage & Backup': 'STG', 'Display & AV Equipment': 'AV',
        'Security & Surveillance': 'SEC', 'Other IT Equipment': 'OTH'
    };
    const prefix = map[categoryHint] || 'GEN';
    const assets = getAssets();
    let n = 1, id;
    do {
        id = `AST-${prefix}-${String(n).padStart(2, '0')}`;
        n++;
    } while (assets.some(a => a.id === id));
    return id;
}

/* Generate a unique Ticket ID (TCK-1001, TCK-1002, ...), scanning for the
   next unused number so deletions or concurrent creation never collide. */
function generateTicketId() {
    const tickets = getTickets();
    let n = 1001, id;
    do {
        id = `TCK-${n}`;
        n++;
    } while (tickets.some(t => t.id === id));
    return id;
}

/* Register a handler that fires whenever data changes — in this tab
   (custom event), another tab (storage event), or when the tab regains focus. */
function onDataChange(handler) {
    window.addEventListener('storage', function (e) {
        if (Object.values(STORAGE_KEYS).includes(e.key)) handler(e.key);
    });
    window.addEventListener('it-data-changed', function (e) {
        handler(e.detail.key);
    });
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') handler(null);
    });
}
