-- Add event_id column and foreign key constraint
ALTER TABLE notifications
  ADD COLUMN event_id INT NULL AFTER user_id,
  ADD CONSTRAINT fk_notifications_event
    FOREIGN KEY (event_id)
    REFERENCES events(id)
    ON DELETE SET NULL;

-- Add title column
ALTER TABLE notifications
  ADD COLUMN title VARCHAR(255) NOT NULL AFTER event_id; 