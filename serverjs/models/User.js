const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    //made user name as unique to make it dynamic and easy to search
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        unique: false,
        trim: true
    },
    instruments: {
        type: String,
        required: true,
        unique: false,
    },
    picture: {
        type: String,
        default: 'https://res.cloudinary.com/dj7x2d5qv/image/upload/v1698373019/DefaultProfilePicture.png',
        unique: false
    },
    online: {
        type: String,
        enum: ['online', 'offline'],
        default: 'online',
        unique: false
    },
    status: {
        type: String,
        enum: ['Player', 'Admin'],
        default: 'Player',
        unique: false
    },

}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    next()
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)

