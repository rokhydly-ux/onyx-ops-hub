console.log(`
ALTER TABLE marketing_articles
ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS author_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_read_time VARCHAR(50);
`);
