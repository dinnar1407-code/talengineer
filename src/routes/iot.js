const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');

router.post('/machine-alert', async (req, res) => {
    try {
        const { machine_id, project_id, fault_code, fault_description, timestamp, metadata } = req.body;
        
        if (!machine_id || !project_id || !fault_code) {
            return res.status(400).json({ error: "Missing required IoT telemetry fields: machine_id, project_id, fault_code" });
        }

        console.log(`\n🚨 [Nexus Edge IoT] CRITICAL ALERT RECEIVED FROM MACHINE [${machine_id}]`);

        const supabase = getClient();

        let severity = 'WARNING';
        let actionRequired = 'Monitor';
        
        if (fault_code.includes('F3000') || fault_code.includes('E-STOP') || fault_code.startsWith('ERR')) {
            severity = 'CRITICAL';
            actionRequired = 'Immediate on-site intervention required. Machine halted.';
        }

        const systemAlertEn = `⚠️ **HARDWARE FAULT DETECTED** ⚠️\n**Machine ID:** ${machine_id}\n**Error Code:** ${fault_code}\n**Severity:** ${severity}\n**Details:** ${fault_description || 'N/A'}\n**AI Diagnostic:** ${actionRequired}`;
        const systemAlertZh = `⚠️ **设备硬件故障警报** ⚠️\n**设备 ID:** ${machine_id}\n**故障代码:** ${fault_code}\n**严重程度:** ${severity}\n**详情描述:** ${fault_description || '无'}\n**AI 诊断:** ${actionRequired.includes('Immediate') ? '机器已停机，需现场工程师立即介入排障。' : '请持续监控该设备状态。'}`;

        if (supabase) {
            await supabase.from('project_messages').insert([{
                demand_id: project_id,
                sender_role: 'system-iot',
                sender_name: '🔌 Nexus Edge Box',
                original_text: systemAlertEn,
                translated_text: systemAlertZh
            }]);
        }

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

        res.json({ status: 'ok', message: "Telemetry processed and injected into Babel War Room.", dispatched: true });

    } catch (err) {
        console.error("IoT Telemetry Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
