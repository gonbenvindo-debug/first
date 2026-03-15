// Admin Products Management
let products = [];
let currentEditId = null;
let currentPage = 1;
const itemsPerPage = 10;
let filteredProducts = [];

// Supabase configuration
const SUPABASE_URL = 'https://sgoafvyygsmucmzssraa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnb2Fmdnl5Z3NtdWNtenNzcmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MDQ1MTksImV4cCI6MjA0OTQ4MDUxOX0.w9JtqRqXwB3IS1YCFQqwP8lJQJFg7WJ_LXaVtP8O7o';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('product-modal');
        if (event.target === modal) {
            closeProductModal();
        }
    });
}

// Load products from Supabase
async function loadProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });
        
        if (response.ok) {
            products = await response.json();
            filteredProducts = [...products];
            renderProducts();
        } else {
            showToast('Erro ao carregar produtos', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Erro ao carregar produtos', 'error');
    }
}

// Render products table
function renderProducts() {
    const tbody = document.getElementById('products-table-body');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    tbody.innerHTML = pageProducts.map(product => `
        <tr>
            <td>
                <img src="${product.image_url || 'https://via.placeholder.com/50x50'}" alt="${product.name}" class="product-image">
            </td>
            <td>
                <div class="product-name">${product.name}</div>
                <small>${product.description || ''}</small>
            </td>
            <td>
                <span class="product-category">${getCategoryLabel(product.category)}</span>
            </td>
            <td>
                <span class="product-price">€${parseFloat(product.price).toFixed(2)}</span>
            </td>
            <td>
                <span class="variants-count">
                    <i class="fas fa-ruler"></i>
                    ${product.variants ? product.variants.length : 0} variantes
                </span>
            </td>
            <td>
                <span class="status-badge ${product.status || 'active'}">
                    ${product.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Apagar
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages || 1}`;
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const status = document.getElementById('filter-status').value;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || product.category === category;
        const matchesStatus = !status || (product.status || 'active') === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    currentPage = 1;
    renderProducts();
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
    }
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    currentEditId = productId;
    
    if (productId) {
        title.textContent = 'Editar Produto';
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('product-name').value = product.name || '';
            document.getElementById('product-category').value = product.category || '';
            document.getElementById('product-price').value = product.price || '';
            document.getElementById('product-status').value = product.status || 'active';
            document.getElementById('product-description').value = product.description || '';
            
            // Load variants
            if (product.variants && product.variants.length > 0) {
                loadVariants(product.variants);
            }
            
            // Show image preview
            if (product.image_url) {
                document.getElementById('image-preview').innerHTML = 
                    `<img src="${product.image_url}" alt="Preview">`;
            }
        }
    } else {
        title.textContent = 'Novo Produto';
        form.reset();
        document.getElementById('image-preview').innerHTML = '';
        resetVariants();
    }
    
    modal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    currentEditId = null;
}

// Load variants into form
function loadVariants(variants) {
    const container = document.getElementById('variants-container');
    container.innerHTML = '';
    
    variants.forEach((variant, index) => {
        addVariant(variant);
    });
}

// Reset variants to single empty one
function resetVariants() {
    const container = document.getElementById('variants-container');
    container.innerHTML = '';
    addVariant();
}

// Add variant
function addVariant(variantData = null) {
    const container = document.getElementById('variants-container');
    const variantCount = container.children.length + 1;
    
    const variantHtml = `
        <div class="variant-item">
            <div class="variant-header">
                <span>Variante ${variantCount}</span>
                <button type="button" class="btn-remove" onclick="removeVariant(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="variant-fields">
                <div class="form-group">
                    <label>Nome (ex: Pequeno)</label>
                    <input type="text" class="variant-name" value="${variantData?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Largura (cm)</label>
                    <input type="number" class="variant-width" value="${variantData?.width || ''}" required>
                </div>
                <div class="form-group">
                    <label>Altura (cm)</label>
                    <input type="number" class="variant-height" value="${variantData?.height || ''}" required>
                </div>
                <div class="form-group">
                    <label>Preço Adicional (€)</label>
                    <input type="number" class="variant-price" step="0.01" value="${variantData?.additional_price || '0'}">
                </div>
            </div>
            <div class="svg-upload">
                <label>Template SVG para Personalização</label>
                <div class="upload-area small" onclick="this.querySelector('input').click()">
                    <i class="fas fa-file-upload"></i>
                    <p>Upload do SVG</p>
                    <input type="file" class="variant-svg" accept=".svg" onchange="previewSVG(this)">
                </div>
                <div class="svg-preview">
                    ${variantData?.svg_template ? `<object data="${variantData.svg_template}" type="image/svg+xml" width="100" height="60"></object>` : ''}
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variantHtml);
    updateVariantNumbers();
}

// Remove variant
function removeVariant(button) {
    const variantItem = button.closest('.variant-item');
    variantItem.remove();
    updateVariantNumbers();
}

// Update variant numbers
function updateVariantNumbers() {
    const variants = document.querySelectorAll('.variant-item');
    variants.forEach((variant, index) => {
        variant.querySelector('.variant-header span').textContent = `Variante ${index + 1}`;
    });
}

// Preview image
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-preview').innerHTML = 
                `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Preview SVG
function previewSVG(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = input.closest('.svg-upload').querySelector('.svg-preview');
            preview.innerHTML = `<object data="${e.target.result}" type="image/svg+xml" width="100" height="60"></object>`;
        };
        reader.readAsDataURL(file);
    }
}

// Save product
async function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        status: document.getElementById('product-status').value,
        description: document.getElementById('product-description').value,
        variants: getVariantsData()
    };
    
    // Handle image upload
    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        formData.image_url = await uploadImage(imageFile);
    }
    
    try {
        if (currentEditId) {
            // Update existing product
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${currentEditId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showToast('Produto atualizado com sucesso', 'success');
            } else {
                throw new Error('Erro ao atualizar produto');
            }
        } else {
            // Create new product
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showToast('Produto criado com sucesso', 'success');
            } else {
                throw new Error('Erro ao criar produto');
            }
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Erro ao guardar produto', 'error');
    }
}

// Get variants data from form
function getVariantsData() {
    const variants = [];
    const variantItems = document.querySelectorAll('.variant-item');
    
    variantItems.forEach(item => {
        const svgFile = item.querySelector('.variant-svg').files[0];
        const variant = {
            name: item.querySelector('.variant-name').value,
            width: parseInt(item.querySelector('.variant-width').value),
            height: parseInt(item.querySelector('.variant-height').value),
            additional_price: parseFloat(item.querySelector('.variant-price').value) || 0
        };
        
        if (svgFile) {
            // For now, store as base64. In production, upload to storage service
            const reader = new FileReader();
            reader.onload = function(e) {
                variant.svg_template = e.target.result;
            };
            reader.readAsText(svgFile);
        }
        
        variants.push(variant);
    });
    
    return variants;
}

// Upload image (simplified - in production use proper storage service)
async function uploadImage(file) {
    // For demo purposes, return a placeholder URL
    // In production, upload to Supabase Storage or similar service
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(file.name)}`;
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja apagar este produto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        
        if (response.ok) {
            showToast('Produto apagado com sucesso', 'success');
            loadProducts();
        } else {
            throw new Error('Erro ao apagar produto');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Erro ao apagar produto', 'error');
    }
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'flybanners': 'Flybanners',
        'rollups': 'Roll-ups',
        'xbanners': 'X-Banners',
        'lonas': 'Lonas'
    };
    return labels[category] || category;
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Toggle sidebar (mobile)
function toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    sidebar.classList.toggle('active');
}
