#First, try to get the data from the URL:
#only 3 sites are currently updating with current precipitation data:
#only 10 sites are updating with any precip data at all
#All sites are included in the URL in case they begin reporting again in the future.
#http://waterdata.usgs.gov/nwis/dv?referred_module=sw&multiple_site_no=040851325,04085119,04078500,441546088082001,441624088045601&cb_00045=on&begin_date=2003-01-01&format=rdb%22

import urllib2 #imports the module to fetch data from the web. urllib2 is updated version of urllib.
import csv #work with csv files
import re #matching tool
from itertools import groupby #allows us to use keywords 

#newData gets the data and saves it as a variable. 
newData = urllib2.urlopen("http://waterdata.usgs.gov/nwis/dv?referred_module=sw&multiple_site_no=434625088284900%2C04085108%2C04085046%2C04084911%2C04084038%2C04074548%2C04073970%2C434451088272300%2C04085068%2C04074950%2C04073468%2C04072150%2C040851325%2C04085119%2C04078500%2C441546088082001%2C441624088045601&cb_00045=on&begin_date=2003-01-01&format=rdb").read() 

def getData(x): #writes the contents of newData into a .txt file
    writeData = open('USGS_RawPrecipData.txt', 'w') 
    writeData.write(x) 
    writeData.close #always need to close the write command.

def trimData(): #searches testdata.txt for lines that start with USGS and writes them to a new file (this is the data we need.)
    USGSData = open('USGS_RawPrecipData.txt', 'r')
    with open('trimmedPrecipData.txt', 'w') as out: 
        for line in USGSData: 
            if re.match("USGS", line):
                out.write(line)
            
def csvConversion(): #converts the data from a tab delimited text file into a .csv file
    txtData = r"trimmedPrecipData.txt"
    csvData = r"csvPrecipData.csv"
    in_txt = csv.reader(open(txtData, "rb"), delimiter = '\t')
    out_csv = csv.writer(open(csvData, "wb"))
    out_csv.writerows(in_txt)

def splitCsv(): #groups the contents of the .csv file based on the contents of row 1 (stationID) and then writes a new file with the station ID as the name, and only date and flow values contained within.
    for key, rows in groupby(csv.reader(open("csvPrecipData.csv")), lambda row: row[1]):
        with open("C:\Apache24\htdocs\hydrologic\data\precip\%s.csv" % key, "wb") as output: #this is where you can define the output directory. It runs from the relative path from the current directory, though, you can put an absolute path in if you want. I currently have the new files being made in the directory I called "split": ./split/*.csv
            wtr = csv.writer( output )
            for r in rows:
                wtr.writerow( (r[2], r[3]) )
                
getData(newData)
trimData()
csvConversion()
splitCsv()

