-- =====================================================
-- Omentejovem Database Seed Script
-- Execute this SQL in your Supabase SQL Editor after running supabase-setup.sql
-- =====================================================

BEGIN;

-- =====================================================
-- SERIES DATA
-- =====================================================

-- Insert all series
INSERT INTO public.series (id, slug, name, cover_image_url, created_at, updated_at)
VALUES
  ('01234567-89ab-cdef-0123-456789abcdef'::uuid, 'the-cycle', 'The Cycle', 'https://i.seadn.io/s/raw/files/ed5d5b2508bd188b00832ac86adb57ba.jpg?w=500&auto=format', '2023-10-17T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'omentejovem-1-1s', 'OMENTEJOVEM 1/1s', 'https://i.seadn.io/gcs/files/cacbfeb217dd1be2d79a65a765ca550f.jpg?w=500&auto=format', '2022-01-01T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'shapes-colors', 'Shapes & Colors', 'https://i.seadn.io/gcs/files/9d7eb58db2c4fa4cc9dd93273c6d3e51.png?w=500&auto=format', '2022-03-03T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'omentejovem-editions', 'OMENTEJOVEM''s Editions', 'https://i.seadn.io/gae/_ZzhhYKfpH4to7PQ0RJkr8REqu_BamJNFNe17NnOkFg1rhFiC_xcioL969hFj5Hri7FIm1hruaKEfUOupzhz3uQk6XwoApIPtgcKFw?w=500&auto=format', '2022-01-01T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde3'::uuid, 'superrare-pieces', 'SuperRare Collection', NULL, '2020-10-29T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'tezos-collection', 'Tezos Collection', NULL, '2021-06-16T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde5'::uuid, 'other-platforms', 'Other Platforms', NULL, '2020-09-21T00:00:00Z', NOW()),
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'new-series', 'Stories on Circles', '/new_series/1_Sitting_at_the_Edge.jpg', '2025-05-30T00:00:00Z', NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  cover_image_url = EXCLUDED.cover_image_url,
  updated_at = NOW();

-- =====================================================
-- ARTWORKS DATA
-- =====================================================

-- The Cycle Collection
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('a1234567-89ab-cdef-0123-456789abcdef'::uuid, 'the-flower', 'The Flower', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"The Flower\" is the second artwork from \"The Cycle\" collection released via the RarePass."}]}]}', '5', '2023-10-17', 'https://opensea.io/assets/ethereum/0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43/5', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/37a6828e1258729749dec4e599ff3a9a', true, true, '2023-10-17T02:39:35Z', '2023-10-17T02:39:35Z', NOW()),
  ('a1234567-89ab-cdef-0123-456789abcde0'::uuid, 'the-seed', 'The Seed', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"The Seed\" is the first artwork from \"The Cycle\" collection released via the RarePass."}]}]}', '6', '2023-10-17', 'https://opensea.io/assets/ethereum/0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43/6', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/cd486d85038abe77174c91422f96ac95', true, true, '2023-10-17T02:43:11Z', '2023-10-17T02:43:11Z', NOW()),
  ('a1234567-89ab-cdef-0123-456789abcde1'::uuid, 'the-tree', 'The Tree', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"The Tree\" from \"The Cycle\" collection."}]}]}', '4', '2023-10-17', 'https://opensea.io/assets/ethereum/0x826b11a95a9393e8a3cc0c2a7dfc9accb4ff4e43/4', 'single', NULL, 'https://lh3.googleusercontent.com/XJQN_ZXcOG8UxiadHPshYK1UP1uyaGRlq3---yAEtGvyUgnKgjK27HQa7wrQJwkcQbSXPMYhuaWd9SPVDml8WR7_Mm_8PZ0ZmhJg=s1000', false, true, '2023-10-17T02:38:23Z', '2023-10-17T02:38:23Z', NOW());

