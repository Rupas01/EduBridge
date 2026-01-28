const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dummyUsers = require('./dummyUsers'); // <-- Import the data from your new file

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        // First, clear any existing users to avoid duplicates
        await User.deleteMany();

        // Hash passwords before importing
        const usersWithHashedPasswords = await Promise.all(
            dummyUsers.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
                return user;
            })
        );
        
        await User.insertMany(usersWithHashedPasswords);
        console.log(`✅ Data Imported: ${usersWithHashedPasswords.length} users created successfully!`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const deleteData = async () => {
    try {
        await User.deleteMany();
        console.log('🗑️ Data Destroyed Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    deleteData();
} else {
    importData();
}