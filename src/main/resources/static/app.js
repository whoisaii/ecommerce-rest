console.log("✅ Commerce X UI loaded");

const API = "/products";

/**
 * IMPORTANT:
 * This UI expects backend endpoints:
 * GET    /products
 * POST   /products
 * PUT    /products/{id}
 * DELETE /products/{id}
 *
 * Payload example:
 * { "name": "...", "price": 123, "category": "Phone", "brand": "Razer" }
 *
 * If your backend ignores category/brand — UI still works (it will guess category by name).
 */

const CATEGORIES = [
    { key: "All", label: "All" },
    { key: "Phone", label: "Phone", img: "./images/cat-phone.jpg" },
    { key: "Computers", label: "Computers", img: "./images/cat-computers.jpg" },
    { key: "Accessories", label: "Accessories", img: "./images/cat-accessories.jpg" },
    { key: "Audio", label: "Audio", img: "./images/cat-audio.jpg" },
    { key: "Gaming", label: "Gaming", img: "./images/cat-gaming.jpg" },
];

const IMG_BY_CAT = Object.fromEntries(
    CATEGORIES.filter(c => c.img).map(c => [c.key, c.img])
);

const $ = (id) => document.getElementById(id);

let products = [];
let activeCategory = "All";
let activeTab = "top"; // top/popular/recommended (visual, but we use it for sorting)
let searchQuery = "";
let brandFilter = "all";
let sortMode = "none";
let minPrice = null;
let maxPrice = null;

/* UI refs */
const sideNav = $("sideNav");
const grid = $("grid");
const gridMeta = $("gridMeta");

const searchInput = $("searchInput");
const btnClearSearch = $("btnClearSearch");
const btnReload = $("btnReload");
const btnAddOpen = $("btnAddOpen");
const btnExplore = $("btnExplore");
const btnSeed = $("btnSeed");
const btnClearTable = $("btnClearTable");

const brandSelect = $("brandSelect");
const sortSelect = $("sortSelect");
const btnOpenFilter = $("btnOpenFilter");
const filterPanel = $("filterPanel");
const minPriceInput = $("minPrice");
const maxPriceInput = $("maxPrice");
const btnApplyFilter = $("btnApplyFilter");
const btnResetFilter = $("btnResetFilter");

const modal = $("modal");
const modalBg = $("modalBg");
const modalClose = $("modalClose");
const modalTitle = $("modalTitle");
const form = $("form");
const idField = $("id");
const nameField = $("name");
const priceField = $("price");
const categoryField = $("category");
const brandField = $("brand");
const btnCancel = $("btnCancel");

const toast = $("toast");

/* helpers */
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1900);
}

function money(n) {
    const num = Number(n || 0);
    return new Intl.NumberFormat("en-US", { style:"currency", currency:"USD" }).format(num/500); // визуально как на фотке
}

function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function guessCategory(p) {
    const cat = (p.category || "").trim();
    if (cat) return cat;

    const name = (p.name || "").toLowerCase();
    if (name.includes("phone") || name.includes("tablet") || name.includes("oculus") || name.includes("vr")) return "Phone";
    if (name.includes("laptop") || name.includes("keyboard") || name.includes("pc")) return "Computers";
    if (name.includes("head") || name.includes("speaker") || name.includes("audio")) return "Audio";
    if (name.includes("mouse") || name.includes("case") || name.includes("access")) return "Accessories";
    if (name.includes("game") || name.includes("xbox") || name.includes("ps")) return "Gaming";
    return "Accessories";
}

function imgFor(p) {
    const cat = guessCategory(p);
    return IMG_BY_CAT[cat] || "./images/cat-accessories.jpg";
}

