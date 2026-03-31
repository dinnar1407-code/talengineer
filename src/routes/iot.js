const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

// Endpoint for the Nexus Edge Box (IoT hardware installed on the Chinese equipment)
// When a machine faults in Mexico, it hits this API directly.
router.post('/machine-alert', async (req, res) => {
    try {
        const { machine_id, project_id, fault_code, fault_description, timestamp, metadata } = req.body;
        
        if (!machine_id || !project_id || !fault_code) {
            return res.status(400).json({ error: "Missing required IoT telemetry fields: machine_id, project_id, fault_code" });
        }

        console.log(`\n🚨 [Nexus Edge IoT] CRITICAL ALERT RECEIVED FROM MACHINE [${machine_id}]`);
        console.log(`   Project ID: ${project_id}`);
        console.log(`   Fault Code: ${fault_code}`);
        console.log(`   Description: ${fault_description || 'Unknown fault'}`);
        console.log(`   Timestamp: ${timestamp || new Date().toISOString()}\n`);

        const db = getClient();
        if (!db) {
            return res.json({ status: 'mock_ok', message: "Telemetry received (DB missing)." });
        }

        // Determine the impact of the error code using rudimentary logic
        // (In a real app, this would query a manufacturer's manual database via Gemini)
        let severity = 'WARNING';
        let actionRequired = 'Monitor';
        
        if (fault_code.includes('F3000') || fault_code.includes('E-STOP') || fault_code.startsWith('ERR')) {
            severity = 'CRITICAL';
            actionRequired = 'Immediate on-site intervention required. Machine halted.';
        }

        // We construct a highly structured system alert to inject directly into the Babel War Room
        const systemAlertEn = `⚠️ **HARDWARE FAULT DETECTED** ⚠️
**Machine ID:** ${machine_id}
**Error Code:** ${fault_code}
**Severity:** ${severity}
**Details:** ${fault_description || 'N/A'}
**AI Diagnostic:** ${actionRequired}`;

        const systemAlertZh = `⚠️ **设备硬件故障警报** ⚠️
**设备 ID:** ${machine_id}
**故障代码:** ${fault_code}
**严重程度:** ${severity}
**详情描述:** ${fault_description || '无'}
**AI 诊断:** ${actionRequired.includes('Immediate') ? '机器已停机，需现场工程师立即介入排障。' : '请持续监控该设备状态。'}`;

        // Inject the telemetry alert directly into the project_messages DB 
        // so it appears in the War Room for both the Chinese Supplier and the Mexican Engineer
        db.prepare(`
            INSERT INTO project_messages (demand_id, sender_role, sender_name, original_text, translated_text)
            VALUES (?, ?, ?, ?, ?)
        `).run(project_id, 'system-iot', '🔌 Nexus Edge Box', systemAlertEn, systemAlertZh);

        // Try to push real-time event to socket if IO is attached to global space
        try {
            const io = global.io;
            if (io) {
                io.to(`project_${project_id}`).emit('message', {
                    senderId: 'nexus-edge',
                    senderRole: 'system-iot',
                    senderName: '🔌 Nexus Edge Box',
                    originalText: systemAlertEn,
                    translatedText: systemAlertZh,
                    timestamp: new Date().toISOString(),
                    isIOT: true
                });
            }
        } catch(e) {
            console.error("Socket push failed for IoT");
        }

        res.json({ 
            status: 'ok', 
            message: "Telemetry processed and injected into Babel War Room.",
            dispatched: true 
        });

    } catch (err) {
        console.error("IoT Telemetry Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
