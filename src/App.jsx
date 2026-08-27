import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingCart, Search, Star, Plus, Minus, Package,
  Truck, Shield, ChevronLeft, ChevronRight, Trash2, Check,
  LogOut, MapPin, Menu, Headphones, Watch, Shirt, Lamp, Sparkle,
  Car, Blocks, Backpack, Speaker, Pencil, Settings as SettingsIcon, X, Share2
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "./supabaseClient";
import "./styles.css";

const CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Beauty", "Toys"];
const ICONS = { Package, Headphones, Watch, Shirt, Lamp, Sparkle, Car, Blocks, Backpack, Speaker };
const ICON_NAMES = Object.keys(ICONS);
const CART_KEY = "bazaro_guest_cart";

const CATEGORY_BLOCKS = [
  { title: "Top picks in Electronics", items: [["Earbuds", "Headphones"], ["Smart watches", "Watch"], ["Speakers", "Speaker"], ["Everyday gadgets", "Package"]], link: "Explore all Electronics" },
  { title: "New arrivals under $25", items: [["Table lamps", "Lamp"], ["Cookware", "Package"], ["Backpacks", "Backpack"], ["Skincare", "Sparkle"]], link: "Shop the latest" },
  { title: "Fashion trends you'll love", items: [["Shirts", "Shirt"], ["Dresses", "Sparkle"], ["Backpacks", "Backpack"], ["Lipsticks", "Package"]], link: "See more Fashion" },
  { title: "Toys for every age", items: [["RC cars", "Car"], ["Building sets", "Blocks"], ["Learning toys", "Sparkle"], ["Outdoor play", "Package"]], link: "Explore all Toys" },
];

const HERO_SLIDES = [
  { eyebrow: "BAZARO EXCLUSIVE", title: "Big Summer Sale", sub: "Up to 40% off electronics, fashion & home essentials", cta: "Shop the sale", grad: ["#131921", "#3A6EA5"] },
  { eyebrow: "JUST LANDED", title: "New Arrivals Every Week", sub: "Fresh picks in fashion and home decor, curated for you", cta: "See what's new", grad: ["#232F3E", "#B33A2E"] },
  { eyebrow: "ON ORDERS OVER $25", title: "Free Shipping, Every Day", sub: "Fast, reliable delivery nationwide with easy 30-day returns", cta: "Start shopping", grad: ["#0F5C5C", "#FF9900"] },
];

function StripeDivider() {
  return (
    <div className="stripe-divider">
      <span style={{ background: "#FF9900" }} /><span style={{ background: "#131921" }} />
      <span style={{ background: "#FEBD69" }} /><span style={{ background: "#232F3E" }} />
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} fill={i < Math.round(rating) ? "#FF9900" : "none"} stroke="#FF9900" />
      ))}
      <span className="rating-num">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

