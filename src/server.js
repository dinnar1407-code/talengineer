const app = require('./app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Talengineer Core Services running on http://localhost:${PORT}`);
    console.log(`   Domain binding ready: www.talengineer.us`);
});
