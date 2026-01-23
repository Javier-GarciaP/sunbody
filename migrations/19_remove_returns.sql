-- Drop returns table if it exists
DROP TABLE IF EXISTS returns;

-- Remove returns from sqlite_sequence if it exists
DELETE FROM sqlite_sequence WHERE name = 'returns';
