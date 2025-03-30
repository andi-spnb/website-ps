-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 30 Mar 2025 pada 14.49
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kenzie_gaming`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `devices`
--

CREATE TABLE `devices` (
  `device_id` int(11) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `device_type` enum('PS3','PS4','PS5') NOT NULL,
  `status` enum('Available','In Use','Maintenance') DEFAULT 'Available',
  `location` varchar(255) DEFAULT NULL,
  `added_date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `devices`
--

INSERT INTO `devices` (`device_id`, `device_name`, `device_type`, `status`, `location`, `added_date`, `createdAt`, `updatedAt`) VALUES
(1, 'PS-01', 'PS4', 'In Use', 'Ruang 1', '2025-01-28 14:26:59', '2025-01-28 14:26:59', '2025-03-30 16:36:42'),
(2, 'PS-02', 'PS5', 'In Use', 'Ruang 1', '2025-01-28 14:26:59', '2025-01-28 14:26:59', '2025-03-30 16:55:04'),
(3, 'PS-03', 'PS4', 'Available', 'Ruang 2', '2025-01-28 14:26:59', '2025-01-28 14:26:59', '2025-03-29 21:28:49'),
(4, 'PS-04', 'PS5', 'Available', 'Ruang 2', '2025-02-27 14:26:59', '2025-02-27 14:26:59', '2025-03-29 14:26:59'),
(5, 'PS-05', 'PS4', 'Available', 'Ruang 3', '2025-02-27 14:26:59', '2025-02-27 14:26:59', '2025-03-29 14:26:59'),
(6, 'PS-06', 'PS3', 'Available', 'Ruang 3', '2024-12-29 14:26:59', '2024-12-29 14:26:59', '2025-03-29 14:26:59'),
(7, 'PS-07', 'PS3', 'Available', 'Ruang 3', '2024-12-29 14:26:59', '2024-12-29 14:26:59', '2025-03-29 22:08:30'),
(8, 'PS-08', 'PS5', 'Available', 'Ruang 4', '2025-03-14 14:26:59', '2025-03-14 14:26:59', '2025-03-29 14:26:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `food_items`
--

CREATE TABLE `food_items` (
  `item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` enum('Food','Drink','Snack') NOT NULL,
  `price` float NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `food_items`
--

INSERT INTO `food_items` (`item_id`, `name`, `category`, `price`, `stock_quantity`, `image_url`, `is_available`, `createdAt`, `updatedAt`) VALUES
(1, 'Mie Goreng Instan', 'Food', 12000, 23, NULL, 1, '2025-03-29 14:26:59', '2025-03-30 16:55:04'),
(2, 'Coca Cola', 'Drink', 8000, 49, NULL, 1, '2025-03-29 14:26:59', '2025-03-30 16:36:42'),
(3, 'Keripik Kentang', 'Snack', 10000, 15, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(4, 'Nasi Goreng Spesial', 'Food', 25000, 7, NULL, 1, '2025-03-29 14:26:59', '2025-03-30 16:55:04'),
(5, 'Es Teh Manis', 'Drink', 5000, 29, NULL, 1, '2025-03-29 14:26:59', '2025-03-30 16:36:42'),
(6, 'Air Mineral', 'Drink', 4000, 60, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(7, 'Chocolate Bar', 'Snack', 8000, 20, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(8, 'Sandwich', 'Food', 15000, 7, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:45:50'),
(9, 'Kopi Hitam', 'Drink', 7000, 40, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(10, 'Kacang Kulit', 'Snack', 6000, 15, NULL, 1, '2025-03-29 14:26:59', '2025-03-29 14:26:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `food_orders`
--

CREATE TABLE `food_orders` (
  `order_id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `staff_id` int(11) NOT NULL,
  `order_time` datetime NOT NULL,
  `total_amount` float NOT NULL,
  `status` enum('Preparing','Delivered','Cancelled') DEFAULT 'Preparing',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `food_orders`
--

INSERT INTO `food_orders` (`order_id`, `session_id`, `staff_id`, `order_time`, `total_amount`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, '2025-03-27 14:56:59', 20000, 'Delivered', '2025-03-27 14:56:59', '2025-03-27 15:11:59'),
(2, 2, 2, '2025-03-28 15:11:59', 35000, 'Delivered', '2025-03-28 15:11:59', '2025-03-28 15:21:59'),
(3, NULL, 4, '2025-03-29 14:45:50', 40000, 'Preparing', '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(4, NULL, 7, '2025-03-30 16:36:42', 50000, 'Preparing', '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(5, NULL, 7, '2025-03-30 16:55:04', 37000, 'Preparing', '2025-03-30 16:55:04', '2025-03-30 16:55:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `target_id` int(11) NOT NULL,
  `type` enum('TimeWarning','OrderReady','StockLow') NOT NULL,
  `message` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`notification_id`, `target_id`, `type`, `message`, `created_at`, `is_read`, `createdAt`, `updatedAt`) VALUES
(1, 3, 'TimeWarning', 'PlayStation PS-03 akan habis dalam 15 menit', '2025-03-29 04:11:59', 1, '2025-03-29 04:11:59', '2025-03-29 04:11:59'),
(2, 3, 'TimeWarning', 'PlayStation PS-03 akan habis dalam 5 menit', '2025-03-29 04:21:59', 1, '2025-03-29 04:21:59', '2025-03-29 04:21:59'),
(3, 3, 'StockLow', 'Stok Sandwich tinggal 5', '2025-03-29 09:26:59', 0, '2025-03-29 09:26:59', '2025-03-29 09:26:59'),
(4, 3, 'OrderReady', 'Pesanan makanan baru #3', '2025-03-29 14:45:50', 0, '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(5, 1, '', 'Reservasi Playbox baru dari Andi Mappanyukki', '2025-03-30 15:48:49', 0, '2025-03-30 15:48:49', '2025-03-30 15:48:49'),
(6, 4, 'OrderReady', 'Pesanan makanan baru #4', '2025-03-30 16:36:42', 0, '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(7, 2, '', 'Reservasi Playbox baru dari Andi Mappanyukki', '2025-03-30 16:38:42', 0, '2025-03-30 16:38:42', '2025-03-30 16:38:42'),
(8, 3, '', 'Reservasi Playbox baru dari Andi Mappanyukki 1', '2025-03-30 16:41:37', 0, '2025-03-30 16:41:37', '2025-03-30 16:41:37'),
(9, 5, 'OrderReady', 'Pesanan makanan baru #5', '2025-03-30 16:55:04', 0, '2025-03-30 16:55:04', '2025-03-30 16:55:04'),
(10, 4, '', 'Reservasi Playbox baru dari Andi Mappanyukki 2', '2025-03-30 16:56:29', 0, '2025-03-30 16:56:29', '2025-03-30 16:56:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` float NOT NULL,
  `subtotal` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `quantity`, `unit_price`, `subtotal`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 1, 8000, 8000, '2025-03-27 14:56:59', '2025-03-27 14:56:59'),
(2, 1, 3, 1, 10000, 10000, '2025-03-27 14:56:59', '2025-03-27 14:56:59'),
(3, 1, 6, 2, 4000, 8000, '2025-03-27 14:56:59', '2025-03-27 14:56:59'),
(4, 2, 4, 1, 25000, 25000, '2025-03-28 15:11:59', '2025-03-28 15:11:59'),
(5, 2, 5, 2, 5000, 10000, '2025-03-28 15:11:59', '2025-03-28 15:11:59'),
(6, 3, 4, 1, 25000, 25000, '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(7, 3, 8, 1, 15000, 15000, '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(8, 4, 1, 1, 12000, 12000, '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(9, 4, 4, 1, 25000, 25000, '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(10, 4, 2, 1, 8000, 8000, '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(11, 4, 5, 1, 5000, 5000, '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(12, 5, 1, 1, 12000, 12000, '2025-03-30 16:55:04', '2025-03-30 16:55:04'),
(13, 5, 4, 1, 25000, 25000, '2025-03-30 16:55:04', '2025-03-30 16:55:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `playboxes`
--

CREATE TABLE `playboxes` (
  `playbox_id` int(11) NOT NULL,
  `playbox_name` varchar(255) NOT NULL,
  `tv_size` varchar(255) NOT NULL,
  `ps4_model` varchar(255) NOT NULL,
  `controllers_count` int(11) DEFAULT 2,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` enum('Available','In Use','Maintenance','In Transit') DEFAULT 'Available',
  `location` varchar(255) DEFAULT NULL,
  `added_date` datetime DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `playboxes`
--

INSERT INTO `playboxes` (`playbox_id`, `playbox_name`, `tv_size`, `ps4_model`, `controllers_count`, `description`, `image_url`, `status`, `location`, `added_date`, `featured`, `createdAt`, `updatedAt`) VALUES
(1, 'playbox kenzie gaming', '32', 'PS4 Slim', 2, '', 'https://i.ibb.co.com/bMXkLhSL/id-11134207-7rasi-m2mk9t9x20g484.jpg', 'In Use', '', '2025-03-30 15:47:14', 0, '2025-03-30 15:47:14', '2025-03-30 16:42:12'),
(2, 'playbox kenzie gaming', '50', 'PS4 Pro', 2, '', 'https://i.ibb.co.com/bMXkLhSL/id-11134207-7rasi-m2mk9t9x20g484.jpg', 'In Use', '', '2025-03-30 16:37:18', 0, '2025-03-30 16:37:18', '2025-03-30 16:40:15'),
(3, 'playbox kenzie gaming 1', '35', 'PS4 Slim', 2, '', 'https://i.ibb.co.com/bMXkLhSL/id-11134207-7rasi-m2mk9t9x20g484.jpg', 'Available', '', '2025-03-30 16:55:44', 0, '2025-03-30 16:55:44', '2025-03-30 16:58:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `playbox_games`
--

CREATE TABLE `playbox_games` (
  `playbox_game_id` int(11) NOT NULL,
  `playbox_id` int(11) NOT NULL,
  `game_name` varchar(255) NOT NULL,
  `game_image_url` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `max_players` int(11) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_installed` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `playbox_reservations`
--

CREATE TABLE `playbox_reservations` (
  `reservation_id` int(11) NOT NULL,
  `playbox_id` int(11) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(255) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `booking_code` varchar(255) NOT NULL,
  `delivery_address` text NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `status` enum('Pending','Confirmed','In Preparation','In Transit','In Use','Returning','Completed','Cancelled') DEFAULT 'Pending',
  `total_amount` float NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` enum('Pending','Down Payment','Paid','Cancelled') DEFAULT 'Pending',
  `staff_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `playbox_reservations`
--

INSERT INTO `playbox_reservations` (`reservation_id`, `playbox_id`, `customer_name`, `customer_phone`, `customer_email`, `booking_code`, `delivery_address`, `start_time`, `end_time`, `actual_end_time`, `status`, `total_amount`, `payment_method`, `payment_status`, `staff_id`, `notes`, `created_at`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Andi Mappanyukki', '089 538 676 3040', 'spnbstore@gmail.com', 'PB-MNCPK', 'jalan lapawawoi kr sigeri', '2025-03-30 07:00:00', '2025-03-30 08:00:00', '2025-03-30 15:53:33', 'Completed', 50000, 'cash', 'Pending', 7, '\nsiap meluncur', '2025-03-30 15:48:49', '2025-03-30 15:48:49', '2025-03-30 15:53:33'),
(2, 2, 'Andi Mappanyukki', '089 538 676 3040', 'spnbstore@gmail.com', 'PB-GZS3D', 'jalan lapawawoi kr sigeri', '2025-03-30 17:00:00', '2025-03-30 18:00:00', NULL, 'In Use', 50000, 'cash', 'Pending', 7, 'mantap\noke laksanakan', '2025-03-30 16:38:42', '2025-03-30 16:38:42', '2025-03-30 16:40:15'),
(3, 1, 'Andi Mappanyukki 1', '089 538 676 3040', 'spnbstore@gmail.com', 'PB-75LYT', 'jalan lapawawoi kr sigeri', '2025-03-30 16:00:00', '2025-03-30 18:00:00', NULL, 'In Use', 100000, 'cash', 'Pending', 7, '', '2025-03-30 16:41:37', '2025-03-30 16:41:37', '2025-03-30 16:42:12'),
(4, 3, 'Andi Mappanyukki 2', '089 538 676 3040', 'spnbstore@gmail.com', 'PB-4JSBR', 'jalan lapawawoi kr sigeri', '2025-03-30 16:00:00', '2025-03-30 17:00:00', '2025-03-30 16:58:14', 'Completed', 50000, 'cash', 'Pending', 7, 'mantap', '2025-03-30 16:56:29', '2025-03-30 16:56:29', '2025-03-30 16:58:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pricing`
--

CREATE TABLE `pricing` (
  `price_id` int(11) NOT NULL,
  `device_type` enum('PS3','PS4','PS5') NOT NULL,
  `name` varchar(255) NOT NULL,
  `amount_per_hour` float NOT NULL,
  `package_amount` float DEFAULT NULL,
  `package_hours` int(11) DEFAULT NULL,
  `time_condition` enum('Weekday','Weekend','Holiday','Any') DEFAULT 'Any',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pricing`
--

INSERT INTO `pricing` (`price_id`, `device_type`, `name`, `amount_per_hour`, `package_amount`, `package_hours`, `time_condition`, `createdAt`, `updatedAt`) VALUES
(1, 'PS3', 'PS3 Standard Rate', 10000, NULL, NULL, 'Any', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(2, 'PS4', 'PS4 Standard Rate', 15000, NULL, NULL, 'Any', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(3, 'PS5', 'PS5 Standard Rate', 20000, NULL, NULL, 'Any', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(4, 'PS4', 'PS4 Weekend Rate', 18000, NULL, NULL, 'Weekend', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(5, 'PS5', 'PS5 Weekend Rate', 25000, NULL, NULL, 'Weekend', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(6, 'PS5', 'PS5 10 Hour Package', 0, 160000, 10, 'Any', '2025-03-29 14:26:59', '2025-03-29 14:26:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rental_sessions`
--

CREATE TABLE `rental_sessions` (
  `session_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `staff_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `actual_end_time` datetime DEFAULT NULL,
  `status` enum('Active','Completed','Cancelled') DEFAULT 'Active',
  `total_amount` float NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` enum('Pending','Paid','Cancelled') DEFAULT 'Pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rental_sessions`
--

INSERT INTO `rental_sessions` (`session_id`, `device_id`, `user_id`, `staff_id`, `start_time`, `end_time`, `actual_end_time`, `status`, `total_amount`, `payment_method`, `payment_status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 2, '2025-03-27 14:26:59', '2025-03-27 16:26:59', '2025-03-27 16:26:59', 'Completed', 30000, 'Cash', 'Paid', '2025-03-27 14:26:59', '2025-03-27 16:26:59'),
(2, 2, 2, 2, '2025-03-28 14:26:59', '2025-03-28 17:26:59', '2025-03-28 17:26:59', 'Completed', 60000, 'Cash', 'Paid', '2025-03-28 14:26:59', '2025-03-28 17:26:59'),
(3, 3, 3, 2, '2025-03-29 02:26:59', '2025-03-29 04:26:59', '2025-03-29 04:26:59', 'Completed', 30000, 'QRIS', 'Paid', '2025-03-29 02:26:59', '2025-03-29 04:26:59'),
(4, 3, NULL, 4, '2025-03-29 14:44:17', '2025-03-29 16:44:17', '2025-03-29 21:28:49', 'Completed', 30000, 'cash', 'Paid', '2025-03-29 14:44:17', '2025-03-29 21:28:49'),
(5, 1, NULL, 4, '2025-03-29 14:45:50', '2025-03-29 15:45:50', '2025-03-29 21:28:49', 'Completed', 15000, 'cash', 'Paid', '2025-03-29 14:45:50', '2025-03-29 21:28:49'),
(6, 1, NULL, 7, '2025-03-29 21:40:07', '2025-03-29 21:46:07', '2025-03-29 21:46:08', 'Completed', 1500, 'dana', 'Paid', '2025-03-29 21:40:07', '2025-03-29 21:46:08'),
(7, 2, NULL, 7, '2025-03-29 21:43:16', '2025-03-29 21:55:16', '2025-03-29 21:55:17', 'Completed', 4000, 'ovo', 'Paid', '2025-03-29 21:43:16', '2025-03-29 21:55:17'),
(8, 1, NULL, 7, '2025-03-29 21:46:54', '2025-03-29 21:52:54', '2025-03-29 21:52:55', 'Completed', 1500, 'dana', 'Paid', '2025-03-29 21:46:54', '2025-03-29 21:52:55'),
(9, 1, NULL, 7, '2025-03-30 16:36:42', '2025-03-30 17:36:42', NULL, 'Active', 15000, 'cash', 'Paid', '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(10, 2, NULL, 7, '2025-03-30 16:55:04', '2025-03-30 18:55:04', NULL, 'Active', 40000, 'dana', 'Paid', '2025-03-30 16:55:04', '2025-03-30 16:55:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `shifts`
--

CREATE TABLE `shifts` (
  `shift_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `opening_balance` float NOT NULL DEFAULT 0,
  `closing_balance` float DEFAULT NULL,
  `total_sales` float DEFAULT NULL,
  `status` enum('Active','Closed') DEFAULT 'Active',
  `notes` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `shifts`
--

INSERT INTO `shifts` (`shift_id`, `staff_id`, `start_time`, `end_time`, `opening_balance`, `closing_balance`, `total_sales`, `status`, `notes`, `createdAt`, `updatedAt`) VALUES
(1, 2, '2025-03-29 10:26:59', NULL, 500000, NULL, 175000, 'Active', NULL, '2025-03-29 10:26:59', '2025-03-29 14:26:59'),
(2, 4, '2025-03-29 14:42:39', '2025-03-29 14:44:47', 25000, 306666, 30000, 'Closed', '', '2025-03-29 14:42:39', '2025-03-29 14:44:47'),
(3, 4, '2025-03-29 14:45:02', '2025-03-29 15:56:26', 100000, 200000, 55000, 'Closed', '', '2025-03-29 14:45:02', '2025-03-29 15:56:26'),
(4, 7, '2025-03-29 21:03:03', '2025-03-30 12:06:18', 500000, 850000, 7000, 'Closed', '', '2025-03-29 21:03:03', '2025-03-30 12:06:18'),
(5, 7, '2025-03-30 16:35:57', '2025-03-30 16:58:54', 1000000, 1000000, 142000, 'Closed', '', '2025-03-30 16:35:57', '2025-03-30 16:58:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('Admin','Cashier','Owner') NOT NULL,
  `username` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `staff`
--

INSERT INTO `staff` (`staff_id`, `name`, `role`, `username`, `password_hash`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', 'Admin', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:39:59'),
(2, 'Kasir', 'Cashier', 'kasir', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:39:59'),
(3, 'Pemilik', 'Owner', 'owner', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:39:59'),
(4, 'Spnb123', 'Owner', 'spnb', '$2b$10$eEKp9UOj07UX8AvugNnukeq/OQgKucXAjRiy9F2MyOp70K1NET8RK', 'Active', '2025-03-29 14:04:44', '2025-03-29 16:09:33'),
(5, 'adminspnb', 'Cashier', 'admin123', '$2b$10$stT06oLvogJ32B/554w99uIEwKP3cL/AWt2qyyBz1p3LNWIIfebuu', 'Active', '2025-03-29 14:59:17', '2025-03-29 14:59:17'),
(6, 'adminspnb', 'Cashier', 'admin1234', '$2b$10$oPj/uAChiVw4DQRGRI8wQ.KmiQ3calEH24TZY3O8591OqYxsXcROC', 'Active', '2025-03-29 15:00:19', '2025-03-29 15:00:19'),
(7, 'Admin Owner 1', 'Owner', 'andispnb', '$2b$10$Ye4Yxu.Tv6yHOoNZu1IHvuI.vj92cXbpXss/MWzIknAUAjPnCiBOS', 'Active', '2025-03-29 16:04:06', '2025-03-29 16:04:06');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `type` enum('Rental','Food','Other') NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `amount` float NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `transaction_time` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `shift_id`, `type`, `reference_id`, `amount`, `payment_method`, `transaction_time`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Rental', 1, 30000, 'Cash', '2025-03-27 14:26:59', '2025-03-27 14:26:59', '2025-03-27 14:26:59'),
(2, 1, 'Rental', 2, 60000, 'Cash', '2025-03-28 14:26:59', '2025-03-28 14:26:59', '2025-03-28 14:26:59'),
(3, 1, 'Rental', 3, 30000, 'QRIS', '2025-03-29 02:26:59', '2025-03-29 02:26:59', '2025-03-29 02:26:59'),
(4, 1, 'Food', 1, 20000, 'Cash', '2025-03-27 14:56:59', '2025-03-27 14:56:59', '2025-03-27 14:56:59'),
(5, 1, 'Food', 2, 35000, 'Cash', '2025-03-28 15:11:59', '2025-03-28 15:11:59', '2025-03-28 15:11:59'),
(6, 2, 'Rental', 4, 30000, 'cash', '2025-03-29 14:44:17', '2025-03-29 14:44:17', '2025-03-29 14:44:17'),
(7, 3, 'Rental', 5, 15000, 'cash', '2025-03-29 14:45:50', '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(8, 3, 'Food', 3, 40000, 'cash', '2025-03-29 14:45:50', '2025-03-29 14:45:50', '2025-03-29 14:45:50'),
(9, 4, 'Rental', 6, 1500, 'dana', '2025-03-29 21:40:08', '2025-03-29 21:40:08', '2025-03-29 21:40:08'),
(10, 4, 'Rental', 7, 4000, 'ovo', '2025-03-29 21:43:16', '2025-03-29 21:43:16', '2025-03-29 21:43:16'),
(11, 4, 'Rental', 8, 1500, 'dana', '2025-03-29 21:46:54', '2025-03-29 21:46:54', '2025-03-29 21:46:54'),
(12, 5, 'Rental', 9, 15000, 'cash', '2025-03-30 16:36:42', '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(13, 5, 'Food', 4, 50000, 'cash', '2025-03-30 16:36:42', '2025-03-30 16:36:42', '2025-03-30 16:36:42'),
(14, 5, 'Rental', 10, 40000, 'dana', '2025-03-30 16:55:04', '2025-03-30 16:55:04', '2025-03-30 16:55:04'),
(15, 5, 'Food', 5, 37000, 'dana', '2025-03-30 16:55:04', '2025-03-30 16:55:04', '2025-03-30 16:55:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `membership_id` varchar(255) DEFAULT NULL,
  `registration_date` datetime DEFAULT NULL,
  `reward_points` int(11) DEFAULT 0,
  `expiry_date` datetime DEFAULT NULL,
  `status` enum('Active','Expired','Blacklisted') DEFAULT 'Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`user_id`, `name`, `phone`, `email`, `membership_id`, `registration_date`, `reward_points`, `expiry_date`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Budi Santoso', '081234567890', 'budi@example.com', 'KG-0001', '2025-02-27 14:26:59', 150, '2026-02-27 14:26:59', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(2, 'Siti Rahayu', '089876543210', 'siti@example.com', 'KG-0002', '2025-03-09 14:26:59', 75, '2026-03-09 14:26:59', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(3, 'Ahmad Rizki', '087812345678', 'ahmad@example.com', 'KG-0003', '2025-03-14 14:26:59', 125, '2026-03-14 14:26:59', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(4, 'Dewi Lestari', '082198765432', 'dewi@example.com', 'KG-0004', '2025-03-19 14:26:59', 50, '2026-03-19 14:26:59', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:26:59'),
(5, 'Eko Prasetyo', '081356789012', 'eko@example.com', 'KG-0005', '2025-03-24 14:26:59', 25, '2026-03-24 14:26:59', 'Active', '2025-03-29 14:26:59', '2025-03-29 14:26:59');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`device_id`);

--
-- Indeks untuk tabel `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`item_id`);

--
-- Indeks untuk tabel `food_orders`
--
ALTER TABLE `food_orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indeks untuk tabel `playboxes`
--
ALTER TABLE `playboxes`
  ADD PRIMARY KEY (`playbox_id`);

--
-- Indeks untuk tabel `playbox_games`
--
ALTER TABLE `playbox_games`
  ADD PRIMARY KEY (`playbox_game_id`),
  ADD KEY `playbox_id` (`playbox_id`);

--
-- Indeks untuk tabel `playbox_reservations`
--
ALTER TABLE `playbox_reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD UNIQUE KEY `booking_code_2` (`booking_code`),
  ADD UNIQUE KEY `booking_code_3` (`booking_code`),
  ADD UNIQUE KEY `booking_code_4` (`booking_code`),
  ADD UNIQUE KEY `booking_code_5` (`booking_code`),
  ADD KEY `playbox_id` (`playbox_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indeks untuk tabel `pricing`
--
ALTER TABLE `pricing`
  ADD PRIMARY KEY (`price_id`);

--
-- Indeks untuk tabel `rental_sessions`
--
ALTER TABLE `rental_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indeks untuk tabel `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`shift_id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indeks untuk tabel `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `username_6` (`username`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `shift_id` (`shift_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `membership_id` (`membership_id`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `membership_id_2` (`membership_id`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `membership_id_3` (`membership_id`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `membership_id_4` (`membership_id`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `membership_id_5` (`membership_id`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `membership_id_6` (`membership_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `devices`
--
ALTER TABLE `devices`
  MODIFY `device_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `food_items`
--
ALTER TABLE `food_items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `food_orders`
--
ALTER TABLE `food_orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT untuk tabel `playboxes`
--
ALTER TABLE `playboxes`
  MODIFY `playbox_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `playbox_games`
--
ALTER TABLE `playbox_games`
  MODIFY `playbox_game_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `playbox_reservations`
--
ALTER TABLE `playbox_reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `pricing`
--
ALTER TABLE `pricing`
  MODIFY `price_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `rental_sessions`
--
ALTER TABLE `rental_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `shifts`
--
ALTER TABLE `shifts`
  MODIFY `shift_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `food_orders`
--
ALTER TABLE `food_orders`
  ADD CONSTRAINT `food_orders_ibfk_11` FOREIGN KEY (`session_id`) REFERENCES `rental_sessions` (`session_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `food_orders_ibfk_12` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_11` FOREIGN KEY (`order_id`) REFERENCES `food_orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_12` FOREIGN KEY (`item_id`) REFERENCES `food_items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `playbox_games`
--
ALTER TABLE `playbox_games`
  ADD CONSTRAINT `playbox_games_ibfk_1` FOREIGN KEY (`playbox_id`) REFERENCES `playboxes` (`playbox_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `playbox_reservations`
--
ALTER TABLE `playbox_reservations`
  ADD CONSTRAINT `playbox_reservations_ibfk_10` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `playbox_reservations_ibfk_9` FOREIGN KEY (`playbox_id`) REFERENCES `playboxes` (`playbox_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `rental_sessions`
--
ALTER TABLE `rental_sessions`
  ADD CONSTRAINT `rental_sessions_ibfk_16` FOREIGN KEY (`device_id`) REFERENCES `devices` (`device_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rental_sessions_ibfk_17` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `rental_sessions_ibfk_18` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`shift_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
