import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['fitness', 'suplementos']
    },
    categoryLabel: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        maxlength: 150
    },
    fullDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: '/img/placeholder.jpg'
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    sizes: [{
        type: String
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `R$ ${this.price.toFixed(2).replace('.', ',')}`;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
