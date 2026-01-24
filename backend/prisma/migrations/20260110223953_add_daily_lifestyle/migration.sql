-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nik` VARCHAR(16) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('patient', 'nurse', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
    `phone` VARCHAR(20) NULL,
    `birthDate` DATE NULL,
    `gender` ENUM('male', 'female') NULL,
    `address` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_nik_key`(`nik`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `age` INTEGER NULL,
    `weight` DECIMAL(5, 2) NULL,
    `height` DECIMAL(5, 2) NULL,
    `hereditaryHistory` JSON NULL,
    `comorbidities` JSON NULL,
    `lifestyle` JSON NULL,
    `stressLevel` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
    `dietPattern` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `patient_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blood_pressure_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `systolic` INTEGER NOT NULL,
    `diastolic` INTEGER NOT NULL,
    `pulse` INTEGER NULL,
    `classification` ENUM('normal', 'prehypertension', 'hypertension_1', 'hypertension_2', 'crisis') NOT NULL,
    `inputBy` ENUM('patient', 'nurse') NOT NULL DEFAULT 'patient',
    `nurseId` INTEGER NULL,
    `notes` TEXT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `type` ENUM('medication', 'exercise', 'diet', 'stress_management') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prescriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `doctorId` INTEGER NOT NULL,
    `medicationName` VARCHAR(200) NOT NULL,
    `dosage` VARCHAR(100) NOT NULL,
    `frequency` VARCHAR(100) NOT NULL,
    `duration` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `isEmergency` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `type` ENUM('medication', 'checkup', 'blood_pressure_input') NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_lifestyles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patientId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `breakfast` TEXT NULL,
    `lunch` TEXT NULL,
    `dinner` TEXT NULL,
    `snacks` TEXT NULL,
    `waterIntake` INTEGER NULL,
    `stressLevel` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'low',
    `stressNotes` TEXT NULL,
    `activityLevel` ENUM('sedentary', 'light', 'moderate', 'active', 'very_active') NOT NULL DEFAULT 'sedentary',
    `activities` TEXT NULL,
    `exerciseMinutes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `daily_lifestyles_patientId_date_key`(`patientId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patient_profiles` ADD CONSTRAINT `patient_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_pressure_records` ADD CONSTRAINT `blood_pressure_records_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blood_pressure_records` ADD CONSTRAINT `blood_pressure_records_nurseId_fkey` FOREIGN KEY (`nurseId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recommendations` ADD CONSTRAINT `recommendations_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prescriptions` ADD CONSTRAINT `prescriptions_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_lifestyles` ADD CONSTRAINT `daily_lifestyles_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
