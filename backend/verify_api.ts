import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyAPI() {
    console.log('--- BBVServMant API Validation ---');

    try {
        // 1. Login to get token
        console.log('[1] Testing Authentication...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Auth successful');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test Stats Endpoint
        console.log('[2] Testing Stats Endpoint...');
        const statsRes = await axios.get(`${API_URL}/dashboard/stats`, { headers });
        console.log('Stats status:', statsRes.status);
        if (statsRes.data.globalStats !== undefined) {
            console.log('✅ Stats endpoint OK');
        } else {
            console.log('Stats data keys:', Object.keys(statsRes.data));
            throw new Error('Stats response missing required fields');
        }

        // 3. Test Export Endpoint
        console.log('[3] Testing Export Endpoint...');
        const exportRes = await axios.get(`${API_URL}/equipment/export`, {
            headers,
            params: { token } // Also test token in query param
        });
        if (exportRes.headers['content-type']?.toLowerCase().includes('text/csv')) {
            console.log('✅ Export CSV endpoint OK');
        } else {
            console.log('Got content-type:', exportRes.headers['content-type']);
            throw new Error('Export response is not CSV');
        }

        // 4. Test Equipment Detail Relationships
        console.log('[4] Testing Equipment Detail Relationships...');
        const eqList = await axios.get(`${API_URL}/equipment`, { headers });
        if (eqList.data.length > 0) {
            const eqId = eqList.data[0].id;
            const detailRes = await axios.get(`${API_URL}/equipment/${eqId}`, { headers });
            if (detailRes.data.logs && detailRes.data.type.vendor) {
                console.log('✅ Equipment Detail (Logs & Vendor) OK');
            } else {
                throw new Error('Equipment detail missing logs or vendor info');
            }
        }

        console.log('\n✨ API VALIDATION PASSED ✨');
    } catch (error: any) {
        console.error('\n❌ VALIDATION FAILED');
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

verifyAPI();
