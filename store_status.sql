/*
SQLyog - Free MySQL GUI v5.15
Host - 5.7.14 : Database - poi
*********************************************************************
Server version : 5.7.14
*/

SET NAMES utf8;

SET SQL_MODE='';

create database if not exists `poi`;

USE `poi`;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

/*Table structure for table `google_poi` */

DROP TABLE IF EXISTS `google_poi`;

CREATE TABLE `google_poi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `csv_id` varchar(255) COLLATE utf8_bin NOT NULL,
  `location_lat` varchar(50) COLLATE utf8_bin NOT NULL,
  `location_lng` varchar(50) COLLATE utf8_bin NOT NULL,
  `north_east_lat` varchar(50) COLLATE utf8_bin NOT NULL,
  `north_east_lng` varchar(50) COLLATE utf8_bin NOT NULL,
  `south_west_lat` varchar(50) COLLATE utf8_bin NOT NULL,
  `south_west_lng` varchar(50) COLLATE utf8_bin NOT NULL,
  `icon` varchar(100) COLLATE utf8_bin NOT NULL,
  `id_G` varchar(100) COLLATE utf8_bin NOT NULL,
  `name` varchar(250) COLLATE utf8_bin NOT NULL,
  `photos_html_attributions` varchar(250) COLLATE utf8_bin NOT NULL,
  `place_id` varchar(50) COLLATE utf8_bin NOT NULL,
  `vicinity` varchar(250) COLLATE utf8_bin NOT NULL,
  `scope1` varchar(50) COLLATE utf8_bin NOT NULL,
  `rating` varchar(10) COLLATE utf8_bin NOT NULL,
  `types_0` varchar(50) COLLATE utf8_bin NOT NULL,
  `types_1` varchar(50) COLLATE utf8_bin NOT NULL,
  `types_2` varchar(50) COLLATE utf8_bin NOT NULL,
  `types_3` varchar(50) COLLATE utf8_bin NOT NULL,
  `types_4` varchar(50) COLLATE utf8_bin NOT NULL,
  `types_5` varchar(50) COLLATE utf8_bin NOT NULL,
  `opening_hours` varchar(50) COLLATE utf8_bin NOT NULL,
  `Seq` varchar(255) COLLATE utf8_bin NOT NULL,
  `permanently_closed` varchar(255) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=616 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

SET SQL_MODE=@OLD_SQL_MODE;