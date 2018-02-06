# GLPI app for Grafana

## Introduction

This application gets information in GLPI (Gestion Libre de Parc Informatique) thanks to the REST API added in
version 9.1. You will be able to have graphs, singlestat, tables... of your data (tickets, devices, users...).

## screenshot

This is an example:

![screenshot1](https://raw.githubusercontent.com/ddurieux/glpi_app_grafana/master/screenshot1.png)

## Datasource

For the GLPI datasource, you will need:

* the URL of the GLPI API (like http://127.0.0.1/glpi/apirest.php)
* the App-token, you can generate and get it in GLPI in the menu Setup > General > API
* the User token, you can generate and get it in the user account/preferences panel in GLPI

## Dashboard

It exists an example for dashboard. You can install and use it.

Create a new panel and then edit it.
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

If you have a bug repoort or request feature, you can open issues in the [github repository](https://github.com/ddurieux/glpi_app_grafana)

## Professional support

Do you need professional support, training, others?

Please contact the [DCS company](https://www.dcsit-group.com/) / send a mail to [dcs.glpi@dcsit-group.com](mailto:dcs.glpi@dcsit-group.com)


## Changelog

### 1.2.0

* fix #16: no more need to force grunt for rebuilding
* fix #17: fix error when receiving integer values not formated in strings
* fix some typos
* dev: allow to set/unset browser console log

### 1.1.0

* compatibility with GLPI 9.2
* autofill the field `Timerange based on` in the query
* when adding a new query, add by default a ticket query instead `undefined`
* get correct values in the tooltip when the mouse is hovering the graph
* enhance error message when defining the datasource
* add the possibility to have the count of elements by hour of the day with the panel `histogram`

### 1.0.0

First version