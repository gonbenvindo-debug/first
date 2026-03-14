// ===================================
// PRODUCT PAGE JAVASCRIPT
// ===================================

// Product Data
const productData = {
    id: 1,
    name: 'Flyers A6',
    category: 'flyers',
    basePrice: 0.15,
    description: 'Flyers profissionais em formato A6, perfeitos para eventos, promoções e marketing direto.',
    sizes: {
        'A6': { width: 105, height: 148, price: 0.15 },
        'A5': { width: 148, height: 210, price: 0.25 },
        'A4': { width: 210, height: 297, price: 0.45 }
    }
};

// State
let currentSize = 'A6';
let currentQuantity = 100;
let customDesign = null;
let canvas = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeProduct();
    loadCartFromStorage();
    updateCartUI();
});

// Initialize Product Page
function initializeProduct() {
    updateProductInfo();
    setupEventListeners();
    updatePrice();
}

// Update Product Information
function updateProductInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 1;
    
    // Update product name in breadcrumb and title
    document.getElementById('product-name').textContent = productData.name;
    document.getElementById('product-title').textContent = productData.name;
    document.title = `${productData.name} - PrintCraft`;
}

// Setup Event Listeners
function setupEventListeners() {
    // Size selector
    document.querySelectorAll('input[name="size"]').forEach(input => {
        input.addEventListener('change', function() {
            currentSize = this.value;
            updatePrice();
            if (canvas) {
                updateCanvasSize();
            }
        });
    });
    
    // Quantity input
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', function() {
        currentQuantity = parseInt(this.value) || 100;
        updatePrice();
    });
}

// Update Price
function updatePrice() {
    const sizeData = productData.sizes[currentSize];
    const unitPrice = sizeData.price;
    const totalPrice = unitPrice * currentQuantity;
    
    document.getElementById('unit-price').textContent = `€${unitPrice.toFixed(2)}`;
    document.getElementById('total-price').textContent = `€${totalPrice.toFixed(2)}`;
}

// Update Quantity
function updateQuantity(change) {
    const input = document.getElementById('quantity');
    const newValue = parseInt(input.value) + (change * 50);
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (newValue >= min && newValue <= max) {
        input.value = newValue;
        currentQuantity = newValue;
        updatePrice();
    }
}

// Open Design Editor
function openEditor() {
    const modal = document.getElementById('editor-modal');
    modal.classList.add('active');
    
    // Initialize Fabric.js canvas
    setTimeout(() => {
        initializeCanvas();
    }, 100);
}

// Close Design Editor
function closeEditor() {
    const modal = document.getElementById('editor-modal');
    modal.classList.remove('active');
    
    // Dispose canvas
    if (canvas) {
        canvas.dispose();
        canvas = null;
    }
}

// Initialize Fabric.js Canvas
function initializeCanvas() {
    const canvasElement = document.getElementById('design-canvas');
    const sizeData = productData.sizes[currentSize];
    
    // Scale for better editing (2x actual size)
    const scale = 2;
    const canvasWidth = sizeData.width * scale;
    const canvasHeight = sizeData.height * scale;
    
    canvas = new fabric.Canvas('design-canvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 'white',
        selection: true
    });
    
    // Set canvas zoom for better visibility
    canvas.setZoom(scale);
    
    // Add canvas event listeners
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', clearPropertiesPanel);
    canvas.on('object:modified', updatePropertiesPanel);
    
    // Add initial text
    addInitialText();
}

// Update Canvas Size
function updateCanvasSize() {
    if (!canvas) return;
    
    const sizeData = productData.sizes[currentSize];
    const scale = 2;
    const canvasWidth = sizeData.width * scale;
    const canvasHeight = sizeData.height * scale;
    
    canvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight
    });
    
    canvas.setZoom(scale);
    canvas.renderAll();
}

