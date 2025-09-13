-- Migration: Create transfers table for NFT transaction history
-- Date: 2025-09-12
-- Purpose: Store NFT transfer/transaction data for ownership tracking

-- Create transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- NFT identification
  token_id TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  chain TEXT NOT NULL CHECK (chain IN ('ethereum', 'tezos')),

  -- Transfer details
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'transfer',
  quantity NUMERIC DEFAULT 1,

  -- Transaction details
  transaction_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  block_hash TEXT,
  log_index INTEGER,
  transaction_index INTEGER,
  transaction_initiator TEXT,
  transaction_to_address TEXT,
  transaction_value NUMERIC DEFAULT 0,
  transaction_fee NUMERIC DEFAULT 0,

  -- Metadata
  timestamp TIMESTAMPTZ NOT NULL,
  batch_transfer_index INTEGER DEFAULT 0,
  sale_details JSONB,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(transaction_hash, log_index, token_id, contract_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transfers_token_contract ON transfers(token_id, contract_address);
CREATE INDEX IF NOT EXISTS idx_transfers_chain ON transfers(chain);
CREATE INDEX IF NOT EXISTS idx_transfers_from_address ON transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_transfers_to_address ON transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_transfers_timestamp ON transfers(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_transaction_hash ON transfers(transaction_hash);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_transfers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER transfers_updated_at
  BEFORE UPDATE ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_transfers_updated_at();

-- Enable RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read access for all transfers
CREATE POLICY "read_public" ON transfers
  FOR SELECT USING (true);

-- Admin write access only
CREATE POLICY "write_admins" ON transfers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON transfers TO anon, authenticated;
GRANT ALL ON transfers TO service_role;

-- Add comments
COMMENT ON TABLE transfers IS 'NFT transfer/transaction history for ownership tracking';
COMMENT ON COLUMN transfers.token_id IS 'NFT token ID';
COMMENT ON COLUMN transfers.contract_address IS 'Smart contract address';
COMMENT ON COLUMN transfers.chain IS 'Blockchain network (ethereum, tezos)';
COMMENT ON COLUMN transfers.from_address IS 'Sender wallet address (0x0 for mints)';
COMMENT ON COLUMN transfers.to_address IS 'Recipient wallet address';
COMMENT ON COLUMN transfers.event_type IS 'Type of event (transfer, mint, burn, etc)';
COMMENT ON COLUMN transfers.sale_details IS 'Optional sale/marketplace details (JSON)';
