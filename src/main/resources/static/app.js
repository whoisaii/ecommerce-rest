const API = "/products";

function loadProducts() {
    fetch(API)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("products");
            list.innerHTML = "";

            data.forEach(p => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${p.name} — $${p.price}
                    <button onclick="deleteProduct(${p.id})">❌</button>
                `;
                list.appendChild(li);
            });
        });
}

function addProduct() {
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;

    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
    }).then(() => {
        loadProducts();
    });
}

function deleteProduct(id) {
    fetch(`${API}/${id}`, {
        method: "DELETE"
    }).then(() => loadProducts());
}
