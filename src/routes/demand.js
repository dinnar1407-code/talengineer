const express = require('express');
const router  = express.Router();
const { getClient } = require('../config/db');
const { parseDemand } = require('../services/aiService');
const { runMatchmaker } = require('../services/matchmakerService');
const { requireAuth } = require('../middleware/auth');
const { emailNewApplication, emailEngineerAssigned } = require('../services/email');
const { createNotification } = require('../services/notificationService');

// ── Parse demand (AI) ─────────────────────────────────────────────────────────
router.post('/parse', async (req, res) => {
  try {
    const { raw_text } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'Missing raw_text' });
    const parsedData = await parseDemand(raw_text);
    res.json({ status: 'ok', data: parsedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Zero-UI quick launch (chatbot / voice) ────────────────────────────────────
router.post('/quick_launch', async (req, res) => {
  try {
    const { raw_text, employer_email } = req.body;
    if (!raw_text) return res.status(400).json({ error: 'Missing raw_text' });

    const parsedData = await parseDemand(raw_text);
    if (!parsedData?.title) throw new Error('AI failed to parse demand.');

    const supabase = getClient();
    const budgetAmount = parseFloat((parsedData.budget || '1000').toString().replace(/[^0-9.]/g, '')) || 1000;

    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .insert([{
        employer_id: 1,
        title: parsedData.title,
        role_required: parsedData.role_required,
        region: parsedData.region || 'Remote',
        project_type: parsedData.project_type || 'Quick Launch',
        location: parsedData.location || 'TBD',
        budget: parsedData.budget || '$1000',
        description: parsedData.standardized_description,
        contact: employer_email || 'quicklaunch@talengineer.us',
        status: 'open',
      }])
      .select()
      .single();

    if (demandErr) throw demandErr;

    if (parsedData.milestones?.length > 0) {
      const msData = parsedData.milestones.map(m => ({
        demand_id: demand.id,
        phase_name: m.phase_name,
        percentage: m.percentage,
        amount: budgetAmount * m.percentage,
        status: 'locked',
      }));
      const { error: msErr } = await supabase.from('project_milestones').insert(msData);
      if (msErr) throw msErr;
    }

    setTimeout(() => { runMatchmaker(demand.id).catch(console.error); }, 1000);

    res.json({ status: 'ok', message: 'Zero-UI Launch Successful. Matchmaker is now hunting for engineers.', demand_id: demand.id, parsed_summary: parsedData });
  } catch (err) {
    console.error('[Demand] Quick launch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Submit demand (manual form) ───────────────────────────────────────────────
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { title, role_required, region, project_type, location, budget, description, contact, milestones } = req.body;

    if (!title) return res.status(400).json({ error: 'Missing title' });

    const budgetAmount = parseFloat((budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000;

    // Use authenticated user's ID; fall back to 1 only for legacy callers
    const employerId = req.user?.userId || 1;

    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .insert([{ employer_id: employerId, title, role_required, region, project_type, location, budget, description, contact: contact || req.user.email, status: 'open' }])
      .select()
      .single();

    if (demandErr) throw demandErr;

    if (milestones?.length > 0) {
      const msData = milestones.map(m => ({
        demand_id: demand.id,
        phase_name: m.phase_name,
        percentage: m.percentage,
        amount: budgetAmount * m.percentage,
        status: 'locked',
      }));
      const { error: msErr } = await supabase.from('project_milestones').insert(msData);
      if (msErr) throw msErr;
    }

    setTimeout(() => { runMatchmaker(demand.id).catch(console.error); }, 1000);

    res.json({ status: 'ok', id: demand.id });
  } catch (err) {
    console.error('[Demand] Submit error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get my demands (employer) ─────────────────────────────────────────────────
router.get('/my', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('demands')
      .select('*, project_milestones(id, phase_name, status, amount)')
      .eq('employer_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Employer analytics ────────────────────────────────────────────────────────
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    const { data: demands } = await supabase
      .from('demands')
      .select('id, title, status, view_count, created_at')
      .eq('employer_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (!demands?.length) return res.json({ status: 'ok', data: [], totals: { projects: 0, views: 0, applicants: 0, assigned: 0 } });

    const demandIds = demands.map(d => d.id);

    // Applicant counts per demand
    const { data: apps } = await supabase
      .from('demand_applications')
      .select('demand_id, status')
      .in('demand_id', demandIds);

    const appsByDemand = (apps || []).reduce((acc, a) => {
      if (!acc[a.demand_id]) acc[a.demand_id] = { total: 0, pending: 0, accepted: 0 };
      acc[a.demand_id].total++;
      if (a.status === 'pending')  acc[a.demand_id].pending++;
      if (a.status === 'accepted') acc[a.demand_id].accepted++;
      return acc;
    }, {});

    const enriched = demands.map(d => ({
      ...d,
      view_count:      d.view_count || 0,
      applicant_count: appsByDemand[d.id]?.total    || 0,
      pending_count:   appsByDemand[d.id]?.pending  || 0,
      accepted_count:  appsByDemand[d.id]?.accepted || 0,
    }));

    const totals = {
      projects:   demands.length,
      views:      enriched.reduce((s, d) => s + d.view_count, 0),
      applicants: enriched.reduce((s, d) => s + d.applicant_count, 0),
      assigned:   demands.filter(d => d.status === 'in_progress' || d.status === 'completed').length,
    };

    res.json({ status: 'ok', data: enriched, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single demand with milestones ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const supabase = getClient();
    const { data: demand, error } = await supabase
      .from('demands')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !demand) return res.status(404).json({ error: 'Project not found' });

    // Fire-and-forget view count increment
    supabase.from('demands').update({ view_count: (demand.view_count || 0) + 1 }).eq('id', req.params.id).then(() => {}).catch(() => {});

    const { data: milestones } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('demand_id', req.params.id)
      .order('created_at', { ascending: true });

    res.json({ status: 'ok', data: { ...demand, milestones: milestones || [] } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Apply to a demand (engineer) ──────────────────────────────────────────────
router.post('/apply', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, message } = req.body;
    if (!demand_id) return res.status(400).json({ error: 'Missing demand_id' });

    // Get engineer's talent profile
    const { data: talent } = await supabase
      .from('talents')
      .select('id, name')
      .eq('user_id', req.user.userId)
      .single();

    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Please complete registration first.' });

    const { quoted_rate, quoted_days, quote_amount } = req.body;

    // Insert application
    const { error } = await supabase
      .from('demand_applications')
      .insert({
        demand_id,
        engineer_id: talent.id,
        message:      message || '',
        quoted_rate:  quoted_rate  || null,
        quoted_days:  quoted_days  ? parseInt(quoted_days)     : null,
        quote_amount: quote_amount ? parseFloat(quote_amount)  : null,
      });

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'You have already applied to this project.' });
      throw error;
    }

    // Notify employer (email + in-app)
    const { data: demand } = await supabase.from('demands').select('title, contact').eq('id', demand_id).single();
    if (demand?.contact) {
      emailNewApplication({ employerEmail: demand.contact, projectTitle: demand.title, engineerName: talent.name, applicationMessage: message }).catch(console.error);
      createNotification({
        user_email: demand.contact,
        type: 'new_application',
        title: `New application for "${demand.title}"`,
        body: `${talent.name} has applied to your project.`,
        link: `/finance`,
        demand_id: parseInt(demand_id),
      });
    }

    res.json({ status: 'ok', message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('[Demand] Apply error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get applications for a demand (employer) ──────────────────────────────────
router.get('/:id/applications', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // Verify requester owns this demand
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', req.params.id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabase
      .from('demand_applications')
      .select('*, talents(id, name, skills, region, rate, verified_score, contact)')
      .eq('demand_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Assign engineer to demand (employer) ──────────────────────────────────────
router.post('/assign', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { demand_id, engineer_id } = req.body;
    if (!demand_id || !engineer_id) return res.status(400).json({ error: 'Missing demand_id or engineer_id' });

    // Assign engineer
    await supabase.from('demands').update({ assigned_engineer_id: engineer_id, status: 'in_progress' }).eq('id', demand_id);

    // Update application statuses
    await supabase.from('demand_applications').update({ status: 'accepted' }).eq('demand_id', demand_id).eq('engineer_id', engineer_id);
    await supabase.from('demand_applications').update({ status: 'rejected' }).eq('demand_id', demand_id).neq('engineer_id', engineer_id).eq('status', 'pending');

    // Notify engineer (email + in-app)
    const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', engineer_id).single();
    const { data: demand } = await supabase.from('demands').select('title, contact').eq('id', demand_id).single();
    if (talent?.contact && demand?.title) {
      emailEngineerAssigned({ engineerEmail: talent.contact, engineerName: talent.name, projectTitle: demand.title, clientContact: demand.contact }).catch(console.error);
      createNotification({
        user_email: talent.contact,
        type: 'engineer_assigned',
        title: `You've been assigned to "${demand.title}"`,
        body: 'Congratulations! You have been selected for this project.',
        link: '/engineer/profile',
        demand_id: parseInt(demand_id),
      });
    }

    res.json({ status: 'ok', message: 'Engineer assigned successfully.' });
  } catch (err) {
    console.error('[Demand] Assign error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