function ProductTile({ p, onOpen, onAdd, onBuyNow, compact, isAdmin, onEdit, onDelete }) {
  const Icon = ICONS[p.icon] || Package;
  const discount = p.old_price ? Math.round(100 - (p.price / p.old_price) * 100) : 0;
  if (compact) {
    return (
      <div className="mini-card" onClick={() => onOpen(p)}>
        <div className="mini-art" style={{ background: p.image_url ? undefined : `linear-gradient(135deg, ${p.grad_from}, ${p.grad_to})` }}>
          {p.image_url ? <img src={p.image_url} alt={p.name} className="tile-img" /> : <Icon size={26} color="#fff" strokeWidth={1.6} />}
        </div>
        <p className="mini-name">{p.name}</p>
      </div>
    );
  }
  return (
    <div className="ptile" onClick={() => onOpen(p)}>
      <div className="ptile-art" style={{ background: p.image_url ? undefined : `linear-gradient(135deg, ${p.grad_from}, ${p.grad_to})` }}>
        {p.image_url ? <img src={p.image_url} alt={p.name} className="tile-img" /> : <Icon size={34} color="#fff" strokeWidth={1.6} />}
        {p.badge && <span className="badge">{p.badge}</span>}
        {isAdmin && (
          <div className="admin-tile-controls" onClick={(e) => e.stopPropagation()}>
            <button className="admin-icon-btn" onClick={() => onEdit(p)} title="Edit"><Pencil size={13} /></button>
            <button className="admin-icon-btn danger" onClick={() => onDelete(p)} title="Delete"><Trash2 size={13} /></button>
          </div>
        )}
      </div>
      <div className="ptile-body">
        <p className="ptile-cat">{p.category}</p>
        <h4 className="ptile-name">{p.name}</h4>
        <Stars rating={p.rating} />
        <div className="ptile-price-row">
          <span className="price">${Number(p.price).toFixed(2)}</span>
          {p.old_price && <span className="old-price">${Number(p.old_price).toFixed(2)}</span>}
          {discount > 0 && <span className="discount">-{discount}%</span>}
        </div>
        <p className="sold">{p.sold} bought in past month</p>
        <div className="ptile-actions">
          <button className="btn-add" onClick={(e) => { e.stopPropagation(); onAdd(p, 1); }}>
            <Plus size={14} /> Add to Cart
          </button>
          <button className="btn-add buy-now" onClick={(e) => { e.stopPropagation(); onBuyNow(p); }}>
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

function Hero({ onShop }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % HERO_SLIDES.length), 5000); return () => clearInterval(t); }, []);
  const s = HERO_SLIDES[i];
  const decorIcons = [Headphones, Watch, Shirt, Blocks, Car, Sparkle];
  return (
    <div className="hero" style={{ background: `linear-gradient(120deg, ${s.grad[0]}, ${s.grad[1]})` }}>
      <button className="hero-nav left" onClick={() => setI((i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}><ChevronLeft /></button>
      <div className="hero-content">
        <p className="eyebrow">{s.eyebrow}</p>
        <h1>{s.title}</h1>
        <p className="hero-sub">{s.sub}</p>
        <button className="btn-primary" onClick={onShop}>{s.cta}</button>
      </div>
      <div className="hero-decor">
        {decorIcons.map((Ic, idx) => (
          <span key={idx} className={`decor d${idx}`}><Ic size={30 + (idx % 3) * 10} color="rgba(255,255,255,0.85)" strokeWidth={1.3} /></span>
        ))}
      </div>
      <button className="hero-nav right" onClick={() => setI((i + 1) % HERO_SLIDES.length)}><ChevronRight /></button>
      <div className="hero-dots">
        {HERO_SLIDES.map((_, d) => (<span key={d} className={d === i ? "dot active" : "dot"} onClick={() => setI(d)} />))}
      </div>
    </div>
  );
}

/* ---------- Admin: product add/edit modal ---------- */
function ProductModal({ mode, initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(initial.image_url || "");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(form, imageFile);
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{mode === "add" ? "Add Product" : "Edit Product"}</h3>
          <button className="icon-btn ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form" style={{ border: "none", padding: 0 }}>
          <label>Product photo
            <div className="image-picker">
              <div className="image-preview">
                {preview ? <img src={preview} alt="preview" /> : <Package size={28} color="#9AA" />}
              </div>
              <label className="btn-add" style={{ marginTop: 0, cursor: "pointer" }}>
                Choose Image
                <input type="file" accept="image/*" onChange={onPickFile} style={{ display: "none" }} />
              </label>
            </div>
          </label>
          <label>Product name<input value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label>Category
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Price ($)<input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></label>
          <label>Original price ($, optional)<input type="number" value={form.old_price || ""} onChange={(e) => set("old_price", e.target.value)} /></label>
          <label>Badge (optional, e.g. NEW, HOT)<input value={form.badge || ""} onChange={(e) => set("badge", e.target.value)} /></label>
          <label>Seller PayPal email (optional — leave blank to use the site's default PayPal account)
            <input type="email" value={form.paypal_email || ""} onChange={(e) => set("paypal_email", e.target.value)} placeholder="seller@example.com" />
          </label>
          <label>Icon (used as fallback if no photo)
            <select value={form.icon} onChange={(e) => set("icon", e.target.value)}>
              {ICON_NAMES.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <button className="btn-primary" disabled={saving} onClick={handleSave}>
            <Check size={16} /> {saving ? "Saving..." : mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Admin: slide-over panel (Orders + Payment Settings) ---------- */
function AdminPanel({ onClose, orders, onUpdateStatus, settings, onSaveSettings }) {
  const [tab, setTab] = useState("orders");
  const [paypalId, setPaypalId] = useState(settings.paypal_client_id || "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Admin</h3>
          <button className="icon-btn ghost" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="drawer-tabs">
          <button className={tab === "orders" ? "chip active" : "chip"} onClick={() => setTab("orders")}>Orders</button>
          <button className={tab === "settings" ? "chip active" : "chip"} onClick={() => setTab("settings")}>Payment Settings</button>
        </div>

        {tab === "orders" && (
          <div className="drawer-body">
            {orders.length === 0 ? <p className="muted">No orders yet.</p> : orders.map((o) => (
              <div className="order-card" key={o.id}>
                <div className="order-head">
                  <strong>{o.id.slice(0, 8).toUpperCase()}</strong>
                  <span className="muted">{new Date(o.created_at).toLocaleString("en-US")}</span>
                </div>
                <p className="muted" style={{ margin: "2px 0" }}>{o.full_name} · {o.email || "no email"} · {o.phone}</p>
                <p className="muted" style={{ margin: "2px 0 8px" }}>{o.address}</p>
                <ul>{o.items.map((it, idx) => (<li key={idx}>{it.name} × {it.qty} — ${(it.price * it.qty).toFixed(2)}</li>))}</ul>
                <div className="order-foot">
                  <p className="order-total">Total: ${Number(o.total).toFixed(2)} · {o.payment_method === "paypal" ? "PayPal" : "COD"} ({o.payment_status})</p>
                  <select value={o.status || "pending"} onChange={(e) => onUpdateStatus(o.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {o.paypal_capture_id && <p className="muted" style={{ marginTop: 4 }}>PayPal Transaction ID: {o.paypal_capture_id}</p>}
                {o.paypal_order_id && <p className="muted">PayPal Order ID: {o.paypal_order_id}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="drawer-body">
            <div className="form" style={{ border: "none", padding: 0 }}>
              <label>
                PayPal Client ID
                <input value={paypalId} onChange={(e) => setPaypalId(e.target.value)} placeholder="sb (sandbox) or your live client ID" />
              </label>
              <p className="muted">
                This controls which PayPal account receives payments. Get a Client ID from{" "}
                <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer">developer.paypal.com</a>.
                Use "sb" for instant sandbox testing.
              </p>
              <button
                className="btn-primary"
                disabled={saving}
                onClick={async () => { setSaving(true); await onSaveSettings({ paypal_client_id: paypalId }); setSaving(false); }}
              >
                <Check size={16} /> {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [query, setQuery] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMode, setAuthMode] = useState("signin");
  const [authError, setAuthError] = useState("");
  const [cart, setCart] = useState([]); // [{product_id, qty, product}]
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [buyNowItem, setBuyNowItem] = useState(null); // set when "Order Now" is used, so we don't touch the real cart
  const [placedOrder, setPlacedOrder] = useState(null);
  const [settings, setSettings] = useState({ paypal_client_id: "sb", store_name: "bazaro" });
  const [productModal, setProductModal] = useState(null); // { mode, initial }
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);

  const user = session?.user || null;
  const isAdmin = !!profile?.is_admin;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  /* ---- initial load ---- */
  const loadProducts = useCallback(async () => {
    setLoadingCatalog(true);
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (!error) setCatalog(data || []);
    setLoadingCatalog(false);
  }, []);

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("admin_settings").select("*").eq("id", 1).single();
    if (data) setSettings(data);
  }, []);

  const loadProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data || null);
  }, []);

  const loadMyOrders = useCallback(async (userId) => {
    const { data } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setOrders(data || []);
  }, []);

  useEffect(() => {
    loadProducts();
    loadSettings();
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) { loadProfile(data.session.user.id); loadMyOrders(data.session.user.id); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) { loadProfile(sess.user.id); loadMyOrders(sess.user.id); }
      else { setProfile(null); setOrders([]); }
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProducts, loadSettings, loadProfile, loadMyOrders]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // Deep link support: opening a URL like "?p=<shortcode>" (or the older "?product=<id>") jumps straight to that product
  useEffect(() => {
    if (loadingCatalog || catalog.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("p");
    const legacyId = params.get("product");
    if (code) {
      const match = catalog.find((p) => p.short_id === code) || catalog.find((p) => p.id === code);
      if (match) { setActiveProduct(match); setView("product"); }
    } else if (legacyId) {
      const match = catalog.find((p) => p.id === legacyId);
      if (match) { setActiveProduct(match); setView("product"); }
    }
  }, [loadingCatalog, catalog]);

  useEffect(() => {
    if (user && !checkoutForm.email) setCheckoutForm((f) => ({ ...f, email: user.email }));
  }, [user]); // eslint-disable-line

  /* ---- auth ---- */
  const doAuth = async () => {
    setAuthError("");
    const { email, password } = authForm;
    if (!email || !password) { setAuthError("Enter an email and password."); return; }
    if (authMode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthError(error.message); return; }
      showToast("Account created! Sign in to continue.");
      setAuthMode("signin");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setAuthError(error.message); return; }
      setView("home");
      showToast("Signed in!");
    }
  };
  const doLogout = async () => { await supabase.auth.signOut(); setView("home"); };

  /* ---- cart (guest-friendly, localStorage) ---- */
  const addToCart = (product, qty) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === product.id);
      if (existing) return prev.map((c) => (c.product_id === product.id ? { ...c, qty: c.qty + qty } : c));
      return [...prev, { product_id: product.id, qty, product }];
    });
    showToast(`"${product.name}" added to cart`);
  };
  const buyNow = (product) => {
    setBuyNowItem({ product_id: product.id, qty: 1, product });
    setView("checkout");
  };
  const updateQty = (productId, delta) => {
    setCart((prev) => prev.map((c) => (c.product_id === productId ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  };
  const removeFromCart = (productId) => setCart((prev) => prev.filter((c) => c.product_id !== productId));

  const cartTotal = cart.reduce((s, c) => s + (c.product?.price || 0) * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  // What checkout actually charges for: either the single "Order Now" item, or the full cart
  const checkoutItems = buyNowItem ? [buyNowItem] : cart;
  const checkoutTotal = checkoutItems.reduce((s, c) => s + (c.product?.price || 0) * c.qty, 0);

  /* Build PayPal purchase_units, one per distinct seller email among the items being checked out.
     Products without a paypal_email fall back to the site's default account. */
  const buildPurchaseUnits = () => {
    const groups = {};
    checkoutItems.forEach((c) => {
      const key = c.product.paypal_email || "__default__";
      if (!groups[key]) groups[key] = 0;
      groups[key] += c.product.price * c.qty;
    });
    return Object.entries(groups).map(([email, amount], idx) => {
      const unit = { reference_id: `unit_${idx}`, amount: { value: amount.toFixed(2) } };
      if (email !== "__default__") unit.payee = { email_address: email };
      return unit;
    });
  };

  /* ---- checkout ---- */
  const placeOrder = async (paymentInfo) => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) { showToast("Please fill in all fields"); return; }
    const items = checkoutItems.map((c) => ({ name: c.product.name, qty: c.qty, price: c.product.price }));
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user ? user.id : null,
        items, total: checkoutTotal,
        full_name: checkoutForm.name, phone: checkoutForm.phone, address: checkoutForm.address, email: checkoutForm.email,
        payment_method: paymentInfo.payment_method, payment_status: paymentInfo.payment_status,
        paypal_order_id: paymentInfo.paypal_order_id || null, paypal_capture_id: paymentInfo.paypal_capture_id || null,
      })
      .select().single();
    if (error) { showToast("Could not place order: " + error.message); return; }
    if (buyNowItem) {
      setBuyNowItem(null);
    } else {
      setCart([]);
    }
    if (user) setOrders((prev) => [data, ...prev]);
    setPlacedOrder(data);
    setView("order-success");
  };

  /* ---- admin: products ---- */
  const openAddProduct = () => setProductModal({
    mode: "add",
    initial: { name: "", category: CATEGORIES[0], price: "", old_price: "", badge: "", icon: "Package" },
  });
  const openEditProduct = (p) => setProductModal({ mode: "edit", initial: { ...p, price: String(p.price), old_price: p.old_price ? String(p.old_price) : "" } });

  const uploadProductImage = async (file, productIdHint) => {
    const ext = file.name.split(".").pop();
    const path = `${productIdHint || "new"}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (uploadError) { showToast("Image upload failed: " + uploadError.message); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveProduct = async (form, imageFile) => {
    const grads = [["#131921", "#3A6EA5"], ["#B33A2E", "#E0714E"], ["#0F5C5C", "#1C8C8C"], ["#7A3E9D", "#B36ACF"]];
    if (!form.name || !form.price) { showToast("Enter a name and price"); return; }

    let imageUrl = form.image_url || null;
    if (imageFile) {
      const uploaded = await uploadProductImage(imageFile, form.id);
      if (uploaded) imageUrl = uploaded;
    }

    if (productModal.mode === "add") {
      const g = grads[Math.floor(Math.random() * grads.length)];
      const shortId = Math.random().toString(36).slice(2, 9);
      const { data, error } = await supabase.from("products").insert({
        name: form.name, category: form.category, price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null, badge: form.badge || null,
        icon: form.icon, grad_from: g[0], grad_to: g[1], rating: 4.0, sold: 0, created_by: user.id,
        image_url: imageUrl, paypal_email: form.paypal_email || null, short_id: shortId,
      }).select().single();
      if (error) { showToast("Error: " + error.message); return; }
      setCatalog((prev) => [data, ...prev]);
      showToast("Product added");
    } else {
      const { data, error } = await supabase.from("products").update({
        name: form.name, category: form.category, price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null, badge: form.badge || null, icon: form.icon,
        image_url: imageUrl, paypal_email: form.paypal_email || null,
      }).eq("id", form.id).select().single();
      if (error) { showToast("Error: " + error.message); return; }
      setCatalog((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      showToast("Product updated");
    }
    setProductModal(null);
  };

  const deleteProduct = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { showToast("Error: " + error.message); return; }
    setCatalog((prev) => prev.filter((x) => x.id !== p.id));
    showToast("Product deleted");
  };

  /* ---- admin: orders + settings panel ---- */
  const openAdminPanel = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setAdminOrders(data || []);
    setAdminPanelOpen(true);
  };
  const updateOrderStatus = async (orderId, status) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };
  const saveSettings = async (patch) => {
    const { data, error } = await supabase.from("admin_settings").update(patch).eq("id", 1).select().single();
    if (error) { showToast("Error: " + error.message); return; }
    setSettings(data);
    showToast("Settings saved");
  };

  const filteredProducts = catalog.filter((p) => {
    const matchCat = activeCategory ? p.category === activeCategory : true;
    const matchQuery = query ? p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()) : true;
    return matchCat && matchQuery;
  });
  const openProduct = (p) => { setActiveProduct(p); setView("product"); };
  const byCategory = (cat) => catalog.filter((p) => p.category === cat);

  const paypalOptions = useMemo(() => ({
    "client-id": settings.paypal_client_id || "sb",
    currency: "USD",
    "disable-funding": "card,credit",
  }), [settings.paypal_client_id]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="logo" onClick={() => { setView("home"); setActiveCategory(null); setQuery(""); }}>
            <span className="logo-mark">B</span><span>bazaro</span>
          </div>
          <div className="deliver">
            <MapPin size={16} />
            <div><p className="deliver-sub">Deliver to</p><p className="deliver-main">United States</p></div>
          </div>
          <div className="search-wrap">
            <select
              className="search-cat"
              value={activeCategory || "All"}
              onChange={(e) => {
                const val = e.target.value;
                setActiveCategory(val === "All" ? null : val);
                setView("home"); setQuery("");
              }}
            >
              <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Search Bazaro" value={query} onChange={(e) => { setQuery(e.target.value); setView("home"); setActiveCategory(null); }} />
            <button className="search-btn"><Search size={18} color="#131921" /></button>
          </div>
          <nav className="header-actions">
            {isAdmin && (
              <button className="icon-btn" onClick={openAdminPanel} title="Admin">
                <SettingsIcon size={18} />
              </button>
            )}
            {user ? (
              <button className="acct-btn" onClick={doLogout} title="Sign out">
                <p className="acct-sub">Hello, {user.email.split("@")[0]}</p><p className="acct-main">Account <LogOut size={12} /></p>
              </button>
            ) : (
              <button className="acct-btn" onClick={() => setView("login")}>
                <p className="acct-sub">Hello, sign in</p><p className="acct-main">Account &amp; Lists</p>
              </button>
            )}
            <button className="acct-btn" onClick={() => setView("orders")}>
              <p className="acct-sub">Returns</p><p className="acct-main">&amp; Orders</p>
            </button>
            <button className="icon-btn cart-btn" onClick={() => { setBuyNowItem(null); setView("cart"); }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              <span>Cart</span>
            </button>
          </nav>
        </div>
        <div className="header-cats">
          <button className="chip solid"><Menu size={14} /> All</button>
          <button className="chip" onClick={() => setView("home")}>Today's Deals</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={activeCategory === c ? "chip active" : "chip"} onClick={() => { setActiveCategory(c); setView("home"); setQuery(""); }}>{c}</button>
          ))}
          <button className="chip" onClick={() => setView("orders")}>Track Order</button>
        </div>
      </header>

      {toast && <div className="toast">{toast}</div>}

      {view === "home" && (
        <main>
          {!activeCategory && !query && <Hero onShop={() => window.scrollTo({ top: 600, behavior: "smooth" })} />}
          <StripeDivider />

          {!activeCategory && !query && (
            <section className="section">
              <div className="block-grid">
                {CATEGORY_BLOCKS.map((b, idx) => (
                  <div className="block-card" key={idx}>
                    <h3>{b.title}</h3>
                    <div className="block-items">
                      {b.items.map(([label, iconName], i2) => {
                        const Ic = ICONS[iconName] || Package;
                        return (
                          <div className="block-item" key={i2} onClick={() => setQuery(label.split(" ")[0])}>
                            <div className="block-thumb"><Ic size={26} color="#fff" strokeWidth={1.5} /></div>
                            <p>{label}</p>
                          </div>
                        );
                      })}
                    </div>
                    <p className="block-link" onClick={() => setActiveCategory(CATEGORIES.find((c) => b.title.toLowerCase().includes(c.toLowerCase().split(" ")[0])) || null)}>{b.link}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <StripeDivider />

          <section className="section">
            <h2>{activeCategory ? activeCategory : query ? `Results for "${query}"` : "Today's Best Deals"}</h2>
            {loadingCatalog ? <p className="muted">Loading...</p> : filteredProducts.length === 0 ? <p className="muted">No products found.</p> : (
              <div className="grid">
                {filteredProducts.map((p) => (
                  <ProductTile key={p.id} p={p} onOpen={openProduct} onAdd={addToCart} onBuyNow={buyNow} isAdmin={isAdmin} onEdit={openEditProduct} onDelete={deleteProduct} />
                ))}
              </div>
            )}
          </section>

          {!activeCategory && !query && CATEGORIES.map((cat) => (
            <section className="section" key={cat}>
              <h2>Best Sellers in {cat}</h2>
              <div className="mini-row">
                {byCategory(cat).map((p) => (<ProductTile key={p.id} p={p} onOpen={openProduct} onAdd={addToCart} compact />))}
              </div>
            </section>
          ))}

          <StripeDivider />
          <section className="perks">
            <div className="perk"><Truck size={20} /><div><h5>Free Shipping</h5><p>On orders over $25</p></div></div>
            <div className="perk"><Shield size={20} /><div><h5>Secure Payment</h5><p>100% protected checkout</p></div></div>
            <div className="perk"><Package size={20} /><div><h5>Easy Returns</h5><p>Within 30 days</p></div></div>
          </section>
        </main>
      )}

      {view === "product" && activeProduct && (
        <main className="section">
          <button className="back-link" onClick={() => setView("home")}><ChevronLeft size={16} /> Back</button>
          <div className="product-detail">
            <div className="pd-art" style={{ background: activeProduct.image_url ? undefined : `linear-gradient(135deg, ${activeProduct.grad_from}, ${activeProduct.grad_to})` }}>
              {activeProduct.image_url
                ? <img src={activeProduct.image_url} alt={activeProduct.name} className="tile-img" />
                : React.createElement(ICONS[activeProduct.icon] || Package, { size: 80, color: "#fff", strokeWidth: 1.2 })}
            </div>
            <div className="pd-info">
              <p className="ptile-cat">{activeProduct.category}</p>
              <h1>{activeProduct.name}</h1>
              <Stars rating={activeProduct.rating} />
              <div className="pd-price-row"><span className="price big">${Number(activeProduct.price).toFixed(2)}</span>{activeProduct.old_price && <span className="old-price">${Number(activeProduct.old_price).toFixed(2)}</span>}</div>
              <p className="pd-desc">A high-quality {activeProduct.name.toLowerCase()} built to last, with fast nationwide shipping and 30-day easy returns. {activeProduct.sold} customers have already bought this and rated it {Number(activeProduct.rating).toFixed(1)}/5 on average.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => buyNow(activeProduct)}><Check size={16} /> Order Now</button>
                <button className="btn-add" style={{ marginTop: 0 }} onClick={() => addToCart(activeProduct, 1)}><Plus size={14} /> Add to Cart</button>
                <button
                  className="btn-add"
                  style={{ marginTop: 0 }}
                  onClick={() => {
                    const code = activeProduct.short_id || activeProduct.id;
                    const url = `${window.location.origin}/share/${code}`;
                    navigator.clipboard.writeText(url);
                    showToast("Product link copied!");
                  }}
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-add" style={{ marginTop: 0 }} onClick={() => openEditProduct(activeProduct)}><Pencil size={14} /> Edit</button>
                  <button className="btn-add" style={{ marginTop: 0, background: "#B12704" }} onClick={() => deleteProduct(activeProduct)}><Trash2 size={14} /> Delete</button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {view === "cart" && (
        <main className="section">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p className="muted">Your cart is empty. <span className="link" onClick={() => setView("home")}>Start shopping</span>.</p>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((c) => (
                  <div className="cart-row" key={c.product_id}>
                    <div className="cart-thumb" style={{ background: `linear-gradient(135deg, ${c.product.grad_from}, ${c.product.grad_to})` }}>
                      {React.createElement(ICONS[c.product.icon] || Package, { size: 22, color: "#fff" })}
                    </div>
                    <div className="cart-mid"><h4>{c.product.name}</h4><p className="muted">${Number(c.product.price).toFixed(2)} each</p></div>
                    <div className="qty-ctrl"><button onClick={() => updateQty(c.product_id, -1)}><Minus size={14} /></button><span>{c.qty}</span><button onClick={() => updateQty(c.product_id, 1)}><Plus size={14} /></button></div>
                    <p className="row-total">${(c.product.price * c.qty).toFixed(2)}</p>
                    <button className="icon-btn ghost" onClick={() => removeFromCart(c.product_id)}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="cart-summary"><p>Subtotal: <strong>${cartTotal.toFixed(2)}</strong></p><button className="btn-primary" onClick={() => { setBuyNowItem(null); setView("checkout"); }}>Proceed to Checkout</button></div>
            </>
          )}
        </main>
      )}

      {view === "checkout" && (
        <main className="section narrow">
          <h2>Checkout</h2>
          <div className="form">
            <label>Full name<input value={checkoutForm.name} onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })} /></label>
            <label>Email<input type="email" value={checkoutForm.email} onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })} /></label>
            <label>Phone number<input value={checkoutForm.phone} onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} /></label>
            <label>Shipping address<textarea rows={3} value={checkoutForm.address} onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })} /></label>

            <div className="cart-summary flat"><p>Order total: <strong>${checkoutTotal.toFixed(2)}</strong></p></div>

            <PayPalScriptProvider options={paypalOptions} key={paypalOptions["client-id"]}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                fundingSource="paypal"
                disabled={!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address}
                createOrder={(data, actions) => actions.order.create({
                  purchase_units: buildPurchaseUnits(),
                })}
                onApprove={async (data, actions) => {
                  const captureDetails = await actions.order.capture();
                  const captureId = captureDetails?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
                  await placeOrder({
                    payment_method: "paypal", payment_status: "paid",
                    paypal_order_id: data.orderID, paypal_capture_id: captureId,
                  });
                }}
                onError={() => showToast("PayPal payment failed — please try again")}
              />
            </PayPalScriptProvider>
          </div>
        </main>
      )}

      {view === "order-success" && placedOrder && (
        <main className="section narrow center">
          <div className="success-icon"><Check size={32} /></div>
          <h2>Order placed!</h2>
          <p className="muted">Order ID: {placedOrder.id.slice(0, 8).toUpperCase()}</p>
          {placedOrder.paypal_capture_id && <p className="muted">PayPal Transaction ID: {placedOrder.paypal_capture_id}</p>}
          <p className="muted">Total: ${Number(placedOrder.total).toFixed(2)} — {placedOrder.payment_method === "paypal" ? "Paid via PayPal" : "Cash on Delivery"}</p>
          <button className="btn-primary" onClick={() => setView("home")}>Continue Shopping</button>
        </main>
      )}

      {view === "orders" && (
        <main className="section">
          <h2>Your Orders</h2>
          {!user ? (
            <p className="muted">Please <span className="link" onClick={() => setView("login")}>sign in</span> to see your order history. (You can still check out as a guest — just won't see past orders here.)</p>
          ) : orders.length === 0 ? <p className="muted">No orders yet.</p> : (
            <div className="orders-list">
              {orders.map((o) => (
                <div className="order-card" key={o.id}>
                  <div className="order-head"><strong>{o.id.slice(0, 8).toUpperCase()}</strong><span className="muted">{new Date(o.created_at).toLocaleString("en-US")}</span></div>
                  <ul>{o.items.map((it, idx) => (<li key={idx}>{it.name} × {it.qty} — ${(it.price * it.qty).toFixed(2)}</li>))}</ul>
                  <p className="order-total">Total: ${Number(o.total).toFixed(2)} · Status: {o.status || "pending"}</p>
                  {o.paypal_capture_id && <p className="muted">PayPal Transaction ID: {o.paypal_capture_id}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === "login" && (
        <main className="section narrow center">
          <h2>{authMode === "signup" ? "Create account" : "Sign in"}</h2>
          <p className="muted">Optional — you can also check out as a guest without an account.</p>
          <div className="form">
            <label>Email<input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} /></label>
            <label>Password<input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && doAuth()} /></label>
            {authError && <p style={{ color: "#B12704", fontSize: 13 }}>{authError}</p>}
            <button className="btn-primary" onClick={doAuth}>{authMode === "signup" ? "Create account" : "Sign in"}</button>
            <p className="muted" style={{ textAlign: "center" }}>
              {authMode === "signup" ? "Already have an account? " : "New here? "}
              <span className="link" onClick={() => setAuthMode(authMode === "signup" ? "signin" : "signup")}>
                {authMode === "signup" ? "Sign in" : "Create one"}
              </span>
            </p>
          </div>
        </main>
      )}

      {!user && view === "home" && (
        <section className="signin-banner">
          <h3>See personalized recommendations</h3>
          <button className="btn-primary" onClick={() => setView("login")}>Sign in</button>
          <p className="muted">New customer? <span className="link" onClick={() => { setAuthMode("signup"); setView("login"); }}>Start here.</span></p>
        </section>
      )}

      <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top</button>

      <footer className="footer">
        <div className="footer-cols">
          <div><h5>Get to Know Us</h5><p>About Bazaro</p><p>Careers</p><p>Press</p><p>Bazaro Science</p></div>
          <div><h5>Make Money with Us</h5><p>Advertise Your Products</p><p>Become an Affiliate</p></div>
          <div><h5>Bazaro Payment Products</h5><p>Bazaro Business Card</p><p>Shop with Points</p></div>
          <div><h5>Let Us Help You</h5><p onClick={() => setView("orders")} className="link">Your Orders</p><p>Shipping Rates &amp; Policies</p><p>Returns &amp; Replacements</p><p>Help</p></div>
        </div>
        <div className="footer-meta">
          <div className="brand-bottom"><span className="logo-mark small">B</span><span>bazaro</span></div>
          <span>English</span><span>USD - U.S. Dollar</span><span>United States</span>
        </div>
        <StripeDivider />
        <p className="copyright">© 1996–2026 Bazaro.com — a university/demo project. Not affiliated with Amazon.com, Inc.</p>
      </footer>

      {isAdmin && (
        <button className="admin-fab" onClick={openAddProduct} title="Add product"><Plus size={22} /></button>
      )}

      {productModal && (
        <ProductModal
          mode={productModal.mode}
          initial={productModal.initial}
          onClose={() => setProductModal(null)}
          onSave={saveProduct}
        />
      )}

      {adminPanelOpen && (
        <AdminPanel
          onClose={() => setAdminPanelOpen(false)}
          orders={adminOrders}
          onUpdateStatus={updateOrderStatus}
          settings={settings}
          onSaveSettings={saveSettings}
        />
      )}
    </div>
  );
}
