// Madame Modas - Main JavaScript

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Toast Notification
function showToast(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Image Lazy Loading
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header Scroll Effect
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
}

// Form Validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else {
            field.classList.remove('border-red-500');
        }
    });

    return isValid;
}

// Price Formatting
function formatPrice(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search Products (for future implementation)
const searchProducts = debounce((query) => {
    if (query.length < 2) return;

    fetch(`/api/products?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update product grid
                console.log('Search results:', data.data);
            }
        })
        .catch(error => console.error('Search error:', error));
}, 300);

// Category Filter with Fetch (alternative to page reload)
async function filterProductsAjax(category) {
    try {
        const response = await fetch(`/api/products?category=${category}`);
        const data = await response.json();

        if (data.success) {
            updateProductGrid(data.data);
            updateActiveFilter(category);
        }
    } catch (error) {
        console.error('Filter error:', error);
        showToast('Erro ao filtrar produtos');
    }
}

// Update Product Grid (for AJAX filtering)
function updateProductGrid(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-dark-soft/60 text-lg">Nenhum produto encontrado nesta categoria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map((product, index) => `
        <div class="product-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl flex flex-col"
             style="animation-delay: ${index * 0.1}s">
            <div class="relative overflow-hidden aspect-[3/4]">
                <img src="${product.image}"
                     alt="${product.name}"
                     class="product-image w-full h-full object-cover"
                     loading="lazy"
                     onerror="this.src='/img/placeholder.jpg'">
                <div class="absolute top-4 left-4">
                    <span class="bg-nude text-dark text-xs font-medium px-3 py-1.5 rounded-full">
                        ${product.categoryLabel}
                    </span>
                </div>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="font-medium text-dark text-lg mb-2 line-clamp-2 h-14">${product.name}</h3>
                <p class="text-dark-soft/60 text-sm mb-4 line-clamp-2">${product.description}</p>
                <div class="mt-auto">
                    <span class="font-serif text-2xl text-dark block mb-4">
                        ${formatPrice(product.price)}
                    </span>
                    <div class="flex gap-2">
                        <a href="/produto/${product.id}"
                           class="flex-1 bg-nude hover:bg-nude-dark text-dark py-3 rounded-full font-medium text-sm tracking-wide text-center transition-colors">
                            Mais Detalhes
                        </a>
                        <button onclick="sendWhatsApp('${product.name}', '${product.categoryLabel}')"
                                class="flex-1 whatsapp-btn bg-dark text-nude-light py-3 rounded-full font-medium text-sm tracking-wide flex items-center justify-center space-x-1">
                            <span>Comprar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update Active Filter Button
function updateActiveFilter(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category || (category === 'all' && btn.dataset.category === 'all')) {
            btn.classList.add('active');
        }
    });
}

// Confirm Delete
function confirmDelete(productName) {
    return confirm(`Tem certeza que deseja excluir "${productName}"? Esta ação não pode ser desfeita.`);
}

// Image Preview
function previewImage(input, previewElement) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector(previewElement).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado para a area de transferencia!');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Erro ao copiar');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add transition to header
    const header = document.querySelector('header');
    if (header) {
        header.style.transition = 'transform 0.3s ease';
    }

    // Initialize any forms with validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
                showToast('Por favor, preencha todos os campos obrigatorios');
            }
        });
    });
});

console.log('Madame Modas - Loaded successfully');
