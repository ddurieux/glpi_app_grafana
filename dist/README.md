# GLPI app for Grafana

## Introduction

This application get information in GLPI (Gestion Libre de Parc Informatique) through the REST API added in
version 9.1. You will be able have graphs, singlestat, tables... of your data (tickets, devices, users...).

## screenshot

This is an example:

![screenshot1](https://raw.githubusercontent.com/ddurieux/glpi_app_grafana/master/screenshot1.png)

## Datasource

For the datasource GLPI, you will need:

* URL of the GLPI API (like http://127.0.0.1/glpi/apirest.php)
* the App-token, you can generate and get it in GLPI in the menu Setup > General > API
* the User token, you can generate and get it in your account/preferences page in GLPI

## Dashboard

There is an example of dashboard. You can install and use it.

Create a new panel and after edit it.
Add a new Query with your GLPI datasource.

The configuration will require:

* Query: do a search into GLPI and copy paste the URL here
* Alias: the alias name of this query, it will appear in the panel
* Timerange based on: define on what GLPI date field you will get the data. This field is used by the timerange defined in top of grafana
* Is it a table?: if the panel is a Table, select yes, otherwise keep to no

If it's a table, you can define the columns to get:

* Column A: the GLPI field/column to have
* Column A alias: the name of the column if don't want the name get from GLPI

same for column B, C, D, E and F


## Bugs / features

If you have bug or request features, you can open issues in the [github repository](https://github.com/ddurieux/glpi_app_grafana)

## Professional support

Do you need professional support, training, others?

Please contact the [DCS company](https://www.dcsit-group.com/) / send a mail to [dcs.glpi@dcsit-group.com](mailto:dcs.glpi@dcsit-group.com)

