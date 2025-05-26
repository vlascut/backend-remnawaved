SELECT 
    DATE(created_at) as "date",
    SUM(total_bytes) as "bytes"
FROM nodes_usage_history 
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY DATE(created_at)
ORDER BY "date";