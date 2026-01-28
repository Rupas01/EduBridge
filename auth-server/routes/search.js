const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Bit = require('../models/Bit');

router.get('/', async (req, res) => {
    try {
        const { term, type } = req.query;
        if (!term) {
            return res.json([]);
        }

        const regex = new RegExp(term, 'i');
        let results = [];

        // First, find any users whose names match the search term.
        const matchingUsers = await User.find({
            $or: [{ firstName: regex }, { lastName: regex }, { username: regex }]
        }).select('_id');
        const userIds = matchingUsers.map(user => user._id);

        // Now, perform the search based on the filter type.
        switch (type) {
            case 'people':
                results = await User.find({ _id: { $in: userIds } }).select('-password');
                break;
            
            case 'courses':
                results = await Course.find({
                    $or: [
                        { title: regex },
                        { description: regex },
                        { mentor: { $in: userIds } } // Also find courses by matching mentors
                    ]
                }).populate('mentor', 'firstName lastName');
                break;

            case 'bits':
                results = await Bit.find({
                    $or: [
                        { title: regex },
                        { creator: { $in: userIds } } // Also find bits by matching creators
                    ]
                }).populate('creator', 'firstName lastName');
                break;

            case 'all':
                 const [people, courses, bits] = await Promise.all([
                    User.find({ _id: { $in: userIds } }).select('-password').lean(),
                    Course.find({ $or: [{ title: regex }, { mentor: { $in: userIds } }] }).populate('mentor', 'firstName lastName').lean(),
                    Bit.find({ $or: [{ title: regex }, { creator: { $in: userIds } }] }).populate('creator', 'firstName lastName').lean()
                ]);
                results = [
                    ...people.map(item => ({ ...item, __type: 'people' })),
                    ...courses.map(item => ({ ...item, __type: 'courses' })),
                    ...bits.map(item => ({ ...item, __type: 'bits' }))
                ];
                break;

            default:
                // If the type is unknown, just search for people by default or return an error
                results = await User.find({ _id: { $in: userIds } }).select('-password');
        }
        
        res.json(results);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;