-- PostgreSQL Schema for Talengineer V3

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('employer', 'engineer', 'admin')),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS talents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    skills TEXT NOT NULL,
    region VARCHAR(100) DEFAULT 'US/CA/MX',
    rate VARCHAR(100),
    pricing_model VARCHAR(50) DEFAULT 'hourly' CHECK (pricing_model IN ('hourly', 'fixed')),
    level VARCHAR(50) DEFAULT 'Mid' CHECK (level IN ('Junior', 'Mid', 'Senior', 'Expert')),
    verified_score INTEGER DEFAULT 0,
    bio TEXT,
    contact TEXT NOT NULL,
    stripe_account_id VARCHAR(255), -- For Stripe Connect payouts
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role_required TEXT,
    region TEXT DEFAULT 'US/CA/MX',
    project_type VARCHAR(100) DEFAULT 'General',
    location TEXT,
    budget VARCHAR(100),
    description TEXT NOT NULL,
    contact TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'delivered', 'closed')),
    assigned_talent_id UUID REFERENCES talents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID REFERENCES demands(id) ON DELETE CASCADE,
    phase_name VARCHAR(255) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL, -- e.g. 0.10 for 10%
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'locked' CHECK (status IN ('locked', 'funded', 'completed', 'released')),
    deliverables_req TEXT,
    stripe_payment_intent VARCHAR(255), -- ID of the held funds
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS financial_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    demand_id UUID REFERENCES demands(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES users(id),
    engineer_id UUID REFERENCES users(id),
    hours_worked DECIMAL(10,2) DEFAULT 0.0,
    hourly_rate DECIMAL(10,2) DEFAULT 0.0,
    total_amount DECIMAL(12,2) DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'invoiced')),
    invoice_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_role VARCHAR(50),
    contact TEXT,
    message TEXT NOT NULL,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
