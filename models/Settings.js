import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    storeName: {
        type: String,
        default: 'Madame Modas'
    },
    storeSlogan: {
        type: String,
        default: 'Moda Feminina & Fitness'
    },
    whatsappNumber: {
        type: String,
        default: '5500000000000'
    },
    instagram: {
        type: String,
        default: '@madamemodas'
    },
    email: {
        type: String,
        default: 'contato@madamemodas.com'
    }
}, {
    timestamps: true
});

export default mongoose.model('Settings', settingsSchema);
