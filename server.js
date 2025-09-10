import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';


const app = express();
app.use(helmet());
app.use(express.json());
app.use(morgan('tiny'));


// CORS (allow your Next.js origin)
const defaultFrontend = 'https://meme-quote.vercel.app';
const allowedOrigins = (process.env.CORS_ORIGIN || defaultFrontend).split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
}));


// Supabase client
const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_ANON_KEY,
{ auth: { persistSession: false } }
);


app.get('/api/health', (req, res) => {
res.json({ ok: true, time: new Date().toISOString() });
});


// Random quote
app.get('/api/quote', async (req, res) => {
try {
const { data, error } = await supabase.rpc('get_random_quote');
if (error) throw error;


const row = Array.isArray(data) ? data[0] : data;
if (!row) return res.status(404).json({ error: 'No quotes found' });


res.json({ id: row.id, quote: row.quote, author: row.author, created_at: row.created_at });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Failed to fetch random quote' });
}
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
console.log(`✅ Meme Quote API listening on http://localhost:${port}`);
});