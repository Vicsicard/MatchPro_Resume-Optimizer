import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

// Debug: Check if variables are loaded
console.log('Supabase URL:', process.env.VITE_SUPABASE_URL);
console.log('Supabase Key length:', process.env.VITE_SUPABASE_ANON_KEY ? process.env.VITE_SUPABASE_ANON_KEY.length : 'not found');

const app = express();
const PORT = 3002; // Changed to 3002 since 3000 and 3001 are in use

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, '..')));

// Add explicit routes for auth confirmation and root
app.get('/', (req, res) => {
    res.redirect('/auth-test.html');
});

app.get('/auth-confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, '../auth-confirmation.html'));
});

// Add configuration endpoint
app.get('/api/config', (req, res) => {
    // Debug: Log what we're sending
    console.log('Sending config to client:', {
        url: process.env.VITE_SUPABASE_URL,
        keyLength: process.env.VITE_SUPABASE_ANON_KEY ? process.env.VITE_SUPABASE_ANON_KEY.length : 'not found'
    });
    
    res.json({
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
    });
});

// Add catch-all route for client-side routing
app.get('*', (req, res) => {
    console.log('Catch-all route hit:', req.path);
    res.sendFile(path.join(__dirname, '../auth-confirmation.html'));
});

// Add error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Try to start the server
const server = app.listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}`);
    console.log(`Access auth-test at: http://localhost:${PORT}/auth-test.html`);
    console.log(`Access auth-confirmation at: http://localhost:${PORT}/auth-confirmation.html`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try these steps:`);
        console.error('1. Open Task Manager');
        console.error('2. Go to the "Details" tab');
        console.error('3. Look for any "node.exe" processes');
        console.error('4. End those processes');
        console.error('5. Try running this server again');
    } else {
        console.error('Error starting server:', err);
    }
    process.exit(1);
});
