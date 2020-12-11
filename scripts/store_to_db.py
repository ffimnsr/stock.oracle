import pandas
import numpy as np
import mysql.connector
import glob, os
from pypika import MySQLQuery, Table, Field


def store(file_path, c):
	symbol = file_path.split(".")[0]
	print('Copying stock {} data to database'.format(symbol))
	eod_stock_data = Table('eod_stock_data')
	df = pandas.read_csv(file_path, parse_dates=['Date'], header=0, names=['Date', 'Open', 'High', 'Low', 'Close', 'Volume'])
	for i, stock in df.iterrows():
		q = MySQLQuery.into(eod_stock_data).columns('date', 'open', 'high', 'low', 'close', 'volume', 'symbol').insert(stock[0], stock[1], stock[2], stock[3], stock[4], stock[5], symbol)
		c.execute(str(q))

	client.commit()


client = mysql.connector.connect(
	host="127.0.0.1",
	port=3306,
	user="fourwfhj_pse_stocks",
	password="kEZxVcHhkDBoLGgILRQ1",
	database="fourwfhj_pse_stocks")

cursor = client.cursor()

cursor.execute("SELECT CURDATE()")
row = cursor.fetchone()
print("Current date is: {0}".format(row[0]))

for file in glob.glob('*.csv'):
	store(file, cursor)

cursor.close()
client.close()
