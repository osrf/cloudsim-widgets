#!/usr/bin/env bash


#
# this script uses the preciouscloudsim@gmail.com token to get all the prius cup instances
# and their state
#

curl -X GET --header 'Accept: application/json' --header 'authorization: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0aWVzIjpbInByZWNpb3VzY2xvdWRzaW1AZ21haWwuY29tIiwicHJlY2lvdXMiXSwiaWF0IjoxNDg2NzcxNzkwfQ.SzZCv7JtECNkw8zluq90XFNZq98GERKLmrc03AaiJ_zRdCNMf0SroXumUOj6f9AG7BXsHyXZEk5M2U5ShNky_g' 'https://portal.cloudsim.io/simulators' > sims.json

#
# report.js extracts useful information
#
node report.js
