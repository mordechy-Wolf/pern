// api-test-script.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3005/api';

// פונקציית עזר להדפסה ברורה של שלבי הבדיקה
function logStep(stepName, requestData, responseData, error = null) {
    console.log(`--- [ ${stepName} ] ---`);
    if (requestData) console.log('📤 נשלח:', JSON.stringify(requestData, null, 2));
    
    if (error) {
        console.log('❌ נכשל:', error.response?.data || error.message);
    } else {
        console.log('📥 התקבל:', JSON.stringify(responseData, null, 2));
    }
    console.log('-----------------------------------\n');
}

async function testAPI() {
    console.log('🚀 מתחיל סבב בדיקות מפורט...\n');

    let regularToken = '';
    let superToken = '';
    let regularUserId = '';

    try {
        // 1. רישום משתמש
        const registerPayload = {
            email: `test-${Date.now()}@test.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'Regular'
        };
        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, registerPayload);
            regularToken = res.data.data.token;
            regularUserId = res.data.data.user.id;
            logStep('Register User', registerPayload, res.data);
        } catch (err) {
            logStep('Register User', registerPayload, null, err);
            return; // עוצרים אם הרישום נכשל
        }

        // 2. התחברות Super Admin
        const loginPayload = {
            email: 'super@admin.com',
            password: 'superpassword123'
        };
        try {
            const res = await axios.post(`${BASE_URL}/auth/login`, loginPayload);
            superToken = res.data.data.token;
            logStep('Login Super Admin', loginPayload, res.data);
        } catch (err) {
            logStep('Login Super Admin', loginPayload, null, err);
        }

        // 3. בדיקת גישת ניהול
        try {
            const res = await axios.get(`${BASE_URL}/admin`, {
                headers: { Authorization: `Bearer ${superToken}` }
            });
            logStep('Check Admin Access (GET /admin)', { headers: 'Auth Bearer' }, res.data);
        } catch (err) {
            logStep('Check Admin Access (GET /admin)', null, null, err);
        }

        // 4. הענקת דרגת אדמין
        const grantPayload = {
            userId: regularUserId,
            adminLevel: 'ADMIN'
        };
        try {
            const res = await axios.post(`${BASE_URL}/admin/grant`, grantPayload, {
                headers: { Authorization: `Bearer ${superToken}` }
            });
            logStep('Grant Admin Role', grantPayload, res.data);
        } catch (err) {
            logStep('Grant Admin Role', grantPayload, null, err);
        }

        // 5. ניקוי נתונים
        try {
            const res = await axios.delete(`${BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${regularToken}` }
            });
            logStep('Cleanup (Delete User)', { targetUserId: regularUserId }, res.data);
        } catch (err) {
            logStep('Cleanup (Delete User)', null, null, err);
        }

    } catch (err) {
        console.error('💥 שגיאה לא צפויה בסקריפט:', err.message);
    }

    console.log('🎉 סבב הבדיקות הסתיים!');
}

testAPI();