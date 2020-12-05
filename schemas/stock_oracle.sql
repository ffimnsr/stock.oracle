-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.3.27-MariaDB-log-cll-lve - MariaDB Server
-- Server OS:                    Linux
-- HeidiSQL Version:             11.1.0.6116
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for fourwfhj_pse_stocks
DROP DATABASE IF EXISTS `fourwfhj_pse_stocks`;
CREATE DATABASE IF NOT EXISTS `fourwfhj_pse_stocks` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `fourwfhj_pse_stocks`;

-- Dumping structure for table fourwfhj_pse_stocks.eod_stock_data
DROP TABLE IF EXISTS `eod_stock_data`;
CREATE TABLE IF NOT EXISTS `eod_stock_data` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `open` decimal(18,2) DEFAULT NULL,
  `high` decimal(18,2) DEFAULT NULL,
  `low` decimal(18,2) DEFAULT NULL,
  `close` decimal(18,2) DEFAULT NULL,
  `volume` decimal(18,1) DEFAULT NULL,
  `symbol` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `index_esd_indexes` (`symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=1106357 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.eod_stock_data_test
DROP TABLE IF EXISTS `eod_stock_data_test`;
CREATE TABLE IF NOT EXISTS `eod_stock_data_test` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `open` decimal(18,2) DEFAULT NULL,
  `high` decimal(18,2) DEFAULT NULL,
  `low` decimal(18,2) DEFAULT NULL,
  `close` decimal(18,2) DEFAULT NULL,
  `volume` decimal(18,1) DEFAULT NULL,
  `symbol` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `index_esd_indexes` (`symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=1106622 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.journals
DROP TABLE IF EXISTS `journals`;
CREATE TABLE IF NOT EXISTS `journals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_id` int(11) DEFAULT 0,
  `status` smallint(6) DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.sectors
DROP TABLE IF EXISTS `sectors`;
CREATE TABLE IF NOT EXISTS `sectors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `index_id` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_sectoral` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.security_types
DROP TABLE IF EXISTS `security_types`;
CREATE TABLE IF NOT EXISTS `security_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.stocks
DROP TABLE IF EXISTS `stocks`;
CREATE TABLE IF NOT EXISTS `stocks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `symbol` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(70) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` smallint(6) DEFAULT NULL,
  `listed_date` date DEFAULT NULL,
  `sector_id` int(11) DEFAULT NULL,
  `subsector_id` int(11) DEFAULT NULL,
  `security_status` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_type` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_id` mediumint(9) DEFAULT NULL,
  `security_symbol_id` mediumint(9) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `index_ss_uniques` (`symbol`)
) ENGINE=InnoDB AUTO_INCREMENT=336 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.subsectors
DROP TABLE IF EXISTS `subsectors`;
CREATE TABLE IF NOT EXISTS `subsectors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `index_id` varchar(60) NOT NULL,
  `name` varchar(60) NOT NULL,
  `internal_pse_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.trades
DROP TABLE IF EXISTS `trades`;
CREATE TABLE IF NOT EXISTS `trades` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `journal_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `transaction_date_start` datetime DEFAULT current_timestamp(),
  `transaction_date_end` datetime DEFAULT NULL,
  `type` smallint(6) NOT NULL DEFAULT 1,
  `shares` decimal(18,1) DEFAULT NULL,
  `avg_buy_price` decimal(18,2) DEFAULT NULL,
  `buy_amount` decimal(18,2) DEFAULT NULL,
  `avg_sell_price` decimal(18,2) DEFAULT NULL,
  `sell_amount` decimal(18,2) DEFAULT NULL,
  `status` smallint(6) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.trade_transactions
DROP TABLE IF EXISTS `trade_transactions`;
CREATE TABLE IF NOT EXISTS `trade_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `journal_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `action` smallint(6) NOT NULL,
  `gross_price` decimal(18,2) NOT NULL,
  `shares` decimal(18,1) NOT NULL,
  `gross_amount` decimal(18,2) NOT NULL,
  `fees` decimal(18,2) NOT NULL,
  `net_amount` decimal(18,2) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.wallets
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `journal_id` int(11) NOT NULL,
  `balance` decimal(18,2) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table fourwfhj_pse_stocks.wallet_transactions
DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `journal_id` int(11) NOT NULL,
  `transaction_date` datetime NOT NULL,
  `action` smallint(6) NOT NULL,
  `gross_amount` decimal(18,2) NOT NULL,
  `fees` decimal(18,2) NOT NULL,
  `net_amount` decimal(18,2) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
