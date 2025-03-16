-- Create users table
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'user') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create document_requests table
CREATE TABLE `document_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(255) NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `year_level` VARCHAR(50) NOT NULL,
  `course` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `document_type` VARCHAR(255) NOT NULL,
  `purpose` TEXT NOT NULL,
  `status` ENUM('pending', 'processing', 'ready', 'completed') NOT NULL DEFAULT 'pending',
  `queue_number` INT NOT NULL,
  `requested_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add indexes for better performance
CREATE INDEX `idx_document_requests_status` ON `document_requests` (`status`);
CREATE INDEX `idx_document_requests_user_id` ON `document_requests` (`user_id`);

-- Insert sample admin user (password: admin123)
INSERT INTO `users` (`username`, `password`, `role`) VALUES 
('admin', '5906ac361a137e2d286465cd6588ebb5ac3f5ae955001100bc41577c3d751764.c97f0ee4a7f70dd3ee3e0745c08c95e3', 'admin');

-- Insert sample user (password: user123)
INSERT INTO `users` (`username`, `password`, `role`) VALUES 
('user', '6b97ed68d14eb3f1aa959ce5d49c7dc612e1eb1dafd73b1e705847483fd6a6c8.8f87d9ea7af79807a68641a9d5eb8860', 'user');

-- Insert sample document requests
INSERT INTO `document_requests` 
(`student_id`, `student_name`, `year_level`, `course`, `email`, `document_type`, `purpose`, `status`, `queue_number`, `user_id`)
VALUES
('2023-0001', 'John Doe', '3rd Year', 'Bachelor of Science in Information Technology', 'john.doe@example.com', 'Transcript of Records', 'For job application', 'pending', 1, 2),
('2023-0002', 'Jane Smith', '2nd Year', 'Bachelor of Science in Computer Science', 'jane.smith@example.com', 'Good Moral Certificate', 'For scholarship application', 'processing', 2, 2);
