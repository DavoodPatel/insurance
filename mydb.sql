-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: med_insurance
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `doctor`
--

DROP TABLE IF EXISTS `doctor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctor`
--

LOCK TABLES `doctor` WRITE;
/*!40000 ALTER TABLE `doctor` DISABLE KEYS */;
INSERT INTO `doctor` VALUES (1,'Dr. Anwar','anwar@gmail.com','1234','2025-06-26 10:14:35');
/*!40000 ALTER TABLE `doctor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr`
--

DROP TABLE IF EXISTS `hr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr`
--

LOCK TABLES `hr` WRITE;
/*!40000 ALTER TABLE `hr` DISABLE KEYS */;
INSERT INTO `hr` VALUES (1,'Anwar','Anwar@example.com','test1234','2025-06-26 10:24:27'),(3,'Davood','davoodpatelp@gmail.com','8105','2025-06-26 12:32:42');
/*!40000 ALTER TABLE `hr` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance_claims`
--

DROP TABLE IF EXISTS `insurance_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurance_claims` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(15) NOT NULL,
  `name` varchar(100) NOT NULL,
  `hospital_name` varchar(150) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance_claims`
--

LOCK TABLES `insurance_claims` WRITE;
/*!40000 ALTER TABLE `insurance_claims` DISABLE KEYS */;
INSERT INTO `insurance_claims` VALUES (1,'00000000000','Arbaz','Patel Clinic',2000.00,'2025-06-30','fever','2025-07-01 11:39:22'),(2,'+918884088400','Gopi','Patel Clinic',2000.00,'2025-06-30','Fever','2025-07-01 12:37:35');
/*!40000 ALTER TABLE `insurance_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `package_type` enum('single','family') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (2,'Premium ','All The Family Health Related issues cost will recover','family',3999.00,'2025-06-26 10:20:11'),(3,'Individual','Health Issue Money','single',1999.00,'2025-06-26 10:43:29');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `mobile_no` varchar(15) NOT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `address` text NOT NULL,
  `no_of_others` text DEFAULT NULL,
  `others_names` text DEFAULT NULL,
  `referred_by` varchar(100) DEFAULT NULL,
  `package_name` varchar(100) DEFAULT NULL,
  `package_type` enum('single','family') DEFAULT NULL,
  `package_amount` decimal(10,2) DEFAULT NULL,
  `payment_mode` enum('cash','online') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mobile_no` (`mobile_no`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (5,'Arbaz','00000000000','asd','fgh','Amma plaza','2','[], abcd','Anwar','Premium ','family',4149.00,'cash','2025-06-26 11:28:02'),(6,'Patel','1111111111','','','Yalawar','0','[]','Anwar','Individual','single',1999.00,'cash','2025-06-26 11:36:36'),(8,'Patel','123456789','','','malagala','0','[]','Davood','Individual','single',1999.00,'cash','2025-06-26 12:34:46'),(9,'Khaja Patel','99009900','','','malagala','0','[]','Davood','Individual','single',1999.00,'online','2025-06-26 12:38:48'),(10,'Habib','1231231230','asd','fgh','malagala','0','[]','Davood','Premium ','family',3999.00,'online','2025-06-26 12:43:40'),(11,'Peersab','147852369','','','malagala','0','[]','Davood','Individual','single',1999.00,'cash','2025-06-26 12:49:30'),(12,'Imran','654123','asdf','asdf','malagala','2','[\"xyz\",\"yzx\"]','Davood','Premium ','family',3999.00,'online','2025-06-26 12:53:00'),(17,'Peersab','1478569','peer','sab','malagala','1','[\"asd\"]','Davood','Premium ','family',3999.00,'cash','2025-06-26 13:49:15'),(18,'Davood Davood Patel Patel','08296067734','qwe','we','Amma plaza\nMalagala\nNagarBhavi 2nd STage','2','[]','Anwar','Premium ','family',3999.00,'online','2025-06-26 14:16:18'),(19,'Davood ','08296067733','qwe','we','malagala','1','[\"asd\"]','Anwar','Premium ','family',3999.00,'cash','2025-06-26 14:22:26'),(20,'Ibrahim','213213213','','','Gulbarga','0','[]','Davood','Individual','single',1999.00,'cash','2025-06-26 14:25:14'),(21,'Davood ','08296067732','qwe','we','malagala','0','[]','Anwar','Premium ','family',3999.00,'cash','2025-06-26 14:26:47'),(22,'Ibrahim','147852','','','aasfg','0','[]','Davood','Individual','single',1999.00,'cash','2025-06-26 14:29:42'),(23,'Ibrahim','1478523','','','malagala','0','[]','Davood','Individual','single',1999.00,'online','2025-06-26 14:34:01'),(25,'Gopi','+917892825793','','','malagala','0','[]','Anwar','Individual','single',1999.00,'online','2025-07-01 11:46:06'),(26,'Gopi','+918884088400','Abcd','fghj','Amma plaza\nMalagala\nNagarBhavi 2nd STage','3','[], Abcd, cfgh','Davood','Premium','family',4299.00,'cash','2025-07-01 12:34:45');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-27 15:06:57
