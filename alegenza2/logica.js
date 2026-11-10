let allProducts = [];
let activeCategories = new Set();
let activeBrands = new Set();
let currentSearch = "";

const xmlUrl = "https://2performant.com";
const proxyUrl = "https://allorigins.win" + encodeURIComponent(xmlUrl);

document.addEventListener("DOMContentLoaded", () => {
    incarcaProduse();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") handleSearch();
        });
    }
});

function incarcaProduse() {
    fetch(proxyUrl)
    .then(res => {
        if (!res.ok) throw new Error("Eroare de rețea");
        return res.json();
    })
    .then(data => {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data.contents, "text/xml");
        let items = xmlDoc.getElementsByTagName("item");
        allProducts = [];
        
        for (let item of items) {
            let title = item.getElementsByTagName("title")[0]?.textContent || item.getElementsByTagName("title")?.textContent || '';
            let price = item.getElementsByTagName("price")[0]?.textContent || item.getElementsByTagName("price")?.textContent || '';
            let old_price = item.getElementsByTagName("old_price")[0]?.textContent || '';
            let category = item.getElementsByTagName("category")[0]?.textContent || '';
            let brand = item.getElementsByTagName("brand")[0]?.textContent || '';
            let aff_code = item.getElementsByTagName("aff_code")[0]?.textContent || '';
            
            if (title) {
                allProducts.push({ title, price, old_price, category, brand, aff_code });
            }
        }
        
        buildFilters();
        renderProducts();
    })
    .catch(e => {
        const resCount = document.getElementById("resultsCount");
        if (resCount) resCount.innerText = "Eroare la conexiunea cu serverul 2Performant.";
        console.error(e);
    });
}

function buildFilters() {
    const catContainer = document.getElementById("categoriesFilter");
    const brandContainer = document.getElementById("brandsFilter");

    const categories = [...new Set(allProducts.map(p => p.category))].filter(Boolean).sort();
    const brands = [...new Set(allProducts.map(p => p.brand))].filter(Boolean).sort();

    if (catContainer) {
        catContainer.innerHTML = categories.slice(0, 15).map(cat => `
            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; cursor:pointer;">
                <input type="checkbox" value="${cat}" onchange="toggleFilter('category', this.value)">
                <span>${cat}</span>
            </label>
        `).join('');
    }

    if (brandContainer) {
        brandContainer.innerHTML = brands.slice(0, 15).map(b => `
            <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:13px; cursor:pointer;">
                <input type="checkbox" value="${b}" onchange="toggleFilter('brand', this.value)">
                <span>${b}</span>
            </label>
        `).join('');
    }
}

function toggleFilter(type, value) {
    const set = type === 'category' ? activeCategories : activeBrands;
    if (set.has(value)) set.delete(value);
    else set.add(value);
    renderProducts();
}

function handleSearch() {
    const input = document.getElementById("searchInput");
    if (input) {
        currentSearch = input.value.toLowerCase().trim();
        renderProducts();
    }
}

function renderProducts() {
    const grid = document.getElementById("productsGrid");
    const resCount = document.getElementById("resultsCount");
    
    const filtered = allProducts.filter(p => {
        const matchesSearch = !currentSearch || p.title.toLowerCase().includes(currentSearch);
        const matchesCategory = activeCategories.size === 0 || activeCategories.has(p.category);
        const matchesBrand = activeBrands.size === 0 || activeBrands.has(p.brand);
        return matchesSearch && matchesCategory && matchesBrand;
    });

    if (resCount) {
        resCount.innerText = `Am găsit ${filtered.length} produse active în catalog`;
    }

    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">Niciun produs găsit. Încearcă alte cuvinte cheie.</div>';
        return;
    }

    grid.innerHTML = filtered.map(p => {
        let label = "PRODUS";
        if (p.title.toLowerCase().includes("sac")) label = "SAC MENAJER";
        if (p.title.toLowerCase().includes("flacon") || p.title.toLowerCase().includes("pet")) label = "RECIPIENT / PET";
        if (p.title.toLowerCase().includes("borcan")) label = "BORCAN STICLĂ";
        if (p.title.toLowerCase().includes("pungi")) label = "PUNGI ALIMENTARE";

        return `
            <div class="product-card" style="background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <div style="background:#e0f2fe; color:#0369a1; padding:20px; text-align:center; border-radius:8px; font-weight:bold; font-size:12px;">
                    ${label}
                </div>
                <div style="font-size:11px; text-transform:uppercase; color:#94a3b8; font-weight:600;">${p.brand || 'BagsToDoor'}</div>
                <h4 style="font-size:14px; font-weight:600; color:#1e293b; margin:0; line-height:1.4; min-height:40px;">${p.title}</h4>
                <div style="font-size:18px; font-weight:700; color:#dc2626; margin-top:auto;">${p.price} RON</div>
                <a href="${p.aff_code}" target="_blank" rel="noopener noreferrer" style="display:block; text-align:center; background:#10b981; color:white; text-decoration:none; padding:10px; border-radius:8px; font-weight:600; font-size:14px; margin-top:10px;">Vezi Oferta</a>
            </div>
        `;
    }).join('');
}