// Add Initial Text
function addInitialText() {
    const text = new fabric.IText('Seu Texto Aqui', {
        left: 50,
        top: 50,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: '#000000',
        editable: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    updatePropertiesPanel();
}

// Add Text
function addText() {
    if (!canvas) return;
    
    const text = new fabric.IText('Novo Texto', {
        left: 50,
        top: 50,
        fontFamily: 'Arial',
        fontSize: 20,
        fill: '#000000',
        editable: true
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    updatePropertiesPanel();
}

// Add Shape
function addShape(type) {
    if (!canvas) return;
    
    let shape;
    const centerX = canvas.width / 4;
    const centerY = canvas.height / 4;
    
    if (type === 'rect') {
        shape = new fabric.Rect({
            left: centerX - 50,
            top: centerY - 50,
            width: 100,
            height: 100,
            fill: '#4f46e5',
            strokeWidth: 0
        });
    } else if (type === 'circle') {
        shape = new fabric.Circle({
            left: centerX - 50,
            top: centerY - 50,
            radius: 50,
            fill: '#4f46e5',
            strokeWidth: 0
        });
    }
    
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    updatePropertiesPanel();
}

// Upload Image
function uploadImage() {
    if (!canvas) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            fabric.Image.fromURL(event.target.result, function(img) {
                // Scale image to fit canvas
                const scale = Math.min(
                    (canvas.width / 2) / img.width,
                    (canvas.height / 2) / img.height
                );
                
                img.scale(scale * 0.5);
                img.set({
                    left: canvas.width / 4 - (img.width * img.scaleX) / 2,
                    top: canvas.height / 4 - (img.height * img.scaleY) / 2
                });
                
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                updatePropertiesPanel();
            });
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
}

// Delete Selected Object
function deleteSelected() {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
        clearPropertiesPanel();
    }
}

// Bring to Front
function bringToFront() {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringToFront(activeObject);
        canvas.renderAll();
    }
}

// Send to Back
function sendToBack() {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendToBack(activeObject);
        canvas.renderAll();
    }
}

// Update Properties Panel
function updatePropertiesPanel() {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    const propertiesContent = document.getElementById('properties-content');
    
    if (!activeObject) {
        clearPropertiesPanel();
        return;
    }
    
    let html = '<div class="property-group">';
    
    if (activeObject.type === 'i-text' || activeObject.type === 'text') {
        // Text properties
        html += `
            <label>Texto</label>
            <input type="text" id="prop-text" value="${activeObject.text}" onchange="updateTextProperty('text', this.value)">
            
            <label>Fonte</label>
            <select id="prop-fontFamily" onchange="updateTextProperty('fontFamily', this.value)">
                <option value="Arial" ${activeObject.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                <option value="Times New Roman" ${activeObject.fontFamily === 'Times New Roman' ? 'selected' : ''}>Times</option>
                <option value="Courier New" ${activeObject.fontFamily === 'Courier New' ? 'selected' : ''}>Courier</option>
                <option value="Georgia" ${activeObject.fontFamily === 'Georgia' ? 'selected' : ''}>Georgia</option>
                <option value="Verdana" ${activeObject.fontFamily === 'Verdana' ? 'selected' : ''}>Verdana</option>
            </select>
            
            <label>Tamanho</label>
            <input type="number" id="prop-fontSize" value="${activeObject.fontSize}" min="8" max="200" onchange="updateTextProperty('fontSize', parseInt(this.value))">
            
            <label>Cor</label>
            <input type="color" id="prop-fill" value="${activeObject.fill}" onchange="updateTextProperty('fill', this.value)">
        `;
    } else {
        // Shape properties
        html += `
            <label>Cor</label>
            <input type="color" id="prop-fill" value="${activeObject.fill}" onchange="updateShapeProperty('fill', this.value)">
            
            <label>Opacidade</label>
            <input type="range" id="prop-opacity" min="0" max="1" step="0.1" value="${activeObject.opacity || 1}" onchange="updateShapeProperty('opacity', parseFloat(this.value))">
        `;
    }
    
    // Common properties
    html += `
        <label>Rotação</label>
        <input type="range" id="prop-angle" min="0" max="360" value="${activeObject.angle || 0}" onchange="updateCommonProperty('angle', parseInt(this.value))">
    </div>`;
    
    propertiesContent.innerHTML = html;
}

// Clear Properties Panel
function clearPropertiesPanel() {
    document.getElementById('properties-content').innerHTML = '<p>Selecione um objeto para editar propriedades</p>';
}

// Update Text Properties
function updateTextProperty(property, value) {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
        activeObject.set(property, value);
        canvas.renderAll();
    }
}

// Update Shape Properties
function updateShapeProperty(property, value) {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type !== 'i-text' && activeObject.type !== 'text') {
        activeObject.set(property, value);
        canvas.renderAll();
    }
}

// Update Common Properties
function updateCommonProperty(property, value) {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set(property, value);
        canvas.renderAll();
    }
}

// Save Design
function saveDesign() {
    if (!canvas) return;
    
    // Save canvas as JSON
    const designData = canvas.toJSON();
    localStorage.setItem('savedDesign', JSON.stringify(designData));
    
    showToast('Design guardado com sucesso!', 'success');
}

// Apply Design
function applyDesign() {
    if (!canvas) return;
    
    // Save design data
    customDesign = canvas.toJSON();
    
    // Update preview
    updateProductPreview();
    
    // Close editor
    closeEditor();
    
    showToast('Design aplicado com sucesso!', 'success');
}

// Update Product Preview
function updateProductPreview() {
    if (!customDesign) return;
    
    // Create a small preview canvas
    const previewCanvas = document.createElement('canvas');
    const previewContext = previewCanvas.getContext('2d');
    
    // Set preview size
    previewCanvas.width = 200;
    previewCanvas.height = 280;
    
    // Draw white background
    previewContext.fillStyle = 'white';
    previewContext.fillRect(0, 0, 200, 280);
    
    // Convert to image and update preview
    const previewImage = previewCanvas.toDataURL();
    const previewContainer = document.querySelector('.preview-image');
    previewContainer.innerHTML = `<img src="${previewImage}" alt="Preview" style="width: 100%; height: 100%; object-fit: contain;">`;
}

// Add to Cart
function addToCart() {
    const sizeData = productData.sizes[currentSize];
    const unitPrice = sizeData.price;
    const totalPrice = unitPrice * currentQuantity;
    
    const cartItem = {
        id: Date.now(),
        productId: productData.id,
        name: productData.name,
        size: currentSize,
        quantity: currentQuantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        customDesign: customDesign,
        timestamp: new Date().toISOString()
    };
    
    // Add to cart array
    cart.push(cartItem);
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update UI
    updateCartUI();
    
    // Show success message
    showToast(`${productData.name} adicionado ao carrinho!`, 'success');
    
    // Optional: Go to cart or continue shopping
    setTimeout(() => {
        if (confirm('Deseja finalizar a compra ou continuar a comprar?')) {
            toggleCart();
        }
    }, 1000);
}

// Preview Mode
function setPreviewMode(mode) {
    const buttons = document.querySelectorAll('.preview-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.target.classList.add('active');
    
    // Update preview based on mode
    const previewContainer = document.querySelector('.preview-image');
    
    if (mode === 'back') {
        if (customDesign) {
            // Show back design or placeholder
            previewContainer.innerHTML = '<i class="fas fa-image" style="transform: scaleX(-1);"></i>';
        } else {
            previewContainer.innerHTML = '<i class="fas fa-image" style="transform: scaleX(-1);"></i>';
        }
    } else {
        updateProductPreview();
    }
}

// Toast notification function (reused from script.js)
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
