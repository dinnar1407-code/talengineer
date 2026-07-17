const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
// 复用企业 API Key 守卫（Bearer TE_xxx，SHA-256 哈希比对 api_keys 表）。
// 此路由原先完全无鉴权——任何人都能向任意项目注入伪造的"硬件故障"消息并经 socket 广播，
// 现在要求持有效 API Key，且 Key 属主必须是该项目的雇主（边缘盒子部署在雇主产线上）。
const { requireApiKey } = require('./apikeys');

router.post('/machine-alert', requireApiKey, async (req, res) => {
    try {
        const { machine_id, project_id, fault_code, fault_description, timestamp, metadata } = req.body;

        if (!machine_id || !project_id || !fault_code) {
            return res.status(400).json({ error: "Missing required IoT telemetry fields: machine_id, project_id, fault_code" });
        }

        const supabase = getClient();

        // 归属校验：API Key 属主必须是该 project(demand) 的雇主，防止合法 Key 向他人项目注入告警
        const { data: demand } = await supabase
            .from('demands')
            .select('employer_id')
            .eq('id', project_id)
            .single();
        if (!demand) return res.status(404).json({ error: 'Project not found' });
        if (demand.employer_id !== req.apiKeyUserId) return res.status(403).json({ error: 'Forbidden: API key does not belong to this project\'s employer.' });

        console.log(`\n🚨 [Nexus Edge IoT] CRITICAL ALERT RECEIVED FROM MACHINE [${machine_id}]`);

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
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

module.exports = router;
