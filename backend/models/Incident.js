const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Road Damage', 'Water Leakage', 'Accident', 'Garbage', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Reported', 'In Progress', 'Resolved'],
        default: 'Reported'
    },
    location: {
        // Storing here for quick reference, but Oracle handles spatial queries
        latitude: Number,
        longitude: Number
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // We can use the Mongo _id to link to Oracle, or a custom ID.
    // Using Mongo _id (string) is easiest.
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Incident', incidentSchema);
