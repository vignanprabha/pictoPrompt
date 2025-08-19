USE flight_ai_game;
/* Insert 6 easy, 7 medium, 7 hard. Update file_path to match real files in backend/static/images/... */
INSERT INTO images (id, level, file_path, original_prompt, active) VALUES
(UUID(),'easy','images/easy/e1.png','red airplane over clouds, blue sky',1),
(UUID(),'easy','images/easy/e2.png','red airplane over clouds, blue sky',1),
(UUID(),'easy','images/easy/e3.png','red airplane over clouds, blue sky',1),
(UUID(),'easy','images/easy/e4.png','red airplane over clouds, blue sky',1),
(UUID(),'easy','images/easy/e5.png','red airplane over clouds, blue sky',1),
(UUID(),'easy','images/easy/e6.png','red airplane over clouds, blue sky',1),

(UUID(),'medium','images/medium/m1.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m2.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m3.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m4.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m5.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m6.png','retro-futuristic jet, neon city, synthwave, dusk',1),
(UUID(),'medium','images/medium/m7.png','retro-futuristic jet, neon city, synthwave, dusk',1),

(UUID(),'hard','images/hard/h1.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h2.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h3.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h4.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h5.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h6.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1),
(UUID(),'hard','images/hard/h7.png','ultra-detailed airplane cockpit at night, hdr, 8k, instrument bokeh',1);