-- OMENTEJOVEM 1/1s Collection
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('b1234567-89ab-cdef-0123-456789abcdef'::uuid, 'my-desires-take-me-places', 'My Desires Take Me Places My Eclipse Can''t', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A deep exploration of desire and limitation, this piece represents the eternal struggle between what we want and what constrains us."}]}]}', '13', '2024-07-30', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/13', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/3940fc193848a282cc8e55c8429683e6', false, true, '2024-07-30T15:16:35Z', '2024-07-30T15:16:35Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde0'::uuid, 'between-sun-and-moon', 'Between The Sun and Moon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A collaboration between omentejovem and Jesperish, standing between the sun and the moon. We live on opposite sides of the Earth, looking at the same sun and moon. Realizing we share the same universe, we express our desire for freedom and belonging."}]}]}', '12', '2024-06-20', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/12', 'single', NULL, 'https://arweave.net/juAsZJbdJKTaDXRv189d2yHAASWt4zhRj8tSh-bKvOw', false, true, '2024-06-20T18:13:47Z', '2024-06-20T18:13:47Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde1'::uuid, 'ups-and-downs', 'Ups and Downs', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Artwork created burning 9 \"Mc Moon\" ERC-1155 editions. First owner can claim \"The Plate\" - a unique piece numbered as 1 of 1, titled, signed, and dated."}]}]}', '11', '2024-05-22', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/11', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/14cba84592f50827bb5d18e251deaa1c', false, true, '2024-05-22T15:06:59Z', '2024-05-22T15:06:59Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde2'::uuid, 'everything-we-could-have-lived', 'Everything We Could Have Lived/Remains in My Heart', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Click in the image to show the \"Remains in My Heart\", the second concept."}]}]}', '10', '2023-11-14', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/10', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/838e1ac318af97f356739e7d48b5a96b', false, true, '2023-11-14T16:29:59Z', '2023-11-14T16:29:59Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde3'::uuid, 'out-of-babylon', 'Out of Babylon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Personally, this artwork symbolizes change for me. I have made the difficult decision to move back to the countryside, to be closer to old friends and family."}]}]}', '9', '2023-05-16', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/9', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/fc01fcd499e1dcc78853ae81b9e85d97', false, true, '2023-05-16T19:32:23Z', '2023-05-16T19:32:23Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde4'::uuid, 'musician-at-ipanema-beach', 'Musician at Ipanema''s Beach', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"With his dog. Despite the abstract shape in the upper right corner resembling my recent artwork \"Mc Moon\", it was built with the intention of representing the famous \"Two Brothers Hill\" that is on Ipanema''s beach."}]}]}', '5', '2023-01-24', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/5', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/bb4200ca3c1857c8426893fb7733fb6e', false, true, '2023-01-24T19:02:35Z', '2023-01-24T19:02:35Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde5'::uuid, 'the-moon', 'The Moon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Click in \"The Dot\" to flip the image."}]}]}', '2', '2022-11-17', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/2', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/4160cd12e29717d1f695ed9f40c34885', false, true, '2022-11-17T19:03:47Z', '2022-11-17T19:03:47Z', NOW()),
  ('b1234567-89ab-cdef-0123-456789abcde6'::uuid, 'the-dot', 'The Dot', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The Dot, 2022."}]}]}', '1', '2022-11-03', 'https://opensea.io/assets/ethereum/0xfda33af4770d844dc18d8788c7bf84accfac79ad/1', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/f9baf6dc256e300d501ef4a512613922', true, true, '2022-11-03T18:02:35Z', '2022-11-03T18:02:35Z', NOW());

-- Shapes & Colors Collection
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('c1234567-89ab-cdef-0123-456789abcdef'::uuid, 'decimo', 'Décimo', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Décimo, Shapes & Colors, 2022."}]}]}', '10', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/10', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/de5f67e5b7e24f12bb49a1083acc38ee', false, true, '2022-09-29T17:26:23Z', '2022-09-29T17:26:23Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde0'::uuid, 'nono', 'Nono', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Nono, Shapes & Colors, 2022."}]}]}', '9', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/9', 'single', NULL, 'https://arweave.net/bnSuqAQZhLY6HHUK5krMHuXnZWdhkeX4Vzee9m9aadc', false, true, '2022-09-29T17:23:23Z', '2022-09-29T17:23:23Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde1'::uuid, 'oitavo', 'Oitavo', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Oitavo, Shapes & Colors, 2022."}]}]}', '8', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/8', 'single', NULL, 'https://arweave.net/bnSuqAQZhLY6HHUK5krMHuXnZWdhkeX4Vzee9m9aadc', false, true, '2022-09-29T17:20:35Z', '2022-09-29T17:20:35Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde2'::uuid, 'setimo', 'Sétimo', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Sétimo, Shapes & Colors, 2022."}]}]}', '7', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/7', 'single', NULL, 'https://arweave.net/bnSuqAQZhLY6HHUK5krMHuXnZWdhkeX4Vzee9m9aadc', false, true, '2022-09-29T17:17:11Z', '2022-09-29T17:17:11Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde3'::uuid, 'sexto', 'Sexto', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Sexto, Shapes & Colors, 2022."}]}]}', '6', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/6', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/df62aa270e26f2cfecb73dcfd12d7c80', false, true, '2022-09-29T17:13:47Z', '2022-09-29T17:13:47Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde4'::uuid, 'quinto', 'Quinto', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Quinto, Shapes & Colors, 2022."}]}]}', '5', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/5', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/2ace52c160c9b1cde522b9a39925040d', false, true, '2022-09-29T17:10:47Z', '2022-09-29T17:10:47Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde5'::uuid, 'quarto', 'Quarto', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Quarto, Shapes & Colors, 2022."}]}]}', '4', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/4', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/1520be25cbc0e2c610c8b716045968d4', false, true, '2022-09-29T17:07:23Z', '2022-09-29T17:07:23Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde6'::uuid, 'terceiro', 'Terceiro', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Terceiro, Shapes & Colors, 2022."}]}]}', '3', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/3', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/55190ae246fb5d527a623feaaa393b03', false, true, '2022-09-29T17:07:11Z', '2022-09-29T17:07:11Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde7'::uuid, 'segundo', 'Segundo', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Segundo, Shapes & Colors, 2022."}]}]}', '2', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/2', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/3f911207d44647c73224d602b880b724', false, true, '2022-09-29T17:06:23Z', '2022-09-29T17:06:23Z', NOW()),
  ('c1234567-89ab-cdef-0123-456789abcde8'::uuid, 'primeiro', 'Primeiro', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Primeiro, Shapes & Colors, 2022."}]}]}', '1', '2022-09-29', 'https://opensea.io/assets/ethereum/0x2b3bbde45422d65ab3fb5cdc5427944db0729b50/1', 'single', NULL, 'https://nft-cdn.alchemy.com/eth-mainnet/61bfa352aef103e47058cd1135f53336', false, true, '2022-09-29T17:02:59Z', '2022-09-29T17:02:59Z', NOW());

-- OMENTEJOVEM's Editions
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('d1234567-89ab-cdef-0123-456789abcdef'::uuid, 'ether-man-ii', 'Ether-Man II', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"Ether-Man ll\" is a continuation from my first ever edition on Ethereum Blockchain called \"Ether-Man\", which firstly was minted on 01/11/2021 through the OpenSea Shared contract but has the ability to burn and get it on my own contract."}]}]}', '11', '2024-01-30', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/11', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/e378d7627f75532112c11cc67bb02a26', false, false, '2024-01-30T00:00:00Z', '2024-01-30T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde0'::uuid, 'look-at-the-sun-moon', 'Look at The Sun, Look at The Moon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Look at the sun or look at the moon? Artwork first share on 1st November 22, and reworked near date of this mint."}]}]}', '10', '2023-07-06', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/10', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/0e07ae6181c6aaf0247e8cf1b6285aff', false, false, '2023-07-06T00:00:00Z', '2023-07-06T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde1'::uuid, 'fruit-minimalism-overlap', 'Fruit of Minimalism and Overlap', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Result of spontaneous and ''amiss'' act, compared to the work and final concept entitled and minted as \"The Search\". Acceptance of the simple and minimalistic – the feeling of stepping out of the comfort complex."}]}]}', '9', '2023-03-09', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/9', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/2b1bf215461346842e2cf144c1e89c23', false, false, '2023-03-09T00:00:00Z', '2023-03-09T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde2'::uuid, 'mc-moon', 'Mc Moon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Mc Moon, I''m Lovin'' It. Created using \"Orange Moon\" (\"Late Night Love\" fragment) design."}]}]}', '8', '2022-12-28', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/8', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/4ca4c162c5ab3a20b42e6c0c26249abe', false, false, '2022-12-28T00:00:00Z', '2022-12-28T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde3'::uuid, 'purple-moon', 'Purple Moon', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Purple Moon, the \"Orange Moon\" (\"Late Night Love\" fragment), in reverse."}]}]}', '7', '2022-12-01', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/7', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/5bb3b35016999e4caf1eef82c02eb4ad', false, false, '2022-12-01T00:00:00Z', '2022-12-01T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde4'::uuid, 'ether-man', 'Ether-Man', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"\"An abstraction study representing the important relationship between artist-collector on the journey of JPEG''s.\" Ether-Man was the first ever ETH edition I made."}]}]}', '6', '2022-09-08', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/6', 'edition', 10, 'https://nft-cdn.alchemy.com/eth-mainnet/4981accf6e79580573d36c3e68149f58', false, false, '2022-09-08T00:00:00Z', '2022-09-08T00:00:00Z', NOW()),
  ('d1234567-89ab-cdef-0123-456789abcde5'::uuid, 'untitled-edition', 'Untitled', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Untitled, artwork born in internet 7th September, 2021."}]}]}', '5', '2022-09-06', 'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/5', 'edition', 50, 'https://nft-cdn.alchemy.com/eth-mainnet/377f5ac790e6b75fe0fa4baeb1ecd760', false, false, '2022-09-06T00:00:00Z', '2022-09-06T00:00:00Z', NOW());

-- Tezos Collection
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('e1234567-89ab-cdef-0123-456789abcdef'::uuid, 'id-ego-superego', 'Id, Ego and Superego', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Artwork first shared on 8th December, 2021."}]}]}', '13', '2023-02-25', 'https://objkt.com/asset/KT1NvaAU5oqfvhBcapnE9BbSiWHNVVnKjmHB/13', 'single', NULL, 'https://ipfs.io/ipfs/QmNwqDiQGCmAJA3cWzUpk8AYz2r1Ze7iFVRy9RnQc7wEiJ', false, true, '2023-02-25T16:28:18Z', '2023-02-25T16:28:18Z', NOW()),
  ('e1234567-89ab-cdef-0123-456789abcde0'::uuid, 'destructive-thoughts', 'Destructive Thoughts', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Destructive Thoughts, 2021."}]}]}', '510906', '2021-11-05', 'https://objkt.com/asset/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/510906', 'edition', 10, 'https://ipfs.io/ipfs/QmSEsJPHnzb2J33uU9qmy58NuKdWZRUxaHuih9D2BuacD7', false, false, '2021-11-05T19:16:48Z', '2021-11-05T19:16:48Z', NOW()),
  ('e1234567-89ab-cdef-0123-456789abcde1'::uuid, 'untitled-tezos-1', 'Untitled', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Untitled piece from Tezos collection."}]}]}', '476826', '2021-10-26', 'https://objkt.com/asset/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/476826', 'edition', 10, 'https://ipfs.io/ipfs/QmWrCxLWk335GDrzTGWmEmgDsdmES3UcyBzvYwP9vxa3ao', false, false, '2021-10-26T19:46:22Z', '2021-10-26T19:46:22Z', NOW()),
  ('e1234567-89ab-cdef-0123-456789abcde2'::uuid, 'my-feelings-on-jpeg', 'My Feelings On a JPEG', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"My feelings expressed through a JPEG format."}]}]}', '448564', '2021-10-18', 'https://objkt.com/asset/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/448564', 'edition', 10, 'https://ipfs.io/ipfs/QmZs9dXLESHB2x4DLvm7iafQrH8n3vri9cHsQyDPDAJig8', false, false, '2021-10-18T19:27:14Z', '2021-10-18T19:27:14Z', NOW()),
  ('e1234567-89ab-cdef-0123-456789abcde3'::uuid, 'man-and-creativity', 'the man and his creativity', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"An exploration of the relationship between man and his creative expression."}]}]}', '240867', '2021-08-29', 'https://objkt.com/asset/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/240867', 'edition', 15, 'https://ipfs.io/ipfs/QmdSV6y1V6ZgXoD4yE3bKjceAoiDRKW3NwtUi4KHQvXqE7', false, false, '2021-08-29T19:00:16Z', '2021-08-29T19:00:16Z', NOW()),
  ('e1234567-89ab-cdef-0123-456789abcde4'::uuid, 'untitled-genesis', 'UNTITLED_genesis', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The genesis untitled piece."}]}]}', '135137', '2021-06-16', 'https://objkt.com/asset/KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton/135137', 'single', NULL, 'https://ipfs.io/ipfs/QmSiFnsU7egS7s6x6xEpcsdYtfYyDJ5FmgaF71hsJ9MFH8', false, true, '2021-06-16T17:56:18Z', '2021-06-16T17:56:18Z', NOW());

-- New Series - Stories on Circles
INSERT INTO public.artworks (id, slug, title, description, token_id, mint_date, mint_link, type, editions_total, image_url, is_featured, is_one_of_one, posted_at, created_at, updated_at)
VALUES
  ('f1234567-89ab-cdef-0123-456789abcdef'::uuid, 'sitting-at-the-edge', 'Sitting at the Edge', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"First piece from the Stories on Circles collection - exploring the boundary between known and unknown."}]}]}', '1', '2025-05-30', NULL, 'single', NULL, '/new_series/1_Sitting_at_the_Edge.jpg', true, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde0'::uuid, 'two-voices-one-circle', 'Two Voices, One Circle', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"A dialogue between two perspectives unified within a single form."}]}]}', '2', '2025-05-30', NULL, 'single', NULL, '/new_series/2_Two_Voices,_One_Circle.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde1'::uuid, 'ground-was-my-teacher', 'The Ground Was My Teacher', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Learning from the earth beneath our feet - wisdom found in the most fundamental elements."}]}]}', '3', '2025-05-30', NULL, 'single', NULL, '/new_series/3_The_Ground_Was_My_Teacher.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde2'::uuid, 'i-had-dreams-about-you', 'I Had Dreams About You', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"An intimate exploration of dreams, memory, and connection across time and space."}]}]}', '4', '2025-05-30', NULL, 'single', NULL, '/new_series/4_I_Had_Dreams_About_You.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde3'::uuid, 'mapping-the-unseen', 'Mapping the Unseen', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Charting territories that exist beyond the visible - inner landscapes of the mind and soul."}]}]}', '5', '2025-05-30', NULL, 'single', NULL, '/new_series/5_Mapping_the_Unseen.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde4'::uuid, 'playing-chess-with-love', 'Playing Chess with Love', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The strategic dance of romance - where every move matters and the heart is both player and prize."}]}]}', '6', '2025-05-30', NULL, 'single', NULL, '/new_series/6_Playing_Chess_with_Love.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde5'::uuid, 'all-time-high-discovery', 'All Time High Discovery', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"That moment of peak revelation - when understanding reaches its highest point."}]}]}', '7', '2025-05-30', NULL, 'single', NULL, '/new_series/7_All_Time_High_Discovery.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde6'::uuid, 'i-am-where-you-arent', 'I Am Where You Aren''t', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Exploring the spaces between presence and absence, connection and solitude."}]}]}', '8', '2025-05-30', NULL, 'single', NULL, '/new_series/8_I_Am_Where_You_Arent.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde7'::uuid, 'before-birth', 'Before Birth', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The liminal space before existence - potential energy waiting to become reality."}]}]}', '9', '2025-05-30', NULL, 'single', NULL, '/new_series/9_Before_Birth.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW()),
  ('f1234567-89ab-cdef-0123-456789abcde8'::uuid, 'he-left-as-a-dot', 'He Left as a Dot', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The final piece - where everything reduces to its essential form, a single point of meaning."}]}]}', '10', '2025-05-30', NULL, 'single', NULL, '/new_series/10_He_Left_as_a_Dot.jpg', false, true, '2025-05-30T02:43:59Z', '2025-05-30T02:43:59Z', NOW())
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  mint_date = EXCLUDED.mint_date,
  mint_link = EXCLUDED.mint_link,
  image_url = EXCLUDED.image_url,
  is_featured = EXCLUDED.is_featured,
  is_one_of_one = EXCLUDED.is_one_of_one,
  updated_at = NOW();

-- =====================================================
-- SERIES-ARTWORKS RELATIONSHIPS
-- =====================================================

-- The Cycle Series
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcdef'::uuid, 'a1234567-89ab-cdef-0123-456789abcdef'::uuid), -- The Flower
  ('01234567-89ab-cdef-0123-456789abcdef'::uuid, 'a1234567-89ab-cdef-0123-456789abcde0'::uuid), -- The Seed
  ('01234567-89ab-cdef-0123-456789abcdef'::uuid, 'a1234567-89ab-cdef-0123-456789abcde1'::uuid)  -- The Tree
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- OMENTEJOVEM 1/1s Series
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcdef'::uuid), -- My Desires Take Me Places
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde0'::uuid), -- Between Sun and Moon
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde1'::uuid), -- Ups and Downs
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde2'::uuid), -- Everything We Could Have Lived
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde3'::uuid), -- Out of Babylon
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde4'::uuid), -- Musician at Ipanema Beach
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde5'::uuid), -- The Moon
  ('01234567-89ab-cdef-0123-456789abcde0'::uuid, 'b1234567-89ab-cdef-0123-456789abcde6'::uuid)  -- The Dot
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- Shapes & Colors Series
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcdef'::uuid), -- Décimo
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde0'::uuid), -- Nono
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde1'::uuid), -- Oitavo
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde2'::uuid), -- Sétimo
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde3'::uuid), -- Sexto
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde4'::uuid), -- Quinto
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde5'::uuid), -- Quarto
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde6'::uuid), -- Terceiro
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde7'::uuid), -- Segundo
  ('01234567-89ab-cdef-0123-456789abcde1'::uuid, 'c1234567-89ab-cdef-0123-456789abcde8'::uuid)  -- Primeiro
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- OMENTEJOVEM's Editions Series
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcdef'::uuid), -- Ether-Man II
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde0'::uuid), -- Look at The Sun, Look at The Moon
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde1'::uuid), -- Fruit of Minimalism and Overlap
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde2'::uuid), -- Mc Moon
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde3'::uuid), -- Purple Moon
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde4'::uuid), -- Ether-Man
  ('01234567-89ab-cdef-0123-456789abcde2'::uuid, 'd1234567-89ab-cdef-0123-456789abcde5'::uuid)  -- Untitled
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- Tezos Collection Series
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcdef'::uuid), -- Id, Ego and Superego
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcde0'::uuid), -- Destructive Thoughts
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcde1'::uuid), -- Untitled
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcde2'::uuid), -- My Feelings On a JPEG
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcde3'::uuid), -- the man and his creativity
  ('01234567-89ab-cdef-0123-456789abcde4'::uuid, 'e1234567-89ab-cdef-0123-456789abcde4'::uuid)  -- UNTITLED_genesis
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- New Series - Stories on Circles
INSERT INTO public.series_artworks (series_id, artwork_id)
VALUES
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcdef'::uuid), -- Sitting at the Edge
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde0'::uuid), -- Two Voices, One Circle
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde1'::uuid), -- The Ground Was My Teacher
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde2'::uuid), -- I Had Dreams About You
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde3'::uuid), -- Mapping the Unseen
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde4'::uuid), -- Playing Chess with Love
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde5'::uuid), -- All Time High Discovery
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde6'::uuid), -- I Am Where You Aren't
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde7'::uuid), -- Before Birth
  ('01234567-89ab-cdef-0123-456789abcde6'::uuid, 'f1234567-89ab-cdef-0123-456789abcde8'::uuid)  -- He Left as a Dot
ON CONFLICT (series_id, artwork_id) DO NOTHING;

-- =====================================================
-- ARTIFACTS DATA
-- =====================================================

INSERT INTO public.artifacts (id, title, description, highlight_video_url, link_url, image_url, created_at, updated_at)
VALUES
  ('91234567-89ab-cdef-0123-456789abcdef'::uuid, 'Stories on Circles Print Collection', 'Physical prints of the Stories on Circles series - bridging digital and physical art.', '/crate.mp4', 'https://www.omentejovem.com/', '/S&C Cover.jpg', NOW(), NOW()),
  ('91234567-89ab-cdef-0123-456789abcde0'::uuid, 'The Cycle Collection', 'A meditation on cycles of nature and existence through abstract digital art.', NULL, 'https://opensea.io/collection/the3cycle', '/TheCycleCover.jpg', NOW(), NOW()),
  ('91234567-89ab-cdef-0123-456789abcde1'::uuid, 'Stories on Circles Cover', 'Cover art for the Stories on Circles collection showcasing the unified aesthetic.', NULL, NULL, '/Stories on Circles Cover.jpg', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  highlight_video_url = EXCLUDED.highlight_video_url,
  link_url = EXCLUDED.link_url,
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- =====================================================
-- ABOUT PAGE CONTENT
-- =====================================================

INSERT INTO public.about_page (id, content, created_at, updated_at)
VALUES
  ('81234567-89ab-cdef-0123-456789abcdef'::uuid,
   '{
     "type": "doc",
     "content": [
       {
         "type": "heading",
         "attrs": {"level": 1},
         "content": [{"type": "text", "text": "About Omentejovem"}]
       },
       {
         "type": "paragraph",
         "content": [
           {
             "type": "text",
             "text": "Omentejovem is a digital artist exploring the intersection of technology, nature, and human creativity. Through abstract digital compositions, the work investigates cycles of existence, emotional landscapes, and the relationship between artist and collector in the digital art space."
           }
         ]
       },
       {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Artistic Journey"}]
       },
       {
         "type": "paragraph",
         "content": [
           {
             "type": "text",
             "text": "From the early genesis pieces on Tezos to the acclaimed Shapes & Colors collection on Ethereum, omentejovem has consistently pushed boundaries in digital art expression. The work spans multiple blockchains and platforms, each piece carefully crafted to explore themes of connection, transformation, and the beauty found in abstract forms."
           }
         ]
       },
       {
         "type": "heading",
         "attrs": {"level": 2},
         "content": [{"type": "text", "text": "Philosophy"}]
       },
       {
         "type": "paragraph",
         "content": [
           {
             "type": "text",
             "text": "\"We are part of a grand cycle, and we can observe examples of it in the most simple and common things in the world. Things begin and end. Things begin, end and they start over. All the time.\" This philosophy permeates through all works, celebrating the cyclical nature of existence and the constant state of becoming."
           }
         ]
       }
     ]
   }',
   NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data insertion
SELECT 'Database seeded successfully! 🎉' as status;

-- Check series count
SELECT 'Series created: ' || COUNT(*) FROM public.series;

-- Check artworks count
SELECT 'Artworks created: ' || COUNT(*) FROM public.artworks;

-- Check series-artworks relationships
SELECT 'Series-artwork relationships: ' || COUNT(*) FROM public.series_artworks;

-- Check artifacts
SELECT 'Artifacts created: ' || COUNT(*) FROM public.artifacts;

-- Check about page
SELECT 'About page created: ' || CASE WHEN COUNT(*) > 0 THEN 'Yes' ELSE 'No' END FROM public.about_page;

-- Show featured artworks
SELECT 'Featured artworks:', title FROM public.artworks WHERE is_featured = true;

-- Show series with artwork counts
SELECT
  s.name as series_name,
  COUNT(sa.artwork_id) as artwork_count
FROM public.series s
LEFT JOIN public.series_artworks sa ON s.id = sa.series_id
GROUP BY s.id, s.name
ORDER BY artwork_count DESC;

COMMIT;
