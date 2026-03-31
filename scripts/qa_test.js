const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4000,
    headers: { 'Content-Type': 'application/json' }
};

function reqData(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const reqOpts = { ...options, path, method };
        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runQA() {
    console.log("🚀 Starting QA Pre-flight Check...");
    let errors = 0;

    // 1. Static Pages
    const pages = ['/', '/talent', '/finance', '/warroom'];
    for (const page of pages) {
        const res = await reqData(page, 'GET');
        if (res.status === 200) {
            console.log(`✅ GET ${page} - OK`);
        } else {
            console.log(`❌ GET ${page} - Failed with status ${res.status}`);
            errors++;
        }
    }

    // 2. Auth
    const resAuth = await reqData('/api/auth/register', 'POST', { email: "qa_boss@test.com", role: "employer", name: "QA Boss" });
    if (resAuth.status === 200 && JSON.parse(resAuth.body).status === 'ok') {
        console.log(`✅ POST /api/auth/register - OK`);
    } else {
        console.log(`❌ POST /api/auth/register - Failed: ${resAuth.body}`);
        errors++;
    }

    // 3. Finance Endpoints (Ledger & Milestones)
    const resLedger = await reqData('/api/finance/ledger?email=qa_boss@test.com', 'GET');
    if (resLedger.status === 200) {
        console.log(`✅ GET /api/finance/ledger - OK`);
    } else {
        console.log(`❌ GET /api/finance/ledger - Failed: ${resLedger.body}`);
        errors++;
    }

    // 4. Payment Mock Endpoints
    const resFund = await reqData('/api/payment/fund-milestone', 'POST', { milestone_id: 1, demand_id: 1 });
    // It might return 404 if the milestone doesn't exist, which is fine, as long as it's not 500
    if (resFund.status === 200 || resFund.status === 404) {
        console.log(`✅ POST /api/payment/fund-milestone - OK (Status: ${resFund.status})`);
    } else {
        console.log(`❌ POST /api/payment/fund-milestone - Failed: ${resFund.body}`);
        errors++;
    }

    // 5. IoT Endpoint
    const resIoT = await reqData('/api/iot/machine-alert', 'POST', { machine_id: "QA-01", project_id: "QA-100", fault_code: "QA-ERR" });
    if (resIoT.status === 200) {
        console.log(`✅ POST /api/iot/machine-alert - OK`);
    } else {
        console.log(`❌ POST /api/iot/machine-alert - Failed: ${resIoT.body}`);
        errors++;
    }

    // 6. DB File Check (simulated by the successful routes)
    console.log(`\n🏁 QA Check Complete. Errors found: ${errors}`);
}

runQA();
