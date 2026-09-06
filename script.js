/* ==========================================================
   SARAPAN KITA — LOGIC
   File ini membaca CONFIG dari data.js dan menjalankan semua
   interaksi (menu, keranjang, checkout, invoice).
   Biasanya kamu TIDAK perlu edit file ini kecuali ingin
   mengubah cara kerja website.
   ========================================================== */

(function(){
  "use strict";

  const rupiah = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  const $ = (sel, ctx) => (ctx||document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx||document).querySelectorAll(sel));

  const STORAGE_KEY = "sk_cart_v1";
  let cart = loadCart();
  let activeCategory = "semua";
  let currentItem = null; // state sementara saat modal item terbuka
  let selectedPayment = CONFIG.pembayaran.qrisAktif ? "qris" : "cash";

  /* ---------------- INIT ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderBrand();
    renderHero();
    renderOngkirBanner();
    renderPromo();
    renderMenu();
    renderLokasi();
    renderHalalFooter();
    bindCategoryTabs();
    bindGlobalEvents();
    updateCartUI();
  });

  /* ---------------- RENDER: BRAND ---------------- */
  function renderBrand(){
    document.title = CONFIG.brand.name + " — " + CONFIG.brand.tagline;
    $("#brandName").textContent = CONFIG.brand.name;
    $("#brandTagline").textContent = CONFIG.brand.tagline;
    const badge = $("#logoBadge");
    if(CONFIG.brand.logoImage){
      badge.innerHTML = `<img src="${CONFIG.brand.logoImage}" alt="Logo ${CONFIG.brand.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
    } else {
      badge.textContent = CONFIG.brand.logoInitial || "SK";
    }
  }

  function renderHero(){
    $("#heroTagline").textContent = CONFIG.brand.tagline;
  }

  function renderOngkirBanner(){
    const fo = CONFIG.freeOngkir;
    const el = $("#ongkirText");
    if(!fo.aktif){ $("#ongkirBanner").hidden = true; return; }
    el.textContent = `Gratis ongkir min. belanja ${rupiah(fo.minBelanja)} untuk area ${fo.area.join(", ")}.`;
  }

  /* ---------------- RENDER: PROMO ---------------- */
  function renderPromo(){
    const wrap = $("#promoScroll");
    if(!CONFIG.promo || CONFIG.promo.length === 0){
      wrap.parentElement.hidden = true;
      return;
    }
    wrap.innerHTML = CONFIG.promo.map(p => `
      <div class="promo-card">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        ${p.kodeVoucher ? `<span class="promo-code">KODE: ${escapeHtml(p.kodeVoucher)}</span>` : ""}
      </div>
    `).join("");
  }

  /* ---------------- HELPER: HARGA PER UKURAN ---------------- */
  function menuCardPriceLabel(item){
    if(item.hargaUkuran){
      const values = Object.values(item.hargaUkuran);
      const min = Math.min(...values), max = Math.max(...values);
      return min === max ? rupiah(min) : `${rupiah(min)} - ${rupiah(max)}`;
    }
    return rupiah(item.hargaDasar || 0);
  }
  function itemMinPrice(item){
    if(item.hargaUkuran) return Math.min(...Object.values(item.hargaUkuran));
    return item.hargaDasar || 0;
  }

  /* ---------------- RENDER: MENU ---------------- */
  function renderMenu(){
    const wrap = $("#menuList");
    const items = CONFIG.menu.filter(m => activeCategory === "semua" || m.kategori === activeCategory);
    if(items.length === 0){
      wrap.innerHTML = `<p class="empty-cart">Belum ada menu di kategori ini.</p>`;
      return;
    }
    wrap.innerHTML = items.map(item => `
      <div class="menu-card" data-id="${item.id}">
        <div class="menu-photo">
          ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.nama)}">` : (item.emoji || "🍽️")}
        </div>
        <div class="menu-info">
          <h3>${escapeHtml(item.nama)}</h3>
          <p class="desc">${escapeHtml(item.deskripsi)}</p>
          <div class="menu-bottom">
            <span class="menu-price">${menuCardPriceLabel(item)}</span>
            <button class="add-btn" data-open="${item.id}" aria-label="Tambah ${escapeHtml(item.nama)}">+</button>
          </div>
        </div>
      </div>
    `).join("");

    $$("[data-open]", wrap).forEach(btn => {
      btn.addEventListener("click", () => openItemModal(btn.dataset.open));
    });
    $$(".menu-card", wrap).forEach(card => {
      card.addEventListener("click", (e) => {
        if(e.target.closest("[data-open]")) return;
        openItemModal(card.dataset.id);
      });
    });
  }

  function bindCategoryTabs(){
    $$(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        $$(".tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        activeCategory = tab.dataset.cat;
        renderMenu();
      });
    });
  }

  /* ---------------- RENDER: LOKASI ---------------- */
  function renderLokasi(){
    $("#outletName").textContent = CONFIG.outlet.name;
    $("#outletAddress").textContent = CONFIG.outlet.address;
    $("#outletJam").textContent = "Jam buka: " + CONFIG.outlet.jamBuka;
    $("#mapsFrame").src = CONFIG.outlet.mapsEmbedUrl;
    $("#mapsLinkBtn").href = CONFIG.outlet.mapsLinkUrl;
  }

  /* ---------------- RENDER: HALAL + FOOTER ---------------- */
  function renderHalalFooter(){
    if(CONFIG.halal.aktif){
      $("#halalNumber").textContent = "No. Sertifikat: " + CONFIG.halal.nomorSertifikat;
      if(CONFIG.halal.logoImage){
        $("#halalLogo").innerHTML = `<img src="${CONFIG.halal.logoImage}" alt="Logo Halal" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">`;
      }
    } else {
      $("#halalBlock").hidden = true;
    }
    $("#footerBrand").textContent = CONFIG.brand.name;
    $("#footerPhone").textContent = CONFIG.contact.phoneDisplay;
    $("#footerIG").textContent = CONFIG.contact.instagram;
  }

  /* ---------------- ITEM MODAL ---------------- */
  function openItemModal(menuId){
    const item = CONFIG.menu.find(m => m.id === menuId);
    if(!item) return;
    currentItem = {
      item,
      ukuranId: item.punyaUkuran ? CONFIG.ukuran[0].id : null,
      daging: item.pilihDaging ? CONFIG.pilihanDaging[0] : null,
      hilangkan: [],
      pedas: item.kategori !== "gorengan" ? CONFIG.levelPedas[0] : null,
      addOns: [],
      qty: 1,
      catatan: ""
    };
    $("#itemModalBody").innerHTML = buildItemModalHTML(item);
    bindItemModalEvents(item);
    updateItemTotal();
    showOverlay("#itemModalOverlay");
  }

  function buildItemModalHTML(item){
    const bukanGorengan = item.kategori !== "gorengan";
    let html = `
      <div class="item-modal-photo">
        ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.nama)}">` : (item.emoji || "🍽️")}
      </div>
      <h3 class="im-name">${escapeHtml(item.nama)}</h3>
      <p class="im-desc">${escapeHtml(item.deskripsi)}</p>
    `;

    if(item.punyaUkuran && item.hargaUkuran){
      html += `
        <table class="size-table">
          <thead><tr><th>Ukuran</th>${CONFIG.ukuran.map(u => `<th>${u.id}</th>`).join("")}</tr></thead>
          <tbody><tr><td>Harga</td>${CONFIG.ukuran.map(u => `<td>${rupiah(item.hargaUkuran[u.id] ?? 0)}</td>`).join("")}</tr></tbody>
        </table>
      `;
      html += `<div class="field-group"><label class="group-label">Pilih Ukuran</label>`;
      CONFIG.ukuran.forEach((u,i) => {
        html += `
          <label class="option-row ${i===0 ? "selected":""}">
            <span>${escapeHtml(u.label)} — ${rupiah(item.hargaUkuran[u.id] ?? 0)}</span>
            <input type="radio" name="ukuran" value="${u.id}" ${i===0 ? "checked":""}>
          </label>`;
      });
      html += `</div>`;
    }

    if(item.pilihDaging){
      html += `<div class="field-group"><label class="group-label">Pilih Daging</label>`;
      CONFIG.pilihanDaging.forEach((d,i) => {
        html += `
          <label class="option-row ${i===0 ? "selected":""}">
            <span>${escapeHtml(d)}</span>
            <input type="radio" name="daging" value="${d}" ${i===0 ? "checked":""}>
          </label>`;
      });
      html += `</div>`;
    }

    if(bukanGorengan){
      const daftarIsian = item.isianTersedia
        ? CONFIG.isianBisaDihilangkan.filter(o => item.isianTersedia.includes(o.id))
        : CONFIG.isianBisaDihilangkan;
      html += `<div class="field-group"><label class="group-label">Detail Order (opsional)</label>`;
      daftarIsian.forEach(o => {
        html += `
          <label class="option-row">
            <span>Tidak pakai ${escapeHtml(o.label)}</span>
            <input type="checkbox" name="hilangkan" value="${o.id}">
          </label>`;
      });
      html += `</div>`;

      html += `<div class="field-group"><label class="group-label">Level Pedas</label>`;
      CONFIG.levelPedas.forEach((p,i) => {
        html += `
          <label class="option-row ${i===0 ? "selected":""}">
            <span>${escapeHtml(p)}</span>
            <input type="radio" name="pedas" value="${escapeHtml(p)}" ${i===0 ? "checked":""}>
          </label>`;
      });
      html += `</div>`;
    }

    if(item.addOnTersedia && item.addOnTersedia.length > 0){
      html += `<div class="field-group"><label class="group-label">Menu Tambahan (Add On)</label>`;
      item.addOnTersedia.forEach(id => {
        const ao = CONFIG.addOn.find(a => a.id === id);
        if(!ao) return;

        if(ao.tipe === "pcs"){
          html += `
            <div class="option-row addon-pcs-row" data-addon-id="${ao.id}">
              <span>${escapeHtml(ao.nama)} (${rupiah(ao.hargaPerPcs)} / ${escapeHtml(ao.satuan || "pcs")})</span>
              <span class="pcs-stepper">
                <button type="button" class="pcs-btn" data-pcs-minus="${ao.id}">−</button>
                <span class="pcs-value" id="pcsValue-${ao.id}">0</span>
                <button type="button" class="pcs-btn" data-pcs-plus="${ao.id}">+</button>
              </span>
            </div>`;
        } else {
          const hargaLabel = ao.tipe === "ukuran"
            ? rupiah(ao.hargaUkuran[currentItem.ukuranId] ?? 0)
            : rupiah(ao.harga);
          html += `
            <label class="option-row">
              <span>${escapeHtml(ao.nama)} (+<span id="addonPrice-${ao.id}">${hargaLabel}</span>)</span>
              <input type="checkbox" name="addon" value="${ao.id}">
            </label>`;
        }
      });
      html += `</div>`;
    }

    html += `
      <div class="field-group">
        <label class="group-label" for="itemNote">Catatan untuk item ini</label>
        <textarea id="itemNote" class="im-note" rows="2" placeholder="Contoh: sausnya dipisah, dll"></textarea>
      </div>
      <div class="qty-row">
        <button class="qty-btn" id="qtyMinus" type="button">−</button>
        <span class="qty-value" id="qtyValue">1</span>
        <button class="qty-btn" id="qtyPlus" type="button">+</button>
      </div>
      <div class="im-total-row"><span>Total</span><span id="itemTotal">${rupiah(itemMinPrice(item))}</span></div>
      <button class="btn btn-primary btn-block" id="addToCartBtn">Tambah ke Keranjang</button>
    `;
    return html;
  }

  function bindItemModalEvents(item){
    const body = $("#itemModalBody");

    $$('input[name="ukuran"]', body).forEach(r => r.addEventListener("change", () => {
      currentItem.ukuranId = r.value;
      syncSelectedClass(body, 'input[name="ukuran"]');
      updateAddOnPricesUI(item, body);
      updateItemTotal();
    }));
    $$('input[name="daging"]', body).forEach(r => r.addEventListener("change", () => {
      currentItem.daging = r.value;
      syncSelectedClass(body, 'input[name="daging"]');
    }));
    $$('input[name="pedas"]', body).forEach(r => r.addEventListener("change", () => {
      currentItem.pedas = r.value;
      syncSelectedClass(body, 'input[name="pedas"]');
    }));
    $$('input[name="hilangkan"]', body).forEach(c => c.addEventListener("change", () => {
      currentItem.hilangkan = $$('input[name="hilangkan"]:checked', body).map(x => x.value);
      c.closest(".option-row").classList.toggle("selected", c.checked);
    }));
    $$('input[name="addon"]', body).forEach(c => c.addEventListener("change", () => {
      if(c.checked){
        if(!currentItem.addOns.find(a => a.id === c.value)) currentItem.addOns.push({ id: c.value, qty: 1 });
      } else {
        currentItem.addOns = currentItem.addOns.filter(a => a.id !== c.value);
      }
      c.closest(".option-row").classList.toggle("selected", c.checked);
      updateItemTotal();
    }));

    $$('[data-pcs-plus]', body).forEach(btn => btn.addEventListener("click", () => changePcsAddOn(item, body, btn.dataset.pcsPlus, 1)));
    $$('[data-pcs-minus]', body).forEach(btn => btn.addEventListener("click", () => changePcsAddOn(item, body, btn.dataset.pcsMinus, -1)));

    $("#itemNote", body).addEventListener("input", (e) => { currentItem.catatan = e.target.value; });

    $("#qtyMinus", body).addEventListener("click", () => {
      currentItem.qty = Math.max(1, currentItem.qty - 1);
      $("#qtyValue", body).textContent = currentItem.qty;
      updateItemTotal();
    });
    $("#qtyPlus", body).addEventListener("click", () => {
      currentItem.qty = Math.min(20, currentItem.qty + 1);
      $("#qtyValue", body).textContent = currentItem.qty;
      updateItemTotal();
    });

    $("#addToCartBtn", body).addEventListener("click", addCurrentItemToCart);
  }

  function changePcsAddOn(item, scope, addOnId, delta){
    const ao = CONFIG.addOn.find(a => a.id === addOnId);
    if(!ao) return;
    let entry = currentItem.addOns.find(a => a.id === addOnId);
    let qty = (entry ? entry.qty : 0) + delta;
    qty = Math.max(0, Math.min(20, qty));
    if(qty === 0){
      currentItem.addOns = currentItem.addOns.filter(a => a.id !== addOnId);
    } else if(entry){
      entry.qty = qty;
    } else {
      currentItem.addOns.push({ id: addOnId, qty });
    }
    const valEl = $(`#pcsValue-${addOnId}`, scope);
    if(valEl) valEl.textContent = qty;
    updateItemTotal();
  }

  function updateAddOnPricesUI(item, scope){
    if(!item.addOnTersedia) return;
    item.addOnTersedia.forEach(id => {
      const ao = CONFIG.addOn.find(a => a.id === id);
      if(!ao || ao.tipe !== "ukuran") return;
      const priceEl = $(`#addonPrice-${ao.id}`, scope);
      if(priceEl) priceEl.textContent = rupiah(ao.hargaUkuran[currentItem.ukuranId] ?? 0);
    });
  }

  function syncSelectedClass(scope, selector){
    $$(selector, scope).forEach(input => {
      input.closest(".option-row").classList.toggle("selected", input.checked);
    });
  }

  function computeItemUnitPrice(){
    const item = currentItem.item;
    let price = (item.punyaUkuran && item.hargaUkuran)
      ? (item.hargaUkuran[currentItem.ukuranId] ?? 0)
      : (item.hargaDasar || 0);

    currentItem.addOns.forEach(sel => {
      const ao = CONFIG.addOn.find(a => a.id === sel.id);
      if(!ao) return;
      if(ao.tipe === "ukuran"){
        price += (ao.hargaUkuran[currentItem.ukuranId] || 0);
      } else if(ao.tipe === "pcs"){
        price += (ao.hargaPerPcs || 0) * (sel.qty || 0);
      } else {
        price += (ao.harga || 0);
      }
    });
    return price;
  }

  function updateItemTotal(){
    const unit = computeItemUnitPrice();
    const total = unit * currentItem.qty;
    const totalEl = $("#itemTotal");
    if(totalEl) totalEl.textContent = rupiah(total);
  }

  function addCurrentItemToCart(){
    const item = currentItem.item;
    const unitPrice = computeItemUnitPrice();
    const ukuran = item.punyaUkuran ? CONFIG.ukuran.find(u => u.id === currentItem.ukuranId) : null;
    const addOnDetail = currentItem.addOns.map(sel => {
      const ao = CONFIG.addOn.find(a => a.id === sel.id);
      if(!ao) return null;
      let nama = ao.nama;
      if(ao.tipe === "pcs" && sel.qty > 1) nama += ` x${sel.qty}`;
      return { nama };
    }).filter(Boolean);
    const hilangkanDetail = currentItem.hilangkan.map(id => {
      const o = CONFIG.isianBisaDihilangkan.find(o => o.id === id);
      return o ? o.label : id;
    });

    cart.push({
      uid: "c" + Date.now() + Math.floor(Math.random()*999),
      menuId: item.id,
      nama: item.nama,
      ukuranLabel: ukuran ? ukuran.label : null,
      daging: currentItem.daging,
      hilangkan: hilangkanDetail,
      pedas: currentItem.pedas,
      addOns: addOnDetail.map(a => a.nama),
      catatan: currentItem.catatan,
      qty: currentItem.qty,
      unitPrice: unitPrice,
      subtotal: unitPrice * currentItem.qty
    });

    saveCart();
    updateCartUI();
    closeOverlay("#itemModalOverlay");
  }

  /* ---------------- CART ---------------- */
  function loadCart(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveCart(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }catch(e){}
  }

  function cartSubtotal(){
    return cart.reduce((sum, c) => sum + c.subtotal, 0);
  }

  function updateCartUI(){
    const count = cart.reduce((s,c) => s + c.qty, 0);
    $("#cartCount").textContent = count;
    const sticky = $("#stickyCart");
    if(count > 0){
      sticky.hidden = false;
      $("#stickyCount").textContent = count + " item";
      $("#stickyTotal").textContent = rupiah(cartSubtotal());
    } else {
      sticky.hidden = true;
    }
  }

  function renderCartModal(){
    const wrap = $("#cartItemsList");
    if(cart.length === 0){
      wrap.innerHTML = `<p class="empty-cart">Keranjang masih kosong. Yuk pilih menu dulu 🙂</p>`;
    } else {
      wrap.innerHTML = cart.map(c => {
        const details = [];
        if(c.ukuranLabel) details.push(c.ukuranLabel);
        if(c.daging) details.push(c.daging);
        if(c.hilangkan && c.hilangkan.length) details.push("Tanpa " + c.hilangkan.join(", "));
        if(c.pedas) details.push(c.pedas);
        if(c.addOns && c.addOns.length) details.push("+" + c.addOns.join(", "));
        if(c.catatan) details.push('"' + c.catatan + '"');
        return `
          <div class="cart-line" data-uid="${c.uid}">
            <div>
              <div class="cart-line-name">${c.qty}x ${escapeHtml(c.nama)}</div>
              <div class="cart-line-detail">${escapeHtml(details.join(" · "))}</div>
              <div class="cart-line-remove" data-remove="${c.uid}">Hapus</div>
            </div>
            <div class="cart-line-price">${rupiah(c.subtotal)}</div>
          </div>
        `;
      }).join("");

      $$("[data-remove]", wrap).forEach(el => {
        el.addEventListener("click", () => {
          cart = cart.filter(c => c.uid !== el.dataset.remove);
          saveCart();
          updateCartUI();
          renderCartModal();
        });
      });
    }

    renderPaymentOptions();
    const savedArea = localStorage.getItem("sk_area") || "";
    $("#areaInput").value = savedArea;
    updateSummary();
  }

  function renderPaymentOptions(){
    const wrap = $("#paymentOptions");
    const opts = [];
    if(CONFIG.pembayaran.qrisAktif) opts.push({id:"qris", label:"QRIS"});
    if(CONFIG.pembayaran.cashAktif) opts.push({id:"cash", label:"Cash / COD"});
    if(!opts.find(o => o.id === selectedPayment)) selectedPayment = opts[0] ? opts[0].id : null;

    wrap.innerHTML = opts.map(o => `<button type="button" class="payment-chip ${o.id===selectedPayment ? "active":""}" data-pay="${o.id}">${o.label}</button>`).join("");
    $$("[data-pay]", wrap).forEach(btn => {
      btn.addEventListener("click", () => {
        selectedPayment = btn.dataset.pay;
        renderPaymentOptions();
        toggleQrisBox();
      });
    });
    toggleQrisBox();
  }

  function toggleQrisBox(){
    const box = $("#qrisBox");
    if(selectedPayment === "qris" && CONFIG.pembayaran.qrisAktif){
      box.hidden = false;
      $("#qrisImg").src = CONFIG.pembayaran.qrisImage;
      $("#paymentNote").textContent = CONFIG.pembayaran.catatan;
    } else {
      box.hidden = true;
    }
  }

  function computeOngkir(subtotal, area){
    const fo = CONFIG.freeOngkir;
    if(!fo.aktif) return { biaya: 0, gratis: true, keterangan: "Ongkir tidak berlaku." };
    const areaLower = (area||"").toLowerCase().trim();
    const cocok = areaLower && fo.area.some(a => areaLower.includes(a.toLowerCase()) || a.toLowerCase().includes(areaLower));
    if(!areaLower){
      return { biaya: 0, gratis: null, keterangan: "Isi wilayah pengantaran untuk cek ongkir." };
    }
    if(cocok && subtotal >= fo.minBelanja){
      return { biaya: 0, gratis: true, keterangan: "Yes! Ongkir gratis untuk wilayahmu 🎉" };
    }
    if(cocok && subtotal < fo.minBelanja){
      return { biaya: fo.estimasiOngkirLuarArea, gratis: false, keterangan: `Tambah belanja sampai ${rupiah(fo.minBelanja)} lagi untuk gratis ongkir.` };
    }
    return { biaya: fo.estimasiOngkirLuarArea, gratis: false, keterangan: "Di luar area gratis ongkir. Ongkir final dikonfirmasi via WhatsApp." };
  }

  function updateSummary(){
    const subtotal = cartSubtotal();
    const area = $("#areaInput").value;
    const ongkirInfo = computeOngkir(subtotal, area);
    $("#sumSubtotal").textContent = rupiah(subtotal);
    $("#sumOngkir").textContent = ongkirInfo.gratis === true ? "GRATIS" : rupiah(ongkirInfo.biaya);
    $("#sumTotal").textContent = rupiah(subtotal + (ongkirInfo.gratis === true ? 0 : ongkirInfo.biaya));
    const statusEl = $("#ongkirStatus");
    statusEl.textContent = ongkirInfo.keterangan;
    statusEl.className = "ongkir-status " + (ongkirInfo.gratis === true ? "free" : (ongkirInfo.gratis === false ? "paid" : ""));
  }

  /* ---------------- CHECKOUT + INVOICE ---------------- */
  function handleCheckout(){
    if(cart.length === 0){
      alert("Keranjang masih kosong, silakan pilih menu dulu ya.");
      return;
    }
    const area = $("#areaInput").value.trim();
    if(!area){
      alert("Mohon isi wilayah pengantaran dulu ya.");
      $("#areaInput").focus();
      return;
    }
    localStorage.setItem("sk_area", area);

    const subtotal = cartSubtotal();
    const ongkirInfo = computeOngkir(subtotal, area);
    const ongkirBiaya = ongkirInfo.gratis === true ? 0 : ongkirInfo.biaya;
    const total = subtotal + ongkirBiaya;
    const catatanUmum = $("#orderNote").value.trim();
    const now = new Date();
    const orderId = "SK" + now.getFullYear().toString().slice(-2) +
      String(now.getMonth()+1).padStart(2,"0") + String(now.getDate()).padStart(2,"0") +
      "-" + String(now.getHours()).padStart(2,"0") + String(now.getMinutes()).padStart(2,"0");

    const order = { orderId, tanggal: now.toLocaleString("id-ID"), items: [...cart], area, subtotal, ongkir: ongkirBiaya, ongkirGratis: ongkirInfo.gratis === true, total, catatanUmum, pembayaran: selectedPayment };

    openWhatsApp(order);
    renderInvoice(order);
    closeOverlay("#cartModalOverlay");
    showOverlay("#invoiceModalOverlay");

    cart = [];
    saveCart();
    updateCartUI();
  }

  function openWhatsApp(order){
    const lines = [];
    lines.push(`Halo ${CONFIG.brand.name}, saya mau pesan (${order.orderId}):`);
    order.items.forEach(c => {
      const details = [];
      if(c.ukuranLabel) details.push(c.ukuranLabel);
      if(c.daging) details.push(c.daging);
      if(c.hilangkan && c.hilangkan.length) details.push("Tanpa " + c.hilangkan.join(", "));
      if(c.pedas) details.push(c.pedas);
      if(c.addOns && c.addOns.length) details.push("+" + c.addOns.join(", "));
      if(c.catatan) details.push("Catatan: " + c.catatan);
      lines.push(`• ${c.qty}x ${c.nama}${details.length ? " (" + details.join(", ") + ")" : ""} — ${rupiah(c.subtotal)}`);
    });
    lines.push(`Subtotal: ${rupiah(order.subtotal)}`);
    lines.push(`Ongkir: ${order.ongkirGratis ? "GRATIS" : rupiah(order.ongkir)}`);
    lines.push(`Total: ${rupiah(order.total)}`);
    lines.push(`Wilayah antar: ${order.area}`);
    lines.push(`Pembayaran: ${order.pembayaran === "qris" ? "QRIS" : "Cash / COD"}`);
    if(order.catatanUmum) lines.push(`Catatan: ${order.catatanUmum}`);
    lines.push("Mohon konfirmasi pesanan saya ya. Terima kasih 🙏");

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${CONFIG.contact.whatsapp}?text=${text}`;
    window.open(url, "_blank");
  }

  function renderInvoice(order){
    const rows = order.items.map(c => {
      const details = [];
      if(c.ukuranLabel) details.push(c.ukuranLabel);
      if(c.daging) details.push(c.daging);
      if(c.hilangkan && c.hilangkan.length) details.push("Tanpa " + c.hilangkan.join(", "));
      if(c.pedas) details.push(c.pedas);
      if(c.addOns && c.addOns.length) details.push("+" + c.addOns.join(", "));
      return `<tr><td>${c.qty}x ${escapeHtml(c.nama)}<br><small style="color:#8A8175;">${escapeHtml(details.join(", "))}</small></td><td style="text-align:right;">${rupiah(c.subtotal)}</td></tr>`;
    }).join("");

    $("#invoiceBody").innerHTML = `
      <div class="invoice-head">
        <h3>${escapeHtml(CONFIG.brand.name)}</h3>
        <p class="invoice-meta">${escapeHtml(order.orderId)} · ${escapeHtml(order.tanggal)}</p>
      </div>
      <table class="invoice-table">
        ${rows}
        <tr><td>Subtotal</td><td style="text-align:right;">${rupiah(order.subtotal)}</td></tr>
        <tr><td>Ongkir</td><td style="text-align:right;">${order.ongkirGratis ? "GRATIS" : rupiah(order.ongkir)}</td></tr>
        <tr class="invoice-total-row"><td>Total</td><td style="text-align:right;">${rupiah(order.total)}</td></tr>
      </table>
      <p style="margin:0 0 4px;"><strong>Wilayah antar:</strong> ${escapeHtml(order.area)}</p>
      <p style="margin:0 0 4px;"><strong>Pembayaran:</strong> ${order.pembayaran === "qris" ? "QRIS" : "Cash / COD"}</p>
      ${order.catatanUmum ? `<p style="margin:0;"><strong>Catatan:</strong> ${escapeHtml(order.catatanUmum)}</p>` : ""}
      <p style="margin-top:14px; font-size:0.75rem; color:#8A8175;">Invoice ini juga otomatis terkirim lewat pesan WhatsApp untuk konfirmasi pesananmu.</p>
    `;
  }

  /* ---------------- OVERLAY HELPERS ---------------- */
  function showOverlay(sel){ $(sel).classList.add("show"); document.body.style.overflow = "hidden"; }
  function closeOverlay(sel){ $(sel).classList.remove("show"); document.body.style.overflow = ""; }

  function bindGlobalEvents(){
    $$("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        closeOverlay("#itemModalOverlay");
        closeOverlay("#cartModalOverlay");
        closeOverlay("#invoiceModalOverlay");
      });
    });
    $$(".overlay").forEach(ov => {
      ov.addEventListener("click", (e) => { if(e.target === ov) closeOverlay("#" + ov.id); });
    });

    $("#openCartBtn").addEventListener("click", () => { renderCartModal(); showOverlay("#cartModalOverlay"); });
    $("#stickyCartBtn").addEventListener("click", () => { renderCartModal(); showOverlay("#cartModalOverlay"); });
    $("#areaInput").addEventListener("input", updateSummary);
    $("#checkoutBtn").addEventListener("click", handleCheckout);
    $("#printInvoiceBtn").addEventListener("click", () => window.print());
    $("#closeInvoiceBtn").addEventListener("click", () => closeOverlay("#invoiceModalOverlay"));
  }

  function escapeHtml(str){
    if(str === null || str === undefined) return "";
    return String(str)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

})();
