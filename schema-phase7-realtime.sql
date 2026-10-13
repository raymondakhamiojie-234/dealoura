-- Optional: Enable Supabase Realtime publication on messages table for instant zero-latency WebSockets
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
