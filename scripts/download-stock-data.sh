#!/bin/bash -e

# set -x

timestamp=$(date +%s)

while IFS="" read -r symbol || [ -n "$symbol" ]
do
	echo "Downloading $symbol stock data"
	curl --location --request GET "https://www.pse.com.ph/stockMarket/companyInfoCharts.html?method=getAnyStockStockData&symbol=$symbol" --header 'Referer: http://www.pse.com.ph/stockMarket/home.html' --header 'X-Requested-With: ShockwaveFlash/32.0.0.453' --header 'Cookie: JSESSIONID=dd3801089fa0ac1d6cabfd2e25cb4da2dd7b2854c3e1b1b041cb8a8b08a6cfe3.e38NbNeRbx0Pa40Lc3mMa3qQah4Oe0' -o $symbol.$timestamp.csvz
	sleep 30
done < symbols.txt
