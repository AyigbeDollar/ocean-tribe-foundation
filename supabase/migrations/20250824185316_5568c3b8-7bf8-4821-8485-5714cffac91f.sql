-- Make bright.selorm.elikem@gmail.com an admin
INSERT INTO user_roles (user_id, role) 
VALUES ('ef9a9f69-4cac-4e36-9c5f-386b09908af9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;