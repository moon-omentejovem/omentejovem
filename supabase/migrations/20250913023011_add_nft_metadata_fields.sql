-- Migration: Add minimal essential NFT fields to artworks table
-- Date: 2025-09-13
-- Description: Adds only essential NFT identification fields, keeping other data for future API integration

-- Add essential NFT identification fields only
ALTER TABLE artworks
ADD COLUMN contract_address TEXT NULL,
ADD COLUMN blockchain VARCHAR(20) DEFAULT 'ethereum',
ADD COLUMN collection_slug VARCHAR(100) NULL;

-- Add comments for documentation
COMMENT ON COLUMN artworks.contract_address IS 'Blockchain contract address for the NFT (for API integration)';
COMMENT ON COLUMN artworks.blockchain IS 'Blockchain network (ethereum, tezos, etc.)';
COMMENT ON COLUMN artworks.collection_slug IS 'Collection identifier for grouping and filtering';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_contract_address ON artworks(contract_address);
CREATE INDEX IF NOT EXISTS idx_artworks_blockchain ON artworks(blockchain);
CREATE INDEX IF NOT EXISTS idx_artworks_collection_slug ON artworks(collection_slug);

-- Note: Other NFT metadata (attributes, tags, token_uri, etc.) will be obtained via API when needed
-- This keeps the database lean while preserving the ability to integrate with NFT APIs in the future