/* API */
async function apiGet() {
    const res = await fetch(API);
    if (!res.ok) throw new Error("GET /products failed: " + res.status);
    return await res.json();
}
async function apiPost(payload) {
    const res = await fetch(API, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("POST /products failed: " + res.status);
    try { return await res.json(); } catch { return null; }
}
async function apiPut(id, payload) {
    const res = await fetch(`${API}/${id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("PUT /products/{id} failed: " + res.status);
    try { return await res.json(); } catch { return null; }
}
async function apiDelete(id) {
    const res = await fetch(`${API}/${id}`, { method:"DELETE" });
    if (!res.ok) throw new Error("DELETE /products/{id} failed: " + res.status);
    return true;
}

/* sidebar */
function renderSidebar() {
    sideNav.innerHTML = CATEGORIES.map(c => `
    <button class="sideItem ${c.key === activeCategory ? "on":""}" data-cat="${c.key}">
      ${c.label}
    </button>
  `).join("");

    sideNav.querySelectorAll("[data-cat]").forEach(btn => {
        btn.addEventListener("click", () => {
            activeCategory = btn.dataset.cat;
            renderSidebar();
            renderGrid();
            showToast("Category: " + activeCategory);
        });
    });

    // modal category select
    categoryField.innerHTML = CATEGORIES.filter(c => c.key !== "All")
        .map(c => `<option value="${c.key}">${c.label}</option>`).join("");
}

/* tabs */
function bindTabs() {
    document.querySelectorAll(".tab").forEach(t => {
        t.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(x => x.classList.remove("on"));
            t.classList.add("on");
            activeTab = t.dataset.tab;
            renderGrid();
        });
    });
}

/* filtering logic */
function filteredProducts() {
    let list = [...products];

    if (activeCategory !== "All") {
        list = list.filter(p => guessCategory(p) === activeCategory);
    }

    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        list = list.filter(p => (p.name || "").toLowerCase().includes(q));
    }

    if (brandFilter !== "all") {
        list = list.filter(p => String(p.brand || "").trim() === brandFilter);
    }

    const min = (minPrice === null || minPrice === "") ? null : Number(minPrice);
    const max = (maxPrice === null || maxPrice === "") ? null : Number(maxPrice);
    if (min !== null && !Number.isNaN(min)) list = list.filter(p => Number(p.price||0) >= min);
    if (max !== null && !Number.isNaN(max)) list = list.filter(p => Number(p.price||0) <= max);

    // tab behavior (like screenshot — "Top" shows higher price first)
    if (activeTab === "top") list.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (activeTab === "popular") list.sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
    if (activeTab === "recommended") list.sort((a,b)=>Number(a.price||0)-Number(b.price||0));

    // explicit sort overrides
    if (sortMode === "price_asc") list.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if (sortMode === "price_desc") list.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (sortMode === "name_asc") list.sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));

    return list;
}

/* grid */
function renderGrid() {
    const list = filteredProducts();
    gridMeta.textContent = `${list.length} items`;

    if (list.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column:1/-1; color:var(--muted); font-weight:900;">
      No products. Use “Seed demo” or “+ Add”.
    </div>`;
        return;
    }

    grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="pimg" style="background-image:url('${imgFor(p)}')"></div>
      <div class="pname">${escapeHtml(p.name)}</div>
      <div class="pmeta">
        <span>${escapeHtml(guessCategory(p))}</span>
        <span>ID: ${p.id ?? "—"}</span>
      </div>
      <div class="pprice">${money(p.price)}</div>

      <div class="pactions">
        <button class="btn btnGhost" data-edit="${p.id}">Edit</button>
        <button class="btn btnDanger" data-del="${p.id}">Delete</button>
      </div>

      <div class="miniLink" data-addlike="${p.id}">Add to Cart</div>
    </div>
  `).join("");

    grid.querySelectorAll("[data-edit]").forEach(b=>{
        b.addEventListener("click", () => openEdit(b.dataset.edit));
    });

    grid.querySelectorAll("[data-del]").forEach(b=>{
        b.addEventListener("click", () => delOne(b.dataset.del));
    });

    grid.querySelectorAll("[data-addlike]").forEach(b=>{
        b.addEventListener("click", () => showToast("Added to cart (UI demo) ✅"));
    });
}

/* modal */
function openModal(){
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
}
function closeModal(){
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
}
function openAdd(){
    modalTitle.textContent = "Add product";
    idField.value = "";
    nameField.value = "";
    priceField.value = "";
    categoryField.value = "Phone";
    brandField.value = "";
    openModal();
    nameField.focus();
}
function openEdit(id){
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    modalTitle.textContent = `Edit #${p.id}`;
    idField.value = p.id;
    nameField.value = p.name ?? "";
    priceField.value = Number(p.price ?? 0);
    categoryField.value = guessCategory(p);
    brandField.value = p.brand ?? "";
    openModal();
    nameField.focus();
}

/* actions */
async function load(){
    try{
        products = await apiGet();
        renderGrid();
        showToast("Loaded ✅");
    } catch(e){
        console.error(e);
        showToast("Load failed ❌ (check backend)");
    }
}

async function save(e){
    e.preventDefault();

    const id = idField.value ? String(idField.value) : null;
    const payload = {
        name: nameField.value.trim(),
        price: Number(priceField.value),
        category: categoryField.value,
        brand: brandField.value.trim()
    };

    if (!payload.name) return showToast("Name required");
    if (Number.isNaN(payload.price)) return showToast("Price invalid");

    try{
        if (!id) await apiPost(payload);
        else await apiPut(id, payload);

        closeModal();
        await load();
        showToast(id ? "Updated ✅" : "Added ✅");
    } catch(e2){
        console.error(e2);
        showToast("Save failed ❌");
    }
}

async function delOne(id){
    if (!confirm(`Delete product #${id}?`)) return;
    try{
        await apiDelete(id);
        await load();
        showToast("Deleted ✅");
    } catch(e){
        console.error(e);
        showToast("Delete failed ❌");
    }
}

async function seed(){
    const demo = [
        { name:"Oculus Quest", price:500000, category:"Phone", brand:"Meta" },
        { name:"Razer Viper 8KHz", price:80000, category:"Accessories", brand:"Razer" },
        { name:"Lexma G88", price:25000, category:"Audio", brand:"Logitech" },
        { name:"Secret Class 2000", price:150000, category:"Gaming", brand:"Sony" },
        { name:"Razer Blackwidow", price:120000, category:"Computers", brand:"Razer" },
        { name:"Smart Speaker", price:45000, category:"Audio", brand:"Apple" }
    ];

    try{
        for (const p of demo) await apiPost(p);
        await load();
        showToast("Seeded ✅");
    } catch(e){
        console.error(e);
        showToast("Seed failed ❌");
    }
}

async function clearTable(){
    if (!confirm("Clear table (delete ALL products)?")) return;
    try{
        const list = await apiGet();
        for (const p of list) if (p.id != null) await apiDelete(p.id);
        await load();
        showToast("Cleared ✅");
    } catch(e){
        console.error(e);
        showToast("Clear failed ❌");
    }
}

/* bind */
function bind(){
    // search
    searchInput.addEventListener("input", (e)=>{
        searchQuery = e.target.value;
        renderGrid();
    });
    btnClearSearch.addEventListener("click", ()=>{
        searchQuery = "";
        searchInput.value = "";
        renderGrid();
    });

    // reload/add
    btnReload.addEventListener("click", load);
    btnAddOpen.addEventListener("click", openAdd);
    btnExplore.addEventListener("click", ()=>window.scrollTo({ top: 420, behavior:"smooth" }));

    // seed/clear
    btnSeed.addEventListener("click", seed);
    btnClearTable.addEventListener("click", clearTable);

    // filter controls
    brandSelect.addEventListener("change", (e)=>{
        brandFilter = e.target.value;
        renderGrid();
    });
    sortSelect.addEventListener("change", (e)=>{
        sortMode = e.target.value;
        renderGrid();
    });

    btnOpenFilter.addEventListener("click", ()=>{
        filterPanel.hidden = !filterPanel.hidden;
    });

    btnApplyFilter.addEventListener("click", ()=>{
        minPrice = minPriceInput.value;
        maxPrice = maxPriceInput.value;
        renderGrid();
        showToast("Filter applied ✅");
    });

    btnResetFilter.addEventListener("click", ()=>{
        minPrice = null; maxPrice = null;
        minPriceInput.value = ""; maxPriceInput.value = "";
        renderGrid();
        showToast("Filter reset ✅");
    });

    // bottom category cards
    document.querySelectorAll(".ccCard").forEach(c=>{
        c.addEventListener("click", ()=>{
            const cat = c.dataset.cat;
            // map these names to existing categories
            if (cat === "Gadget") activeCategory = "Computers";
            else if (cat === "Console") activeCategory = "Gaming";
            else activeCategory = "Phone";
            renderSidebar();
            renderGrid();
            showToast("Category: " + activeCategory);
            window.scrollTo({ top: 420, behavior:"smooth" });
        });
    });

    // modal
    modalBg.addEventListener("click", closeModal);
    modalClose.addEventListener("click", closeModal);
    btnCancel.addEventListener("click", closeModal);
    form.addEventListener("submit", save);
    document.addEventListener("keydown", (e)=>{
        if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
}

document.addEventListener("DOMContentLoaded", async ()=>{
    renderSidebar();
    bindTabs();
    bind();
    await load();
});
