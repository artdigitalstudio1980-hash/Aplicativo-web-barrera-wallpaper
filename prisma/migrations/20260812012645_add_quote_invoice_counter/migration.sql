yarn run v1.22.22
$ /home/art-digital-studio/Documentos/Aplicativo-Web-BARRERA-WALLPAPER/node_modules/.bin/prisma migrate diff --from-schema-datamodel /tmp/schema_old.prisma --to-schema-datamodel prisma/schema.prisma --script
-- CreateTable
CREATE TABLE `Quote` (
    `id` VARCHAR(191) NOT NULL,
    `quoteNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'US',
    `items` JSON NOT NULL,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `taxRate` DOUBLE NOT NULL DEFAULT 7,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED') NOT NULL DEFAULT 'DRAFT',
    `validUntil` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `terms` JSON NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'es',
    `installationId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Quote_quoteNumber_key`(`quoteNumber`),
    INDEX `Quote_status_idx`(`status`),
    INDEX `Quote_userId_idx`(`userId`),
    INDEX `Quote_installationId_idx`(`installationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `quoteId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `address1` VARCHAR(191) NULL,
    `address2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'US',
    `items` JSON NOT NULL,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `taxRate` DOUBLE NOT NULL DEFAULT 7,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `depositRequired` BOOLEAN NOT NULL DEFAULT true,
    `depositAmount` DOUBLE NOT NULL DEFAULT 0,
    `amountPaid` DOUBLE NOT NULL DEFAULT 0,
    `payments` JSON NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `status` ENUM('DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID') NOT NULL DEFAULT 'DRAFT',
    `dueDate` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `terms` JSON NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'es',
    `sentAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Invoice_quoteId_key`(`quoteId`),
    INDEX `Invoice_status_idx`(`status`),
    INDEX `Invoice_userId_idx`(`userId`),
    INDEX `Invoice_quoteId_idx`(`quoteId`),
    INDEX `Invoice_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentCounter` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `lastNumber` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DocumentCounter_type_year_key`(`type`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Done in 0.94s.
