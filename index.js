const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Dummy database for storing users
const users = [];

// Middleware
app.use(express.json());
app.use(passport.initialize());

// User model
class User {
    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }
}

// Local strategy for username/password authentication
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    }
));

// JWT strategy for token-based authentication
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'rohit2GSSA43FYE!@fafaf5n3535n325nm' // Change this to a secure secret
};

passport.use(new JwtStrategy(jwtOptions, (payload, done) => {
    const user = users.find(u => u.id === payload.sub);

    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));

// Routes
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    console.log('User name: ', username);
    console.log('Pass word: ', password);

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User(users.length + 1, username, hashedPassword);
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = jwt.sign({ sub: req.user.id }, jwtOptions.secretOrKey);
    res.json({ token });
});

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'Protected route accessed successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
